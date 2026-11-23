const Footer = () => {
  return (
    <footer className="Footer">
      <div className="Footer-inner">
        <a className="Footer-logo" href="/">
          <strong>BOBSYS</strong>
          <span>밥시스</span>
        </a>

        <div className="Footer-info">
          <nav className="Footer-links" aria-label="회사 안내">
            <a href="/about">회사소개</a>
            <a href="/location">찾아오시는길</a>
            <a href="/privacy">개인정보처리방침</a>
            <div>이용약관</div>
            <div>이메일수집금지</div>
          </nav>

          <address className="Footer-contact">
            <span>대표 : 서복현</span>
            <span>
              청주시 흥덕구 직지대로581번길 111(봉명동 1935, 봉정초 후문)
            </span>
            <a href="tel:0432777767">TEL. 043-277-7767</a>
            <a href="tel:01044135033">PHONE. 010-4413-5033</a>
          </address>

          <p className="Footer-copyright">
            Copyright(c) BOBSYS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
