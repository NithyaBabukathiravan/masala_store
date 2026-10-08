const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const STORE = import.meta.env.VITE_STOREFRONT_URL || "http://localhost:5173";

export const getToken = () => localStorage.getItem("admin_token");
export const setToken = (t) => localStorage.setItem("admin_token", t);
export const clearToken = () => localStorage.removeItem("admin_token");

// /uploads/... backend-la irukku, /images/... storefront-la irukku
export function imgUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return u.startsWith("/uploads") ? BASE + u : STORE + u;
}

export const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-";

async function request(method, path, body, isForm = false) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 && token) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data.detail;
    const msg = Array.isArray(d)
      ? d.map((x) => `${x.loc.slice(1).join(".")}: ${x.msg}`).join(", ")
      : d || "Something went wrong";
    throw new Error(msg);
  }
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  put: (p, b) => request("PUT", p, b),
  patch: (p, b) => request("PATCH", p, b),
  del: (p) => request("DELETE", p),
  upload: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return request("POST", "/api/admin/uploads", fd, true);
  },
};
