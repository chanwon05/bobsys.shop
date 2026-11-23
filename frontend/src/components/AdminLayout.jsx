import {NavLink, Outlet} from "react-router-dom";
import {useEffect, useState} from "react";
import {getToken, request, setToken} from "../services/api";
import AdminLogin from "../pages/AdminLogin";

function AdminLayout() {
  const [token, updateToken] = useState(getToken);
  const [verifiedToken, setVerifiedToken] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const changed = () => updateToken(getToken());
    window.addEventListener("bobsys-auth", changed);
    return () => window.removeEventListener("bobsys-auth", changed);
  }, []);
  useEffect(() => {
    if (!token) return;
    let active = true;
    request("/auth/me").then(() => {
      if (active) { setVerifiedToken(token); setError(""); }
    }).catch((failure) => {
      if (active) setError(failure.message);
    });
    const expiry = setTimeout(() => setToken(""), 1800 * 1000);
    return () => { active = false; clearTimeout(expiry); };
  }, [token]);

  if (!token) return <AdminLogin />;
  if (verifiedToken !== token) return <main className="Admin">
    <p role="status">{error || "로그인 확인 중…"}</p>
    {error && <button className="Catalog-button" onClick={() => setToken("")}>다시 로그인</button>}
  </main>;
  return (
    <main className="Admin">
      <nav className="Admin-nav" aria-label="관리자 메뉴">
        <NavLink to="/admin" end>대시보드</NavLink>
        <NavLink to="/admin/products">상품</NavLink>
        <NavLink to="/admin/samples">샘플</NavLink>
        <NavLink to="/admin/portfolios">포트폴리오</NavLink>
        <NavLink to="/admin/categories">카테고리</NavLink>
        <NavLink to="/admin/users">이용자</NavLink>
        <NavLink to="/admin/notices">공지사항</NavLink>
        <NavLink to="/products">상품 목록 보기</NavLink>
        <button className="Catalog-button" onClick={() => setToken("")}>로그아웃</button>
      </nav>
      <Outlet />
    </main>
  );
}

export default AdminLayout;
