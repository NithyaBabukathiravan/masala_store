import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api, getToken, setToken } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (getToken()) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { access_token } = await api.post("/api/admin/login", form);
      setToken(access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">🌿</div>
        <h1>Masala World</h1>
        <p className="muted">Admin Panel Login</p>
        {error && <div className="alert">{error}</div>}
        <label className="field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn primary block" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  );
}
