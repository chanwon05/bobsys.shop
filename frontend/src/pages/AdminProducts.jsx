import {useState} from "react";
import {Link} from "react-router-dom";
import useResource from "../hooks/useResource";
import ResourceMessage from "../components/ResourceMessage";
import ProductPrices from "../components/ProductPrices";
import {deleteProduct} from "../services/api";
import {catalogPages, isSamplePage} from "../data/catalog";

function AdminProducts({sampleMode = false}) {
  const label = sampleMode ? "샘플" : "상품";
  const basePath = sampleMode ? "/admin/samples" : "/admin/products";
  const {data, loading, error, reload} = useResource("/admin/products");
  const [keyword, setKeyword] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const filtered = (data || []).filter((product) => isSamplePage(product.pagePath || product.category?.pagePath) === sampleMode
    && product.name.toLowerCase().includes(keyword.trim().toLowerCase()));

  const remove = async (product) => {
    if (!window.confirm(`‘${product.name}’ ${label}을 삭제할까요?`)) return;
    setMutationError("");
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      reload();
    } catch (failure) {
      setMutationError(failure.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="Catalog-heading Admin-heading">
        <div><h1>{sampleMode ? "Sample Management" : "Product Management"}</h1><p>{sampleMode ? "샘플 이미지와 설명을 관리하세요." : "상품과 가격을 관리하세요."}</p></div>
        <Link className="Catalog-button" to={`${basePath}/add`}>+ {label} 등록</Link>
      </div>
      <div className="Catalog-filters"><label>{label} 검색<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={`${label}명 검색`} /></label></div>
      {mutationError && <p className="Catalog-error" role="alert">{mutationError}</p>}
      <ResourceMessage loading={loading} error={error} onRetry={reload} />
      {!loading && !error && (filtered.length ? (
        <div className="Admin-table-wrap"><table className="Admin-table">
          <thead><tr><th>{label}</th><th>{sampleMode ? "카테고리" : "페이지"}</th>{!sampleMode && <><th>수량</th><th>가격</th></>}<th>관리</th></tr></thead>
          <tbody>{filtered.map((product) => <tr key={product.id}>
            <td><strong>{product.name}</strong><small>ID: {product.id}</small></td>
            <td>{sampleMode ? product.category?.name : catalogPages.find((page) => page.path === (product.pagePath || product.category?.pagePath))?.name}</td>
            {!sampleMode && <><td>{product.quantity}</td><td><ProductPrices product={product} /></td></>}
            <td><div className="Admin-row-actions">
              <Link className="Catalog-button Catalog-button-secondary" to={`${basePath}/edit/${product.id}`}>수정</Link>
              <button className="Catalog-button Catalog-button-danger" disabled={deletingId !== null} onClick={() => remove(product)}>{deletingId === product.id ? "삭제 중…" : "삭제"}</button>
            </div></td>
          </tr>)}</tbody>
        </table></div>
      ) : <p className="Catalog-message">표시할 {label}이 없습니다.</p>)}
    </>
  );
}

export default AdminProducts;
