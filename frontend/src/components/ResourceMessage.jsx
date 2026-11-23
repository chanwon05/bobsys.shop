function ResourceMessage({loading, error, onRetry}) {
  if (loading) return <p className="Catalog-message" role="status">불러오는 중입니다…</p>;
  if (error) return (
    <div className="Catalog-message Catalog-error" role="alert">
      <p>{error}</p>
      {onRetry && <button type="button" onClick={onRetry}>다시 시도</button>}
    </div>
  );
  return null;
}

export default ResourceMessage;
