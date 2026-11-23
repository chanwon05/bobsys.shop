import useResource from "../hooks/useResource";
import ResourceMessage from "../components/ResourceMessage";

function AdminUsers() {
  const {data, loading, error, reload} = useResource("/admin/users");
  return (
    <>
      <div className="Catalog-heading"><h1>Users</h1><p>등록된 사용자 목록입니다.</p></div>
      <ResourceMessage loading={loading} error={error} onRetry={reload} />
      {!loading && !error && (data.length ? (
        <div className="Admin-table-wrap"><table className="Admin-table">
          <thead><tr><th>ID</th><th>이름</th><th>아이디</th></tr></thead>
          <tbody>{data.map((user) => <tr key={user.id}><td>{user.id}</td><td>{user.name}</td><td>{user.username || "-"}</td></tr>)}</tbody>
        </table></div>
      ) : <p className="Catalog-message">등록된 사용자가 없습니다.</p>)}
    </>
  );
}

export default AdminUsers;
