import Products from "./Products";

function Samples({title, pagePath}) {
  return <Products pagePath={pagePath} title={`${title} 샘플보기`} />;
}

export default Samples;
