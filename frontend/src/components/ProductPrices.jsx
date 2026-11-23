function ProductPrices({product}) {
  const prices = [
    {label: "단면", value: product.singleSidePrice},
    {label: "양면", value: product.doubleSidePrice},
  ].filter((price) => price.value !== null && price.value !== undefined);

  return (
    <dl className="ProductCard-prices">
      {prices.map((price) => (
        <div key={price.label}>
          <dt>{prices.length === 1 ? "가격" : price.label}</dt>
          <dd>{Number(price.value).toLocaleString("ko-KR")}원</dd>
        </div>
      ))}
    </dl>
  );
}

export default ProductPrices;
