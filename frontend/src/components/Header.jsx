import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {getToken, request} from "../services/api";

const menus = [
    {name: "홈페이지 제작", path: "/page", submenu: {name: "포트폴리오", path: "/portfolio"}},
    {name: "명함", path: "/card", submenu: {name: "샘플보기", path: "/card/sample"}},
    {name: "현수막", path: "/banner", submenu: {name: "샘플보기", path: "/banner/samples"}},
    {name: "전단/포스터", path: "/leaflet", submenu: {name: "샘플보기", path: "/leaflet/samples"}},
    {name: "스티커", path: "/sticker", submenu: {name: "샘플보기", path: "/sticker/samples"}},
    {name: "봉투", path: "/envelope"},
    {name: "카탈로그", path: "/catalog"},
    {name: "종이자석", path: "/paper_magnet"},
    {name: "명찰/신분증", path: "/name_tag"},
    {name: "판촉물", path: "/promotional_item"},
    {name: "부동산할인", path: "/property"},
    {name: "관리자", path: "/admin"}
];


const Header = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    let active = true;
    let version = 0;
    let expiry;
    const checkAdmin = async () => {
      const current = ++version;
      clearTimeout(expiry);
      setIsAdmin(false);
      const token = getToken();
      if (!token) return;
      try {
        await request("/auth/me");
        if (!active || current !== version || getToken() !== token) return;
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const remaining = JSON.parse(atob(payload)).exp * 1000 - Date.now();
        if (!Number.isFinite(remaining) || remaining <= 0) return;
        setIsAdmin(true);
        expiry = setTimeout(() => setIsAdmin(false), remaining);
      } catch {
        if (active && current === version) setIsAdmin(false);
      }
    };
    checkAdmin();
    window.addEventListener("bobsys-auth", checkAdmin);
    return () => {
      active = false;
      clearTimeout(expiry);
      window.removeEventListener("bobsys-auth", checkAdmin);
    };
  }, []);

  return (
    <header className="Header">
      <a className="Header-logo" href="/">
        <span className="Header-logo-sub">BOBSYS/1999~</span>
        <span className="Header-logo-main">밥시스</span>
      </a>

      <nav className="Header-nav" aria-label="상품 메뉴">
        {menus.filter((menu) => menu.path !== "/admin" || isAdmin).map((menu) => menu.submenu ? (
          <div key={menu.name} className="Header-dropdown"
            onMouseEnter={() => setOpenMenu(menu.path)} onMouseLeave={() => setOpenMenu(null)}
            onFocus={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(menu.path);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpenMenu(null);
                event.currentTarget.querySelector("button").focus();
              }
            }}>
            <button className="Header-menu" type="button" aria-expanded={openMenu === menu.path}
              aria-controls={`submenu-${menu.path.slice(1)}`} onClick={() => {
                setOpenMenu(null);
                navigate(menu.path);
              }}>
              {menu.name}
            </button>
            <div className="Header-submenu" id={`submenu-${menu.path.slice(1)}`} hidden={openMenu !== menu.path}>
              <Link to={menu.path} onClick={() => setOpenMenu(null)}>{menu.path === "/card" ? "종이재질&가격" : "가격"}</Link>
              <Link to={menu.submenu.path} onClick={() => setOpenMenu(null)}>{menu.submenu.name}</Link>
            </div>
          </div>
        ) : (
          <button
            key={menu.name}
            className={`Header-menu${menu.path === "/property" ? " Header-menu-discount" : ""}`}
            type="button"
            onClick={() => navigate(menu.path)}
          >
            {menu.name}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
