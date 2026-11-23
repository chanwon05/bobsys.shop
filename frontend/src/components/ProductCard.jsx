import {useState} from "react";
import ProductPrices from "./ProductPrices";
import {imageSource} from "../services/api";
import {isSamplePage} from "../data/catalog";

function ProductCard({product}) {
  const sample = isSamplePage(product.category?.pagePath);
  const [failedUrl, setFailedUrl] = useState(null);
  return (
    <article className="ProductCard">
      <div className="ProductCard-media">
        {product.imageUrl && failedUrl !== product.imageUrl ? (
          <img className="ProductCard-image" src={imageSource(product.imageUrl)} alt={product.name}
            loading="lazy" onError={() => setFailedUrl(product.imageUrl)} />
        ) : <div className="ProductCard-placeholder">이미지 준비 중</div>}
      </div>
      {!sample && <div className="ProductCard-body">
        <div className="ProductCard-heading">
          <h2>{product.name}</h2>
        </div>
        <ProductPrices product={product} />
        <p className="ProductCard-quantity">{product.quantity.toLocaleString("ko-KR")}장</p>
        {product.description && <p className="ProductCard-description">{product.description}</p>}
      </div>}
    </article>
  );
}

export default ProductCard;
