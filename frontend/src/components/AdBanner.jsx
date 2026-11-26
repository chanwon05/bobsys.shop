import {useEffect, useRef, useState} from "react";

const ads = [
  {
    image: "/images/배너5.jpg",
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
    image: "/images/배너1.jpg",
    signupUrl: "http://www.bobsys.co.kr",
  }
];

const AdBanner = () => {
  const [adIndex, setAdIndex] = useState(0);
  const touchStart = useRef(null);
  const suppressClickUntil = useRef(0);
  const ad = ads[adIndex];

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

  const onTouchStart = (event) => {
    suppressClickUntil.current = 0;
    touchStart.current = event.touches.length === 1
      ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;
  };

  const onTouchMove = (event) => {
    if (!touchStart.current) return;
    if (event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    const dx = Math.abs(event.touches[0].clientX - touchStart.current.x);
    const dy = Math.abs(event.touches[0].clientY - touchStart.current.y);
    if (dy > 10 && dy > dx) touchStart.current = null;
  };

  const onTouchEnd = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || event.touches.length || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy) * 1.3) return;
    suppressClickUntil.current = Date.now() + 500;
    if (dx < 0) onNext();
    else onPrevious();
  };

  const onClickCapture = (event) => {
    if (Date.now() >= suppressClickUntil.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <aside className="AdBanner" aria-label="광고">
      <div className="AdBanner-viewport" onTouchStart={onTouchStart} onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd} onTouchCancel={() => { touchStart.current = null; }} onClickCapture={onClickCapture}>
        <div className="AdBanner-slides">
          <button className="AdBanner-preview AdBanner-preview-previous" type="button" aria-label="이전 광고 보기" onClick={onPrevious}>
            <img className="AdBanner-image" src={ads[(adIndex - 1 + ads.length) % ads.length].image} alt="" />
          </button>
          {ad.image && (
            <div className="AdBanner-image-wrap">
              <img className="AdBanner-image" src={ad.image} alt="" />
              {ad.signupUrl && (
                <a className="AdBanner-signup" href={ad.signupUrl} aria-label="www.bobsys.co.kr 사이트로 이동" />
              )}
            </div>
          )}
          <button className="AdBanner-preview AdBanner-preview-next" type="button" aria-label="다음 광고 보기" onClick={onNext}>
            <img className="AdBanner-image" src={ads[(adIndex + 1) % ads.length].image} alt="" />
          </button>
        </div>
      </div>
      <div className="AdBanner-content">
        <div className="AdBanner-progress" aria-hidden="true">
          <span style={{width: `${(adIndex + 1) / ads.length * 100}%`}} />
        </div>
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
