import {useState} from "react";

const plans = [
  {name: "심플형", price: "500,000원", pages: "8페이지 내외", duration: "5일 소요", admin: "미제공"},
  {name: "일반형", price: "1,000,000원", pages: "15페이지 내외", duration: "15일", admin: "제공"},
  {name: "주문제작형", price: "문의", pages: "문의", duration: "문의", admin: "제공"},
];

function Page() {
  const [selected, setSelected] = useState(0);
  const plan = plans[selected];
  const details = [
    {label: "제작비용", value: plan.price},
    {label: "작업분량", value: plan.pages},
    {label: "소요기간", value: plan.duration},
    {label: "관리자 모드", value: plan.admin},
    {label: "유지보수/호스팅", value: "문의"},
  ];

  return (
    <main className="WebsitePage">
      <img className="WebsitePage-banner" src="/images/홈페이지가격.png" width="3284" height="591" alt="홈페이지 가격" />
      <div className="WebsitePage-plans" role="group" aria-label="홈페이지 제작 유형">
        {plans.map((item, index) => (
          <button key={item.name} type="button" aria-pressed={selected === index}
            aria-controls="website-plan-details" onClick={() => setSelected(index)}>
            {item.name}
          </button>
        ))}
      </div>
      <dl className="WebsitePage-details" id="website-plan-details" aria-live="polite" aria-label={`${plan.name} 제작 안내`}>
        {details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}

export default Page;
