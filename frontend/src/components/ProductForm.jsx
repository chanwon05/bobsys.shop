import {useEffect, useState} from "react";
import {imageSource, uploadImage} from "../services/api";
import {catalogPages, isSamplePage} from "../data/catalog";

function ProductForm({categories, initialProduct, onSubmit, sampleMode = false}) {
  const label = sampleMode ? "샘플" : "상품";
  const pages = catalogPages.filter((page) => isSamplePage(page.path) === sampleMode);
  const [pagePath, setPagePath] = useState(initialProduct?.pagePath || initialProduct?.category?.pagePath || "");
  const pageCategories = categories.filter((category) => category.pagePath === pagePath);
  const [form, setForm] = useState({
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    quantity: initialProduct?.quantity ?? 1,
    singleSidePrice: initialProduct?.singleSidePrice ?? "",
    doubleSidePrice: initialProduct?.doubleSidePrice ?? "",
    imageUrl: initialProduct?.imageUrl || "",
    categoryId: initialProduct?.category?.id || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("JPG 또는 PNG 이미지 파일을 5MB 이하로 선택해 주세요.");
      event.target.value = "";
      return;
    }
    setError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  const change = (event) => setForm((current) => ({...current, [event.target.name]: event.target.value}));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!pagePath || (sampleMode && !pageCategories.some((category) => String(category.id) === String(form.categoryId)))) {
      setError(sampleMode ? "페이지와 해당 페이지의 카테고리를 선택해 주세요." : "페이지를 선택해 주세요.");
      return;
    }
    if (!sampleMode && form.singleSidePrice === "" && form.doubleSidePrice === "") {
      setError("가격을 최소 하나 입력해 주세요.");
      return;
    }
    if (!form.name.trim()) {
      setError(`${label}명을 입력해 주세요.`);
      return;
    }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        imageUrl = uploaded.imageUrl;
        setForm((current) => ({...current, imageUrl}));
        setImageFile(null);
        setPreviewUrl("");
      }
      await onSubmit({
        ...form,
        imageUrl,
        name: form.name.trim(),
        quantity: Number(form.quantity),
        pagePath,
        categoryId: sampleMode ? Number(form.categoryId) : null,
        singleSidePrice: sampleMode || form.singleSidePrice === "" ? null : Number(form.singleSidePrice),
        doubleSidePrice: sampleMode || form.doubleSidePrice === "" ? null : Number(form.doubleSidePrice),
      });
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="Admin-panel Admin-form" onSubmit={submit}>
      {error && <p className="Catalog-error" role="alert">{error}</p>}
      <fieldset disabled={saving}>
        <div className="Admin-form-grid">
          <label>{label}명<input name="name" value={form.name} onChange={change} maxLength={200} required /></label>
          <label>페이지<select value={pagePath} onChange={(event) => {
            setPagePath(event.target.value);
            setForm((current) => ({...current, categoryId: ""}));
          }} required>
            <option value="">페이지 선택</option>
            {pages.map((page) => <option key={page.path} value={page.path}>{page.name}</option>)}
          </select></label>
          {sampleMode && <label>카테고리<select name="categoryId" value={form.categoryId} onChange={change} disabled={!pagePath || !pageCategories.length} required>
            <option value="">카테고리 선택</option>
            {pageCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select></label>}
          {!sampleMode && <>
          <label>기준 수량<input name="quantity" type="number" min="1" max="2147483647" step="1" value={form.quantity} onChange={change} required /></label>
          <label>기본 / 단면 가격 (원)<input name="singleSidePrice" type="number" min="0" max="999999999999" step="1" value={form.singleSidePrice} onChange={change} /></label>
          <label>양면 가격 (원, 선택)<input name="doubleSidePrice" type="number" min="0" max="999999999999" step="1" value={form.doubleSidePrice} onChange={change} /></label>
          </>}
        </div>
        {!sampleMode && <p className="Admin-hint">가격을 하나만 입력하면 ‘가격’, 둘 다 입력하면 ‘단면·양면’으로 표시합니다. 사용하지 않는 가격은 비워 두세요.</p>}
        <label>{label} 이미지<input name="imageFile" type="file" accept="image/jpeg,image/png" onChange={selectImage} aria-describedby="product-image-help" /></label>
        <p className="Admin-hint" id="product-image-help">JPG·PNG, 최대 5MB. 저장 시 업로드됩니다. 수정 시 새 파일을 선택하지 않으면 기존 이미지를 유지합니다.</p>
        {(previewUrl || form.imageUrl) && <img className="Admin-image-preview" src={previewUrl || imageSource(form.imageUrl)} alt="상품 이미지 미리보기" />}
        <label>{label} 설명<textarea name="description" value={form.description} onChange={change} rows={4} maxLength={5000} /></label>
        {sampleMode && pagePath && !pageCategories.length && <p role="status">선택한 페이지에 등록된 카테고리가 없습니다. 카테고리 관리에서 먼저 추가해 주세요.</p>}
        <button className="Catalog-button" type="submit" disabled={!pagePath || (sampleMode && !pageCategories.length)}>{saving ? "저장 중…" : `${label} 저장`}</button>
      </fieldset>
    </form>
  );
}

export default ProductForm;
