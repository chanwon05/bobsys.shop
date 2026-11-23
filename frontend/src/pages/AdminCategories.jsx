import {useState} from "react";
import useResource from "../hooks/useResource";
import ResourceMessage from "../components/ResourceMessage";
import {catalogPages, isSamplePage} from "../data/catalog";
import {deleteCategory, saveCategory} from "../services/api";

const samplePages = catalogPages.filter((page) => isSamplePage(page.path));

function CategoryForm({category, pagePath, onPageChange, onSaved, onCancel}) {
  const [form, setForm] = useState({name: category?.name || "", description: category?.description || ""});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const change = (event) => setForm((current) => ({...current, [event.target.name]: event.target.value}));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("카테고리 이름을 입력해 주세요."); return; }
    setSaving(true);
    try {
      await saveCategory(category?.id, {...form, pagePath, name: form.name.trim()});
      onSaved();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="Admin-panel Admin-form" onSubmit={submit}>
      <h2>{category ? "카테고리 수정" : "카테고리 등록"}</h2>
      {error && <p className="Catalog-error" role="alert">{error}</p>}
      <fieldset disabled={saving}>
        <label>표시할 메뉴 페이지<select name="pagePath" value={pagePath} onChange={(event) => onPageChange(event.target.value)} required>
          <option value="">페이지 선택</option>
          {samplePages.map((page) => <option key={page.path} value={page.path}>{page.name}</option>)}
        </select></label>
        <label>이름<input name="name" value={form.name} onChange={change} required maxLength={100} /></label>
        <label>설명<textarea name="description" value={form.description} onChange={change} maxLength={500} rows={4} /></label>
        <div className="Admin-row-actions">
          <button className="Catalog-button" type="submit">{saving ? "저장 중…" : "카테고리 저장"}</button>
          {category && <button className="Catalog-button Catalog-button-secondary" type="button" onClick={onCancel}>취소</button>}
        </div>
      </fieldset>
    </form>
  );
}

function AdminCategories() {
  const {data, loading, error, reload} = useResource("/categories");
  const [editing, setEditing] = useState(null);
  const [pagePath, setPagePath] = useState("");
  const [formVersion, setFormVersion] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [mutationError, setMutationError] = useState("");
  const selectedPage = samplePages.find((page) => page.path === pagePath);
  const visibleCategories = (data || []).filter((category) => isSamplePage(category.pagePath) && (!pagePath || category.pagePath === pagePath));
  const reset = () => { setEditing(null); setFormVersion((current) => current + 1); };
  const remove = async (category) => {
    if (!window.confirm(`‘${category.name}’ 카테고리를 삭제할까요?`)) return;
    setMutationError("");
    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      if (editing?.id === category.id) reset();
      reload();
    } catch (failure) {
      setMutationError(failure.message);
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <>
      <div className="Catalog-heading"><h1>Category Management</h1><p>샘플 페이지를 선택하고 카테고리를 추가하세요. 저장 후에도 같은 페이지에 계속 등록할 수 있습니다.</p></div>
      <div className="Admin-category-layout">
        <CategoryForm key={editing?.id || `new-${formVersion}`} category={editing} pagePath={pagePath} onPageChange={setPagePath} onCancel={reset} onSaved={() => { reset(); reload(); }} />
        <section>
          <h2>{selectedPage ? `${selectedPage.name} 카테고리` : "전체 카테고리"}</h2>
          {mutationError && <p className="Catalog-error" role="alert">{mutationError}</p>}
          <ResourceMessage loading={loading} error={error} onRetry={reload} />
          {!loading && !error && (visibleCategories.length ? (
            <div className="Admin-table-wrap"><table className="Admin-table">
              <thead><tr><th>이름</th><th>페이지</th><th>설명</th><th>관리</th></tr></thead>
              <tbody>{visibleCategories.map((category) => <tr key={category.id}>
                <td>{category.name}</td><td>{samplePages.find((page) => page.path === category.pagePath)?.name || "미지정"}</td><td>{category.description}</td>
                <td><div className="Admin-row-actions">
                  <button className="Catalog-button Catalog-button-secondary" onClick={() => { setEditing(category); setPagePath(category.pagePath || ""); }}>수정</button>
                  <button className="Catalog-button Catalog-button-danger" disabled={deletingId !== null} onClick={() => remove(category)}>{deletingId === category.id ? "삭제 중…" : "삭제"}</button>
                </div></td>
              </tr>)}</tbody>
            </table></div>
          ) : <p className="Catalog-message">{selectedPage ? `${selectedPage.name}에 등록된 카테고리가 없습니다. 첫 카테고리를 추가해 주세요.` : "등록된 카테고리가 없습니다."}</p>)}
        </section>
      </div>
    </>
  );
}

export default AdminCategories;
