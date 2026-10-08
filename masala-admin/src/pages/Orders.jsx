import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, fmtDate, money } from "../api";
import Pagination from "../components/Pagination";
import StatusBadge, { LABELS } from "../components/StatusBadge";

const TABS = ["", "placed", "under_review", "confirmed", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = `/api/admin/orders?page=${page}&size=8&search=${encodeURIComponent(q)}${status ? `&status=${status}` : ""}`;
    api.get(url).then((d) => { setData(d); setError(""); }).catch((e) => setError(e.message));
  }, [page, q, status]);

  useEffect(() => {
    const t = setTimeout(() => { setQ(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  function pickTab(s) {
    setPage(1);
    setParams(s ? { status: s } : {});
  }

  return (
    <>
      <div className="page-head">
        <div><h1>Orders</h1><p className="muted">Review → call customer → confirm → ship</p></div>
      </div>

      <div className="card">
        <div className="tabs">
          {TABS.map((s) => (
            <button key={s} className={s === status ? "active" : ""} onClick={() => pickTab(s)}>
              {s ? LABELS[s] : "All"}
            </button>
          ))}
        </div>
        <div className="toolbar">
          <input className="search" placeholder="Order no / name / phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {error && <div className="alert">{error}</div>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>City</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th><th></th></tr>
            </thead>
            <tbody>
              {!data && <tr><td colSpan={8} className="center muted">Loading...</td></tr>}
              {data?.items.length === 0 && <tr><td colSpan={8} className="center muted">Orders illa 🙂</td></tr>}
              {data?.items.map((o) => (
                <tr key={o.id}>
                  <td><b>{o.order_number}</b></td>
                  <td>{o.customer_name}<small className="block muted">{o.phone}</small></td>
                  <td>{o.city}</td>
                  <td>{o.item_count}</td>
                  <td><b>{money(o.total)}</b></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{fmtDate(o.created_at)}</td>
                  <td className="actions"><Link className="btn sm primary" to={`/orders/${o.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination data={data} onPage={setPage} />
      </div>
    </>
  );
}
