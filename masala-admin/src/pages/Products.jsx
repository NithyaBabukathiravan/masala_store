import { useEffect, useState } from "react";
import { api, imgUrl, money } from "../api";
import ResourcePage from "../components/ResourcePage";

const blank = {
  name: "", category_id: "", price: "", original_price: "", stock: 0, spice_level: "",
  net_weight: "", shelf_life: "", description: "", ingredients: "", image: "",
  is_featured: false, is_active: true,
};

export default function Products() {
  const [cats, setCats] = useState([]);
  useEffect(() => { api.get("/api/categories").then(setCats); }, []);

  const fields = [
    { name: "name", label: "Name", required: true },
    { name: "category_id", label: "Category", type: "select", required: true, options: cats.map((c) => ({ value: c.id, label: c.name })) },
    { name: "price", label: "Price (₹)", type: "number", required: true },
    { name: "original_price", label: "MRP (₹)", type: "number" },
    { name: "stock", label: "Stock", type: "number", required: true },
    { name: "spice_level", label: "Spice level", type: "select", options: ["Mild", "Medium", "Spicy"].map((s) => ({ value: s, label: s })) },
    { name: "net_weight", label: "Net weight (e.g. 100 g)" },
    { name: "shelf_life", label: "Shelf life" },
    { name: "image", label: "Image", type: "image", wide: true },
    { name: "description", label: "Description", type: "textarea", wide: true },
    { name: "ingredients", label: "Ingredients", type: "textarea", wide: true },
    { name: "is_featured", label: "Featured", type: "checkbox" },
    { name: "is_active", label: "Visible in store", type: "checkbox" },
  ];

  const columns = [
    {
      label: "Product",
      render: (p) => (
        <div className="prod-cell">
          {p.image ? <img src={imgUrl(p.image)} alt="" /> : <div className="ph">🌶️</div>}
          <div><b>{p.name}</b><small>{p.net_weight || "-"}</small></div>
        </div>
      ),
    },
    { label: "Category", render: (p) => p.category.name },
    {
      label: "Price",
      render: (p) => (
        <>
          <b>{money(p.price)}</b>
          {p.original_price && <del className="muted"> {money(p.original_price)}</del>}
          {p.discount_percent > 0 && <span className="off">{p.discount_percent}% off</span>}
        </>
      ),
    },
    {
      label: "Stock",
      render: (p) => <span className={`stock ${p.stock === 0 ? "out" : p.stock <= 10 ? "low" : ""}`}>{p.stock}</span>,
    },
    { label: "Rating", render: (p) => (p.rating_count ? `⭐ ${p.rating} (${p.rating_count})` : "-") },
    { label: "Status", render: (p) => <span className={`badge ${p.is_active ? "s-delivered" : "s-cancelled"}`}>{p.is_active ? "Visible" : "Hidden"}</span> },
  ];

  const rowActions = (p, reload) => (
    <>
      <button
        className="btn sm"
        onClick={async () => {
          const v = prompt(`New stock for "${p.name}"`, p.stock);
          if (v === null || v === "" || isNaN(Number(v))) return;
          try { await api.patch(`/api/admin/products/${p.id}/stock`, { stock: Number(v) }); reload(); }
          catch (e) { alert(e.message); }
        }}
      >Stock</button>
      <button
        className="btn sm"
        onClick={async () => {
          try { await api.patch(`/api/admin/products/${p.id}/toggle`); reload(); }
          catch (e) { alert(e.message); }
        }}
      >{p.is_active ? "Hide" : "Show"}</button>
    </>
  );

  return (
    <ResourcePage
      title="Products"
      subtitle="Product add / edit / stock / hide"
      noun="product"
      endpoint="/api/admin/products"
      columns={columns}
      fields={fields}
      blank={blank}
      toForm={(p) => ({ ...p, category_id: p.category.id })}
      rowActions={rowActions}
    />
  );
}
