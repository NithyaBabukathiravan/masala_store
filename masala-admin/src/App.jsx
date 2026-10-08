import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Coupons from "./pages/Coupons";
import Enquiries from "./pages/Enquiries";
import Reviews from "./pages/Reviews";

const MENU = [
  ["/", "📊", "Dashboard"],
  ["/orders", "🧾", "Orders"],
  ["/products", "🌶️", "Products"],
  ["/categories", "🗂️", "Categories"],
  ["/coupons", "🎟️", "Coupons"],
  ["/reviews", "⭐", "Reviews"],
  ["/enquiries", "📨", "Enquiries"],
];

function Layout() {
  const navigate = useNavigate();
  if (!getToken()) return <Navigate to="/login" replace />;

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span>🌿</span> Masala World
          <small>Admin Panel</small>
        </div>
        <nav>
          {MENU.map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>
        <button className="logout" onClick={logout}>⎋ Logout</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
