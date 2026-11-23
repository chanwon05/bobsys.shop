function Location() {
  return (
    <main className="Location-page">
      <h1>찾아오시는길</h1>
      <img className="Location-map" src="/images/location/info_map.png" width="900" height="547"
        alt="밥시스 약도: 청주 봉정초등학교 후문 맞은편에 위치합니다." />
      <dl className="Location-details">
        <div><dt>주소</dt><dd>청주시 흥덕구 직지대로581번길 111 (봉명동 1935, 봉정초 후문)</dd></div>
        <div><dt>Tel</dt><dd><a href="tel:0432777767">043-277-7767</a></dd></div>
        <div><dt>Phone</dt><dd><a href="tel:01044135033">010-4413-5033</a></dd></div>
        <div><dt>E-mail</dt><dd><a href="mailto:bobsys7@naver.com">bobsys7@naver.com</a></dd></div>
        <div><dt>웹하드</dt><dd>incj5689 / 1234</dd></div>
      </dl>
    </main>
  );
}

export default Location;
