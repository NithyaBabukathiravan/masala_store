import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, fmtDate, money } from "../api";
import StatusBadge, { LABELS } from "../components/StatusBadge";

// backend services.py-la irukkura same flow
const NEXT = {
  placed: ["under_review", "cancelled"],
  under_review: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
const EDITABLE = ["placed", "under_review", "confirmed"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [lines, setLines] = useState(null); // edit mode items
  const [products, setProducts] = useState([]);
  const [addId, setAddId] = useState("");

  const load = useCallback(() => {
    api.get(`/api/admin/orders/${id}`)
      .then((o) => { setOrder(o); setAdminNote(o.admin_note || ""); setError(""); })
      .catch((e) => setError(e.message));
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function changeStatus(status) {
    if (status === "cancelled" && !confirm("Cancel this order? Stock thirumba serum.")) return;
    try {
      const o = await api.patch(`/api/admin/orders/${id}/status`, { status, note: note || null, admin_note: adminNote || null });
      setOrder(o);
      setNote("");
    } catch (e) { alert(e.message); }
  }

  async function startEdit() {
    const p = await api.get("/api/admin/products?size=100&is_active=true");
    setProducts(p.items);
    setLines(order.items.map((i) => ({ product_id: i.product_id, name: i.product_name, price: i.unit_price, quantity: i.quantity })));
  }

  function addLine() {
    const p = products.find((x) => x.id === addId);
    if (!p || lines.some((l) => l.product_id === p.id)) return;
    setLines([...lines, { product_id: p.id, name: p.name, price: p.price, quantity: 1 }]);
    setAddId("");
  }

  async function saveItems() {
    try {
      const items = lines.filter((l) => l.product_id).map((l) => ({ product_id: l.product_id, quantity: Number(l.quantity) }));
      const o = await api.patch(`/api/admin/orders/${id}/items`, { items, note: "Items updated by admin" });
      setOrder(o);
      setLines(null);
    } catch (e) { alert(e.message); }
  }

  if (error) return <div className="alert">{error}</div>;
  if (!order) return <p className="muted">Loading...</p>;

  const canEdit = EDITABLE.includes(order.status);
  const estTotal = lines ? lines.reduce((s, l) => s + Number(l.price) * Number(l.quantity || 0), 0) : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/orders" className="link">← Orders</Link>
          <h1>{order.order_number} <StatusBadge status={order.status} /></h1>
          <p className="muted">Placed {fmtDate(order.created_at)}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="card pad">
            <h3>Customer</h3>
            <div className="info-grid">
              <div><small>Name</small><b>{order.customer_name}</b></div>
              <div><small>Phone</small><b><a href={`tel:${order.phone}`}>{order.phone}</a> · <a href={`https://wa.me/91${order.phone}`} target="_blank" rel="noreferrer">WhatsApp</a></b></div>
              <div><small>Email</small><b>{order.email || "-"}</b></div>
              <div><small>City / PIN</small><b>{order.city} - {order.pincode}</b></div>
              <div className="wide"><small>Address</small><b>{order.address}</b></div>
              {order.notes && <div className="wide"><small>Customer note</small><b>{order.notes}</b></div>}
            </div>
          </div>

          <div className="card pad">
            <div className="between">
              <h3>Items</h3>
              {canEdit && !lines && <button className="btn sm" onClick={startEdit}>✏️ Edit items</button>}
            </div>
            <table>
              <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th>{lines && <th></th>}</tr></thead>
              <tbody>
                {!lines && order.items.map((i) => (
                  <tr key={i.id}><td>{i.product_name}</td><td>{money(i.unit_price)}</td><td>{i.quantity}</td><td>{money(i.line_total)}</td></tr>
                ))}
                {lines && lines.map((l, idx) => (
                  <tr key={l.product_id || idx}>
                    <td>{l.name}</td><td>{money(l.price)}</td>
                    <td><input className="qty" type="number" min={1} value={l.quantity} onChange={(e) => setLines(lines.map((x, i) => (i === idx ? { ...x, quantity: e.target.value } : x)))} /></td>
                    <td>{money(l.price * l.quantity)}</td>
                    <td><button className="icon-btn" onClick={() => setLines(lines.filter((_, i) => i !== idx))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {lines ? (
              <>
                <div className="add-line">
                  <select value={addId} onChange={(e) => setAddId(e.target.value)}>
                    <option value="">+ Add product...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({money(p.price)}) - stock {p.stock}</option>)}
                  </select>
                  <button className="btn sm" onClick={addLine}>Add</button>
                </div>
                <p className="muted">Items subtotal: {money(estTotal)} (discount & shipping save pannina apparam auto-calculate aagum)</p>
                <div className="modal-foot">
                  <button className="btn" onClick={() => setLines(null)}>Cancel</button>
                  <button className="btn primary" disabled={lines.length === 0} onClick={saveItems}>Save items</button>
                </div>
              </>
            ) : (
              <div className="totals">
                <div><span>Subtotal</span><b>{money(order.subtotal)}</b></div>
                {Number(order.discount) > 0 && <div><span>Discount ({order.coupon_code})</span><b className="text-green">- {money(order.discount)}</b></div>}
                <div><span>Shipping</span><b>{Number(order.shipping_fee) ? money(order.shipping_fee) : "FREE"}</b></div>
                <div className="grand"><span>Total</span><b>{money(order.total)}</b></div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card pad">
            <h3>Update status</h3>
            {NEXT[order.status].length === 0 ? (
              <p className="muted">Indha order-ku innum maatha mudiyaadhu.</p>
            ) : (
              <>
                <label className="field"><span>Timeline note (optional)</span>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Customer-ku call pannen, confirmed" />
                </label>
                <label className="field"><span>Internal admin note</span>
                  <textarea rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Payment offline-la vaangiyaachu..." />
                </label>
                <div className="status-actions">
                  {NEXT[order.status].map((s) => (
                    <button key={s} className={`btn ${s === "cancelled" ? "danger" : "primary"}`} onClick={() => changeStatus(s)}>
                      {s === "cancelled" ? "Cancel order" : `Mark ${LABELS[s]}`}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card pad">
            <h3>Timeline</h3>
            <ul className="timeline">
              {[...order.history].reverse().map((h, i) => (
                <li key={i}>
                  <StatusBadge status={h.status} />
                  <span>{h.note || "-"}</span>
                  <small className="muted">{fmtDate(h.created_at)}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
