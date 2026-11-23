import useResource from "../hooks/useResource";
import ResourceMessage from "../components/ResourceMessage";
import {imageSource} from "../services/api";

function Portfolio() {
  const {data, loading, error, reload} = useResource("/portfolios");
  return (
    <main className="WebsitePage Portfolio-page" aria-label="포트폴리오">
      <img className="WebsitePage-banner" src="/images/포트폴리오.png" width="3285" height="591" alt="포트폴리오" />
      <ResourceMessage loading={loading} error={error} onRetry={reload} />
      {!loading && !error && (data.length ? (
        <div className="ProductGrid">
          {data.map((portfolio) => <article className="ProductCard" key={portfolio.id}>
            <div className="ProductCard-media">
              {portfolio.linkUrl ? (
                <a href={portfolio.linkUrl} target="_blank" rel="noopener noreferrer" aria-label={`${portfolio.name} 사이트 보기 (새 탭)`}>
                  <img className="ProductCard-image" src={imageSource(portfolio.imageUrl)} alt={portfolio.name} loading="lazy" />
                </a>
              ) : <img className="ProductCard-image" src={imageSource(portfolio.imageUrl)} alt={portfolio.name} loading="lazy" />}
            </div>
            <div className="ProductCard-body">
              <div className="ProductCard-heading"><h2>{portfolio.name}</h2></div>
              {portfolio.description && <p className="ProductCard-description">{portfolio.description}</p>}
            </div>
          </article>)}
        </div>
      ) : <p className="Catalog-message">등록된 포트폴리오가 없습니다.</p>)}
    </main>
  );
}

export default Portfolio;
