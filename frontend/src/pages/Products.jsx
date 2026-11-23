import {useSearchParams} from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ResourceMessage from "../components/ResourceMessage";
import useResource from "../hooks/useResource";
import {catalogPages} from "../data/catalog";

function Products({pagePath, title = "전체 상품"}) {
  const page = catalogPages.find((item) => item.path === pagePath);
  const products = useResource("/products");
  const categories = useResource("/categories");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageCategories = (categories.data || []).filter((category) => !pagePath || category.pagePath === pagePath);
  const requestedCategory = searchParams.get("category") || "";
  const categoryId = pageCategories.some((category) => String(category.id) === requestedCategory) ? requestedCategory : "";
  const filtered = (products.data || []).filter((product) =>
    (!pagePath || product.category?.pagePath === pagePath) && (!categoryId || String(product.category?.id) === categoryId));
  const loading = products.loading || categories.loading;
  const error = products.error || categories.error;
  const [bannerX, bannerY, bannerWidth, bannerHeight] = page?.bannerRegion || [];
  const selectCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("category", id);
    else next.delete("category");
    setSearchParams(next);
  };

  return (
    <main className="Catalog" aria-label={title}>
      {page?.banner && (
        <div className="Catalog-banner">
          <img src={page.banner} alt={`${page.name} 배너`} style={page.bannerRegion ? {
            width: `${10791 / bannerWidth * 100}%`,
            height: `${3311 / bannerHeight * 100}%`,
            left: `${-bannerX / bannerWidth * 100}%`,
            top: `${-bannerY / bannerHeight * 100}%`,
          } : {width: "100%", height: "100%", objectFit: "fill"}} />
        </div>
      )}
      <ResourceMessage loading={loading} error={error} onRetry={() => { products.reload(); categories.reload(); }} />
      {!loading && !error && (
        <>
          <div className="Catalog-category-buttons" role="group" aria-label="상품 카테고리">
            <button type="button" aria-pressed={!categoryId} onClick={() => selectCategory("")}>전체</button>
            {pageCategories.map((category) => (
              <button key={category.id} type="button" aria-pressed={categoryId === String(category.id)}
                onClick={() => selectCategory(String(category.id))}>{category.name}</button>
            ))}
          </div>
          <p className="Catalog-count" aria-live="polite">{filtered.length}개의 상품</p>
          <div className="ProductGrid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          {filtered.length === 0 && <p className="Catalog-message">표시할 상품이 없습니다.</p>}
        </>
      )}
    </main>
  );
}

export default Products;
