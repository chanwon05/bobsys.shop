import {Link, Navigate, useNavigate, useParams} from "react-router-dom";
import ProductForm from "../components/ProductForm";
import ResourceMessage from "../components/ResourceMessage";
import useResource from "../hooks/useResource";
import {saveProduct} from "../services/api";
import {isSamplePage} from "../data/catalog";

function ProductEditor({id, sampleMode}) {
  const label = sampleMode ? "샘플" : "상품";
  const basePath = sampleMode ? "/admin/samples" : "/admin/products";
  const navigate = useNavigate();
  const categories = useResource("/categories");
  const product = useResource(id ? `/admin/products/${id}` : "/admin/products");
  const loading = (sampleMode && categories.loading) || product.loading;
  const error = (sampleMode && categories.error) || product.error;
  if (!loading && !error && id && isSamplePage(product.data.pagePath || product.data.category?.pagePath) !== sampleMode) {
    return <Navigate replace to={`/admin/${sampleMode ? "products" : "samples"}/edit/${id}`} />;
  }
  return (
    <>
      <div className="Catalog-heading"><h1>{label} {id ? "수정" : "등록"}</h1><Link to={basePath}>{label} 관리로 돌아가기</Link></div>
      <ResourceMessage loading={loading} error={error} onRetry={() => { categories.reload(); product.reload(); }} />
      {!loading && !error && <ProductForm sampleMode={sampleMode} categories={categories.data || []} initialProduct={id ? product.data : null}
        onSubmit={async (data) => { await saveProduct(id, data); navigate(basePath); }} />}
    </>
  );
}

function AdminProductEditor({sampleMode = false}) {
  const {id} = useParams();
  return <ProductEditor key={`${sampleMode}-${id || "new"}`} id={id} sampleMode={sampleMode} />;
}

export default AdminProductEditor;
