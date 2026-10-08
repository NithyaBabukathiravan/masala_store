import { api, imgUrl } from "../api";

export default function FormFields({ fields, form, setForm, isEdit }) {
  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  async function onFile(name, file) {
    if (!file) return;
    try {
      const { url } = await api.upload(file);
      set(name, url);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="form-grid">
      {fields.map((f) => {
        if (f.createOnly && isEdit) return null;
        const v = form[f.name] ?? "";
        return (
          <label key={f.name} className={`field ${f.wide ? "wide" : ""} ${f.type === "checkbox" ? "check" : ""}`}>
            <span>{f.label}{f.required && " *"}</span>
            {f.type === "textarea" ? (
              <textarea rows={3} value={v} required={f.required} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === "select" ? (
              <select value={v} required={f.required} onChange={(e) => set(f.name, e.target.value)}>
                <option value="">-- select --</option>
                {(f.options || []).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.type === "checkbox" ? (
              <input type="checkbox" checked={!!form[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
            ) : f.type === "image" ? (
              <div className="img-field">
                {v && <img src={imgUrl(v)} alt="" />}
                <input type="file" accept="image/*" onChange={(e) => onFile(f.name, e.target.files[0])} />
                <input type="text" placeholder="illa image url / path" value={v} onChange={(e) => set(f.name, e.target.value)} />
              </div>
            ) : (
              <input
                type={f.type || "text"}
                step={f.type === "number" ? "any" : undefined}
                min={f.type === "number" ? 0 : undefined}
                value={v}
                required={f.required}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}
