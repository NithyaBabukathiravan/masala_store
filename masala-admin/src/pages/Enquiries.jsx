import { useEffect, useState } from "react";
import { api, fmtDate } from "../api";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

export default function Enquiries() {
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState(null);

  function load() {
    const url = `/api/admin/enquiries?page=${page}&size=8&search=${encodeURIComponent(q)}${kind ? `&kind=${kind}` : ""}${status ? `&status=${status}` : ""}`;
    api.get(url).then((d) => { setData(d); setError(""); }).catch((e) => setError(e.message));
  }
  useEffect(load, [page, q, kind, status]); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => { setQ(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  async function setRowStatus(row, s) {
    try { await api.patch(`/api/admin/enquiries/${row.id}/status`, { status: s }); load(); }
    catch (e) { alert(e.message); }
  }
  async function remove(row) {
    if (!confirm("Delete this enquiry?")) return;
    try { await api.del(`/api/admin/enquiries/${row.id}`); load(); } catch (e) { alert(e.message); }
  }

  return (
    <>
      <div className="page-head">
        <div><h1>Enquiries</h1><p className="muted">Bulk, export & contact messages</p></div>
      </div>
      <div className="card">
        <div className="toolbar">
          <input className="search" placeholder="Name / company / phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }}>
            <option value="">All types</option><option value="bulk">Bulk</option><option value="export">Export</option><option value="contact">Contact</option>
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All status</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
          </select>
        </div>
        {error && <div className="alert">{error}</div>}
        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>From</th><th>Contact</th><th>Qty</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {!data && <tr><td colSpan={7} className="center muted">Loading...</td></tr>}
              {data?.items.length === 0 && <tr><td colSpan={7} className="center muted">Enquiries illa 🙂</td></tr>}
              {data?.items.map((r) => (
                <tr key={r.id}>
                  <td><span className="badge s-confirmed">{r.kind}</span></td>
                  <td><b>{r.name}</b><small className="block muted">{r.company || r.subject || ""}</small></td>
                  <td>{r.phone || "-"}<small className="block muted">{r.email || ""}</small></td>
                  <td>{r.quantity || "-"}</td>
                  <td>{fmtDate(r.created_at)}</td>
                  <td>
                    <select className={`inline-select s-${r.status}`} value={r.status} onChange={(e) => setRowStatus(r, e.target.value)}>
                      <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="actions">
                    <button className="btn sm" onClick={() => setView(r)}>View</button>
                    <button className="btn sm danger" onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination data={data} onPage={setPage} />
      </div>
      {view && (
        <Modal title={`${view.kind} enquiry - ${view.name}`} onClose={() => setView(null)}>
          <div className="info-grid">
            <div><small>Company</small><b>{view.company || "-"}</b></div>
            <div><small>Phone</small><b>{view.phone || "-"}</b></div>
            <div><small>Email</small><b>{view.email || "-"}</b></div>
            <div><small>Quantity</small><b>{view.quantity || "-"}</b></div>
            <div className="wide"><small>Message</small><b className="pre">{view.message || "-"}</b></div>
          </div>
        </Modal>
      )}
    </>
  );
}
