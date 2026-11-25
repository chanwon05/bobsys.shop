import {useState} from "react";
import ProductPrices from "./ProductPrices";
import {imageSource} from "../services/api";
import {isSamplePage} from "../data/catalog";

function ProductCard({product}) {
  const sample = isSamplePage(product.pagePath || product.category?.pagePath);
  const [failedUrl, setFailedUrl] = useState(null);
  return (
    <article className={`ProductCard${sample ? "" : " ProductCard-priced"}`}>
      {!sample && <div className="ProductCard-body">
        <div className="ProductCard-heading">
          <h2>{product.name} <span className="ProductCard-quantity">· {product.quantity.toLocaleString("ko-KR")}장</span></h2>
        </div>
        {product.description && <p className="ProductCard-description">{product.description}</p>}
        <ProductPrices product={product} />
      </div>}
      <div className="ProductCard-media">
        {product.imageUrl && failedUrl !== product.imageUrl ? (
          <img className="ProductCard-image" src={imageSource(product.imageUrl)} alt={product.name}
            loading="lazy" onError={() => setFailedUrl(product.imageUrl)} />
        ) : <div className="ProductCard-placeholder">이미지 준비 중</div>}
      </div>
    </article>
  );
}

export default ProductCard;
