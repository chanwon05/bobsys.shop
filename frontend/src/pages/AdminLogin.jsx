import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {request, setToken} from "../services/api";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await request("/auth/login", {
        method: "POST", body: JSON.stringify({username: username.trim(), password}),
      });
      setToken(result.accessToken);
      navigate("/admin", {replace: true});
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="Admin Admin-login">
      <h1>관리자 로그인</h1>
      <form className="Admin-panel Admin-form" onSubmit={submit}>
        {error && <p className="Catalog-error" role="alert">{error}</p>}
        <fieldset disabled={loading}>
          <label>아이디<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" maxLength={100} required /></label>
          <label>비밀번호<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" maxLength={72} required /></label>
          <button className="Catalog-button" type="submit">{loading ? "로그인 중…" : "로그인"}</button>
        </fieldset>
      </form>
    </main>
  );
}

export default AdminLogin;
