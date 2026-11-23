import {useEffect, useState} from "react";
import useResource from "../hooks/useResource";
import ResourceMessage from "../components/ResourceMessage";
import {imageSource, request, uploadImage} from "../services/api";

function PortfolioForm({portfolio, onSaved, onCancel}) {
  const [name, setName] = useState(portfolio?.name || "");
  const [description, setDescription] = useState(portfolio?.description || "");
  const [linkUrl, setLinkUrl] = useState(portfolio?.linkUrl || "");
  const [imageUrl, setImageUrl] = useState(portfolio?.imageUrl || "");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectImage = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/png"].includes(selected.type) || selected.size > 5 * 1024 * 1024) {
      setError("JPG 또는 PNG 이미지 파일을 5MB 이하로 선택해 주세요.");
      event.target.value = "";
      return;
    }
    setError("");
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) { setError("포트폴리오 이름을 입력해 주세요."); return; }
    if (linkUrl.trim()) {
      try {
        const url = new URL(linkUrl.trim());
        if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error();
      } catch {
        setError("http:// 또는 https://로 시작하는 올바른 연결 URL을 입력해 주세요.");
        return;
      }
    }
    if (!file && !imageUrl) { setError("이미지를 선택해 주세요."); return; }
    setSaving(true);
    try {
      let uploadedUrl = imageUrl;
      if (file) {
        const uploaded = await uploadImage(file);
        uploadedUrl = uploaded.imageUrl;
        setImageUrl(uploadedUrl);
        setFile(null);
        setPreviewUrl("");
      }
      await request(portfolio ? `/admin/portfolios/${portfolio.id}` : "/admin/portfolios", {
        method: portfolio ? "PUT" : "POST",
        body: JSON.stringify({name: name.trim(), description: description.trim(), imageUrl: uploadedUrl, linkUrl: linkUrl.trim()}),
      });
      onSaved();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="Admin-panel Admin-form" onSubmit={submit}>
      <h2>포트폴리오 {portfolio ? "수정" : "등록"}</h2>
      {error && <p className="Catalog-error" role="alert">{error}</p>}
      <fieldset disabled={saving}>
        <label>포트폴리오 이름<input value={name} onChange={(event) => setName(event.target.value)} maxLength={200} required /></label>
        <label>이미지 파일 등록<input type="file" accept="image/jpeg,image/png" onChange={selectImage} aria-describedby="portfolio-image-help" /></label>
        <p className="Admin-hint" id="portfolio-image-help">JPG·PNG, 최대 5MB. 수정 시 새 파일을 선택하지 않으면 기존 이미지를 유지합니다.</p>
        {(previewUrl || imageUrl) && <img className="Admin-image-preview" src={previewUrl || imageSource(imageUrl)} alt="포트폴리오 이미지 미리보기" />}
        <label>포트폴리오 설명<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={5000} /></label>
        <label>연결 URL (선택)<input type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" maxLength={2000} aria-describedby="portfolio-link-help" /></label>
        <p className="Admin-hint" id="portfolio-link-help">이미지를 클릭하면 입력한 사이트가 새 탭으로 열립니다. 비워 두면 링크 없이 표시됩니다.</p>
        <div className="Admin-row-actions">
          <button className="Catalog-button" type="submit">{saving ? "저장 중…" : "포트폴리오 저장"}</button>
          {portfolio && <button className="Catalog-button Catalog-button-secondary" type="button" onClick={onCancel}>수정 취소</button>}
        </div>
      </fieldset>
    </form>
  );
}

function AdminPortfolios() {
  const {data, loading, error, reload} = useResource("/portfolios");
  const [editing, setEditing] = useState(null);
  const [version, setVersion] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [mutationError, setMutationError] = useState("");
  const [message, setMessage] = useState("");
  const reset = () => { setEditing(null); setVersion((current) => current + 1); };
  const remove = async (portfolio) => {
    if (!window.confirm(`‘${portfolio.name}’ 포트폴리오를 삭제할까요?`)) return;
    setDeletingId(portfolio.id);
    setMutationError("");
    setMessage("");
    try {
      await request(`/admin/portfolios/${portfolio.id}`, {method: "DELETE"});
      if (editing?.id === portfolio.id) reset();
      reload();
      setMessage("포트폴리오를 삭제했습니다.");
    } catch (failure) {
      setMutationError(failure.message);
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <>
      <div className="Catalog-heading"><h1>포트폴리오 관리</h1><p>등록한 이름·이미지·설명은 포트폴리오 페이지에 표시됩니다.</p></div>
      {message && <p role="status">{message}</p>}
      <div className="Admin-category-layout">
        <PortfolioForm key={editing?.id || `new-${version}`} portfolio={editing} onCancel={reset}
          onSaved={() => { reset(); reload(); setMessage("포트폴리오를 저장했습니다."); }} />
        <section>
          <h2>등록된 포트폴리오</h2>
          {mutationError && <p className="Catalog-error" role="alert">{mutationError}</p>}
          <ResourceMessage loading={loading} error={error} onRetry={reload} />
          {!loading && !error && (data.length ? (
            <div className="Admin-table-wrap"><table className="Admin-table">
              <thead><tr><th>이름</th><th>관리</th></tr></thead>
              <tbody>{data.map((portfolio) => <tr key={portfolio.id}>
                <td>{portfolio.name}</td>
                <td><div className="Admin-row-actions">
                  <button className="Catalog-button Catalog-button-secondary" disabled={deletingId !== null} onClick={() => { setEditing(portfolio); setMessage(""); }}>수정</button>
                  <button className="Catalog-button Catalog-button-danger" disabled={deletingId !== null} onClick={() => remove(portfolio)}>{deletingId === portfolio.id ? "삭제 중…" : "삭제"}</button>
                </div></td>
              </tr>)}</tbody>
            </table></div>
          ) : <p className="Catalog-message">등록된 포트폴리오가 없습니다.</p>)}
        </section>
      </div>
    </>
  );
}

export default AdminPortfolios;
