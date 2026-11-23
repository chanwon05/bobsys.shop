const items = [
  {image: "intro_item1.png", text: "명함, 즉석명함, 스티커, 전봇대스티커, 포맥스스티커"},
  {image: "intro_item2.png", text: "포스터, 카다록, 대소봉투, 종이자석, 포스트잇, 라이타, 판촉물"},
  {image: "intro_item3.png", text: "일반현수막, 부동산현수막, 족자현수막, 배너, 펫배너"},
  {image: "intro_item4.png", text: "배너, 홈페이지제작"},
];

function About() {
  return (
    <main className="About-page">
      <h1>회사소개</h1>
      <img className="About-image" src="/images/about/intro_img.png" alt="BOBSYS 밥시스" />
      <div className="About-intro">
        <p>저희 밥시스는 1999년 설립한 이래로 저렴한 가격과 좋은 품질의 인쇄물을 목표로, 고객의 편에서 열심히 달려왔습니다.</p>
        <p>일찍이 홈페이지를 만들어 고객의 편의를 제공하였으며 2022년 홈페이지를 새로 만들며 배너를 클릭하면 포인트가 적립되고 명함(인쇄물,현수막) 평생공짜로 할수 있는 홈페이지(<a href="http://www.bobsys.co.kr">www.bobsys.co.kr</a>)을 운영중이며 이번에 기존 홈페이지 외에 하나 더 만들어 홈페이지 제작을 시작하고 기존의 인쇄물을 더 알리는 사이트를 운영하게 되었습니다.</p>
        <p>지금까지 밥시스를 사랑해주신 고객님들께 감사드리며 더 발전된 모습으로 보답하겠습니다.</p>
        <p>감사합니다.</p>
      </div>
      <p className="About-sign">밥시스 대표 <strong>서복현</strong></p>
      <section className="About-products" aria-labelledby="About-products-title">
        <h2 id="About-products-title">취급품목</h2>
        <ul className="About-items">
          {items.map((item) => (
            <li key={item.image}>
              <img src={`/images/about/${item.image}`} alt="" loading="lazy" />
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default About;
