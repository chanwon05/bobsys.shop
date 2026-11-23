import {useState} from "react";
import useResource from "../hooks/useResource";
import {request} from "../services/api";
import ResourceMessage from "./ResourceMessage";

function NoticeForm({notice, onSaved, onCancel}) {
  const [title, setTitle] = useState(notice?.title || "");
  const [content, setContent] = useState(notice?.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) { setError("제목과 내용을 입력해 주세요."); return; }
    setSaving(true);
    try {
      await request(notice ? `/admin/notices/${notice.id}` : "/admin/notices", {
        method: notice ? "PUT" : "POST", body: JSON.stringify({title: title.trim(), content: content.trim()}),
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
      <h3>{notice ? "공지사항 수정" : "공지사항 등록"}</h3>
      {error && <p className="Catalog-error" role="alert">{error}</p>}
      <fieldset disabled={saving}>
        <label>공지 제목<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required /></label>
        <label>공지 내용<textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} maxLength={10000} required /></label>
        <div className="Admin-row-actions">
          <button className="Catalog-button" type="submit">{saving ? "저장 중…" : "공지사항 저장"}</button>
          {notice && <button className="Catalog-button Catalog-button-secondary" type="button" onClick={onCancel}>수정 취소</button>}
        </div>
      </fieldset>
    </form>
  );
}

function AdminNotices() {
  const {data, loading, error, reload} = useResource("/notices");
  const [editing, setEditing] = useState(null);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [message, setMessage] = useState("");
  const reset = () => { setEditing(null); setVersion((current) => current + 1); };
  const remove = async (notice) => {
    if (!window.confirm(`‘${notice.title}’ 공지사항을 삭제할까요?`)) return;
    setBusy(true);
    setMutationError("");
    setMessage("");
    try {
      await request(`/admin/notices/${notice.id}`, {method: "DELETE"});
      if (editing?.id === notice.id) reset();
      setMessage("공지사항을 삭제했습니다.");
      reload();
    } catch (failure) {
      setMutationError(failure.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="Admin-notices" aria-labelledby="Admin-notices-title">
      <h2 id="Admin-notices-title">공지사항 관리</h2>
      <p>목록에서 수정할 공지사항을 선택하거나 삭제할 수 있습니다.</p>
      {message && <p role="status">{message}</p>}
      <div className="Admin-notices-layout">
        <NoticeForm key={editing?.id || `new-${version}`} notice={editing} onCancel={reset}
          onSaved={() => { reset(); reload(); setMessage("공지사항을 저장했습니다."); }} />
        <div>
          <h3>등록된 공지사항</h3>
          {mutationError && <p className="Catalog-error" role="alert">{mutationError}</p>}
          <ResourceMessage loading={loading} error={error} onRetry={reload} />
          {!loading && !error && (data.length ? (
            <div className="Admin-table-wrap"><table className="Admin-table">
              <thead><tr><th>제목</th><th>등록일</th><th>관리</th></tr></thead>
              <tbody>{data.map((notice) => <tr key={notice.id}>
                <td>{notice.title}</td><td>{new Date(notice.createdAt).toLocaleDateString("ko-KR")}</td>
                <td><div className="Admin-row-actions">
                  <button className="Catalog-button Catalog-button-secondary" type="button" disabled={busy} onClick={() => { setEditing(notice); setMessage(""); setMutationError(""); }}>수정</button>
                  <button className="Catalog-button Catalog-button-danger" type="button" disabled={busy} onClick={() => remove(notice)}>삭제</button>
                </div></td>
              </tr>)}</tbody>
            </table></div>
          ) : <p className="Catalog-message">등록된 공지사항이 없습니다.</p>)}
        </div>
      </div>
    </section>
  );
}

export default AdminNotices;
