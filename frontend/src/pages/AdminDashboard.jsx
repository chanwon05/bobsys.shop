import {Link} from "react-router-dom";
import useResource from "../hooks/useResource";
import ResourceMessage from "../components/ResourceMessage";

function AdminDashboard() {
  const {data, loading, error, reload} = useResource("/admin/dashboard");
  const cards = [
    {key: "products", label: "상품·샘플", icon: "📦", path: "/admin/products"},
    {key: "categories", label: "카테고리", icon: "🗂️", path: "/admin/categories"},
    {key: "users", label: "이용자", icon: "👥", path: "/admin/users"},
  ];
  return (
    <>
      <div className="Catalog-heading"><h1></h1><p></p></div>
      <ResourceMessage loading={loading} error={error} onRetry={reload} />
      <div className="Admin-stats">
        {cards.map((card) => <Link className="Admin-stat" to={card.path} key={card.key}>
          <span aria-hidden="true">{card.icon}</span>
          <strong>{data?.[card.key] ?? "—"}</strong>
          <span>{card.label}</span>
        </Link>)}
      </div>
      <div className="Admin-actions">
        <section className="Admin-panel"><h2>포트폴리오 등록</h2><p>포트폴리오 이름·이미지·설명을 등록하세요.</p><Link className="Catalog-button" to="/admin/portfolios">포트폴리오 등록·관리</Link></section>
        <section className="Admin-panel"><h2>상품 관리</h2><p>상품을 등록하고 가격을 관리하세요.</p><Link className="Catalog-button" to="/admin/products">상품 관리</Link></section>
        <section className="Admin-panel"><h2>샘플 등록</h2><p>가격 없이 샘플 이미지와 설명을 등록하세요.</p><Link className="Catalog-button" to="/admin/samples/add">샘플 등록</Link> <Link className="Catalog-button Catalog-button-secondary" to="/admin/samples">샘플 관리</Link></section>
        <section className="Admin-panel"><h2>카테고리 관리</h2><p>상품 분류와 표시할 메뉴 페이지를 관리하세요.</p><Link className="Catalog-button" to="/admin/categories">카테고리 관리</Link></section>
      </div>
    </>
  );
}

export default AdminDashboard;
