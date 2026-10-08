import { useEffect, useState } from "react";
import { api, fmtDate } from "../api";
import Pagination from "../components/Pagination";

const TABS = [["pending", "Pending"], ["approved", "Approved"], ["all", "All"]];

export default function Reviews() {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.get(`/api/admin/reviews?page=${page}&size=6&status=${status}`)
      .then((d) => { setData(d); setError(""); })
      .catch((e) => setError(e.message));
  }
  useEffect(load, [page, status]); // eslint-disable-line

  async function moderate(r, approved) {
    try { await api.patch(`/api/admin/reviews/${r.id}/moderate`, { approved }); load(); }
    catch (e) { alert(e.message); }
  }
  async function remove(r) {
    if (!confirm("Delete this review?")) return;
    try { await api.del(`/api/admin/reviews/${r.id}`); load(); } catch (e) { alert(e.message); }
  }

  return (
    <>
      <div className="page-head">
        <div><h1>Reviews</h1><p className="muted">Approve pannina thaan website-la theriyum</p></div>
      </div>
      <div className="card">
        <div className="tabs">
          {TABS.map(([v, l]) => (
            <button key={v} className={v === status ? "active" : ""} onClick={() => { setStatus(v); setPage(1); }}>{l}</button>
          ))}
        </div>
        {error && <div className="alert">{error}</div>}
        {!data && <p className="muted pad">Loading...</p>}
        {data?.items.length === 0 && <p className="muted pad">Reviews illa 🙂</p>}
        <div className="review-list">
          {data?.items.map((r) => (
            <div className="review" key={r.id}>
              <div className="between">
                <div>
                  <b>{r.customer_name}</b> <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <small className="block muted">on {r.product_name} · {fmtDate(r.created_at)}</small>
                </div>
                <span className={`badge ${r.is_approved ? "s-delivered" : "s-placed"}`}>{r.is_approved ? "Approved" : "Pending"}</span>
              </div>
              <p>{r.comment || <i className="muted">(no comment)</i>}</p>
              <div className="actions">
                {r.is_approved
                  ? <button className="btn sm" onClick={() => moderate(r, false)}>Unapprove</button>
                  : <button className="btn sm primary" onClick={() => moderate(r, true)}>Approve</button>}
                <button className="btn sm danger" onClick={() => remove(r)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <Pagination data={data} onPage={setPage} />
      </div>
    </>
  );
}
