import useResource from "../hooks/useResource";
import ResourceMessage from "../components/ResourceMessage";

function Notices() {
  const {data, loading, error, reload} = useResource("/notices");
  return (
    <main className="Catalog Notice-page">
      <h1 className="Notice-page-title">공지사항</h1>
      <ResourceMessage loading={loading} error={error} onRetry={reload} />
      {!loading && !error && (data.length ? (
        <div className="Notice-board">
          {data.map((notice) => (
            <details className="Notice-article" key={notice.id}>
              <summary className="Notice-summary">
                <span className="Notice-label">공지</span>
                <span className="Notice-title">{notice.title}</span>
                <time dateTime={notice.createdAt}>{new Date(notice.createdAt).toLocaleDateString("sv-SE", {timeZone: "Asia/Seoul"})}</time>
                <span className="Notice-toggle" aria-hidden="true" />
              </summary>
              <p className="Notice-content">{notice.content}</p>
            </details>
          ))}
        </div>
      ) : <p className="Catalog-message">등록된 공지사항이 없습니다.</p>)}
    </main>
  );
}

export default Notices;
