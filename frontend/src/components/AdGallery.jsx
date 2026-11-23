import {Link} from "react-router-dom";
import useResource from "../hooks/useResource";
import ResourceMessage from "./ResourceMessage";

function AdGallery() {
  const {data, loading, error, reload} = useResource("/notices");
  return (
    <section className="AdGallery" aria-label="갤러리, 공지사항 및 연락처">
      <div className="AdGallery-image-wrap">
        <img className="AdGallery-image" src="/images/갤러리.png" width="2720" height="1568"
          alt="거래금액의 10% 적립, 포인트 1년에 20만원 이상 적립 가능. 밥시스 회원가입 안내: www.bobsys.co.kr" />
        <a className="AdGallery-site-link" href="http://www.bobsys.co.kr" aria-label="www.bobsys.co.kr 사이트로 이동" />
      </div>
      <div className="AdGallery-notices">
        <div className="Notice-heading"><h2>공지사항</h2><Link to="/notice">전체 보기 →</Link></div>
        <ResourceMessage loading={loading} error={error} onRetry={reload} />
        {!loading && !error && (data.length ? (
          <div className="Notice-board Notice-preview">
            {data.slice(0, 5).map((notice) => <details className="Notice-article" key={notice.id}>
              <summary className="Notice-summary">
                <span className="Notice-label">공지</span>
                <span className="Notice-title">{notice.title}</span>
                <time dateTime={notice.createdAt}>{new Date(notice.createdAt).toLocaleDateString("sv-SE", {timeZone: "Asia/Seoul"})}</time>
                <span className="Notice-toggle" aria-hidden="true" />
              </summary>
              <p className="Notice-content">{notice.content}</p>
            </details>)}
          </div>
        ) : <p className="Catalog-message">등록된 공지사항이 없습니다.</p>)}
      </div>
      <div className="AdGallery-contact">
        <p><a href="tel:0432777767"><strong>T. </strong>043-277-7767</a> · <a href="tel:01044135033">010-4413-5033</a> · <strong>E.</strong> <a href="mailto:bobsys7@naver.com">bobsys7@naver.com</a></p>
        <p><strong>웹하드.</strong> incj5689 / 1234 · <strong> 영업시간. </strong> 평일 09:00 ~ 18:00 (토, 일, 공휴일 휴무)</p>
        <p>농협 310-02-209487 예금주:서복현</p>
      </div>
    </section>
  );
}

export default AdGallery;
