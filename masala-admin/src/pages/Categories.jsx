import { imgUrl } from "../api";
import ResourcePage from "../components/ResourcePage";

export default function Categories() {
  const fields = [
    { name: "name", label: "Name", required: true },
    { name: "image", label: "Image", type: "image", wide: true },
    { name: "description", label: "Description", type: "textarea", wide: true },
  ];
  const columns = [
    {
      label: "Category",
      render: (c) => (
        <div className="prod-cell">
          {c.image ? <img src={imgUrl(c.image)} alt="" /> : <div className="ph">🗂️</div>}
          <div><b>{c.name}</b><small>/{c.slug}</small></div>
        </div>
      ),
    },
    { label: "Description", render: (c) => c.description || "-" },
    { label: "Products", render: (c) => c.product_count },
  ];
  return (
    <ResourcePage
      title="Categories" subtitle="Products-ah group panna" noun="category"
      endpoint="/api/admin/categories" columns={columns} fields={fields}
      blank={{ name: "", image: "", description: "" }}
    />
  );
}
