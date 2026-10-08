import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api";
import { LABELS } from "../components/StatusBadge";

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/admin/dashboard").then(setD).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!d) return <p className="muted">Loading...</p>;

  const t = d.totals;
  const maxSales = Math.max(...d.last_7_days.map((x) => x.sales), 1);
  const cards = [
    ["💰", "Revenue", money(t.revenue), "confirmed + shipped + delivered"],
    ["🧾", "Total Orders", t.orders, `${t.needs_attention} need attention`],
    ["🌶️", "Products", t.products, `${t.categories} categories`],
    ["⭐", "Pending Reviews", t.pending_reviews, "approve pannunga"],
    ["📨", "New Enquiries", t.new_enquiries, "bulk / export / contact"],
  ];

  return (
    <>
      <div className="page-head">
        <div><h1>Dashboard</h1><p className="muted">Inniku store epdi irukku nu paarunga</p></div>
      </div>

      <div className="stat-grid">
        {cards.map(([icon, label, value, hint]) => (
          <div className="stat" key={label}>
            <div className="stat-icon">{icon}</div>
            <div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card pad">
          <h3>Last 7 days sales</h3>
          <div className="chart">
            {d.last_7_days.map((x) => (
              <div className="bar-col" key={x.date} title={`${x.orders} orders`}>
                <span className="bar-val">{x.sales ? money(x.sales) : ""}</span>
                <div className="bar" style={{ height: `${(x.sales / maxSales) * 100}%` }} />
                <span className="bar-label">{new Date(x.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card pad">
          <h3>Orders by status</h3>
          <div className="status-list">
            {Object.entries(d.orders_by_status).map(([s, n]) => (
              <Link to={`/orders?status=${s}`} key={s} className={`status-chip s-${s}`}>
                <span>{LABELS[s]}</span><b>{n}</b>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card pad">
          <h3>🔥 Top selling</h3>
          {d.top_products.length === 0 && <p className="muted">Innum orders illa</p>}
          {d.top_products.map((p, i) => (
            <div className="row-line" key={p.name}><span>{i + 1}. {p.name}</span><b>{p.quantity_sold} sold</b></div>
          ))}
        </div>
        <div className="card pad">
          <h3>⚠️ Low stock (≤ {d.low_stock_limit})</h3>
          {d.low_stock.length === 0 && <p className="muted">Ellam nalla stock-la irukku 👍</p>}
          {d.low_stock.map((p) => (
            <div className="row-line" key={p.id}>
              <span>{p.name}</span>
              <b className={p.stock === 0 ? "text-red" : "text-orange"}>{p.stock} left</b>
            </div>
          ))}
          <Link to="/products" className="link">Manage stock →</Link>
        </div>
      </div>
    </>
  );
}
