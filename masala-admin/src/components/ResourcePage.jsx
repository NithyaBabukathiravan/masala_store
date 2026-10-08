import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import FormFields from "./FormFields";
import Modal from "./Modal";
import Pagination from "./Pagination";

// form values -> API payload (numbers, empty -> null)
function buildPayload(fields, form, isEdit) {
  const out = {};
  for (const f of fields) {
    if (f.createOnly && isEdit) continue;
    const v = form[f.name];
    if (f.type === "checkbox") out[f.name] = !!v;
    else if (f.type === "number") out[f.name] = v === "" || v == null ? null : Number(v);
    else out[f.name] = v === "" || v == null ? null : typeof v === "string" ? v.trim() : v;
  }
  return out;
}

export default function ResourcePage({
  title, subtitle, endpoint, columns, fields, blank,
  toForm = (x) => x, transform = (p) => p, rowActions, filterQuery = "", noun = "item",
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // { id, form }
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    const url = `${endpoint}?page=${page}&size=8&search=${encodeURIComponent(q)}${filterQuery}`;
    api.get(url).then((d) => { setData(d); setError(""); }).catch((e) => setError(e.message));
  }, [endpoint, page, q, filterQuery]);

  useEffect(() => { load(); }, [load]);

  // typing nirutthina 400ms-ku apparam search
  useEffect(() => {
    const t = setTimeout(() => { setQ(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const isEdit = !!editing.id;
    try {
      const payload = transform(buildPayload(fields, editing.form, isEdit), isEdit);
      if (isEdit) await api.put(`${endpoint}/${editing.id}`, payload);
      else await api.post(endpoint, payload);
      setEditing(null);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    if (!confirm(`Delete this ${noun}?`)) return;
    try {
      await api.del(`${endpoint}/${row.id}`);
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        <button className="btn primary" onClick={() => setEditing({ id: null, form: { ...blank } })}>
          + Add {noun}
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <input className="search" placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {error && <div className="alert">{error}</div>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.label}>{c.label}</th>)}
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!data && <tr><td colSpan={columns.length + 1} className="center muted">Loading...</td></tr>}
              {data?.items.length === 0 && <tr><td colSpan={columns.length + 1} className="center muted">Onnum illa 🙂</td></tr>}
              {data?.items.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => <td key={c.label}>{c.render(row)}</td>)}
                  <td className="actions">
                    {rowActions?.(row, load)}
                    <button className="btn sm" onClick={() => setEditing({ id: row.id, form: toForm(row) })}>Edit</button>
                    <button className="btn sm danger" onClick={() => remove(row)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination data={data} onPage={setPage} />
      </div>

      {editing && (
        <Modal title={`${editing.id ? "Edit" : "Add"} ${noun}`} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <FormFields
              fields={fields}
              form={editing.form}
              isEdit={!!editing.id}
              setForm={(fn) => setEditing((ed) => ({ ...ed, form: typeof fn === "function" ? fn(ed.form) : fn }))}
            />
            <div className="modal-foot">
              <button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
