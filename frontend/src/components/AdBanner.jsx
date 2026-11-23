import {useEffect, useState} from "react";

const ads = [
  {
    image: "/images/배너1.jpg",
    signupUrl: "http://www.bobsys.co.kr",
  },
  {
    image: "/images/배너2.jpg",
  },
  {
    image: "/images/배너3.jpg",
  },
  {
    image: "/images/배너4.jpg",
  },
  {
    image: "/images/배너5.jpg",
  }
];

const AdBanner = () => {
  const [adIndex, setAdIndex] = useState(0);
  const ad = ads[adIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ads.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.closest("input, textarea, select"))) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setAdIndex((prev) => (prev + 1) % ads.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onPrevious = () => {
    setAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const onNext = () => {
    setAdIndex((prev) => (prev + 1) % ads.length);
  };

  return (
    <aside className="AdBanner" aria-label="광고">
      {ad.image && (
        <div className="AdBanner-image-wrap">
          <img className="AdBanner-image" src={ad.image} alt="" />
          {ad.signupUrl && (
            <a className="AdBanner-signup" href={ad.signupUrl} aria-label="www.bobsys.co.kr 사이트로 이동" />
          )}
        </div>
      )}
      <div className="AdBanner-content">
        <button className="AdBanner-arrow" type="button" aria-label="이전 광고" onClick={onPrevious}>
          ‹
        </button>
        <span className="AdBanner-count" aria-live="polite" aria-atomic="true">{adIndex + 1} / {ads.length}</span>
        <button className="AdBanner-arrow" type="button" aria-label="다음 광고" onClick={onNext}>
          ›
        </button>
      </div>
    </aside>
  );
};

export default AdBanner;
