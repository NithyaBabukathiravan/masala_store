import ResourcePage from "../components/ResourcePage";
import { fmtDate } from "../api";

export default function Coupons() {
  const fields = [
    { name: "code", label: "Code", required: true, createOnly: true },
    { name: "discount_type", label: "Type", type: "select", required: true, options: [{ value: "percent", label: "Percent (%)" }, { value: "flat", label: "Flat (₹)" }] },
    { name: "value", label: "Value", type: "number", required: true },
    { name: "min_order", label: "Min order (₹)", type: "number" },
    { name: "max_discount", label: "Max discount (₹)", type: "number" },
    { name: "usage_limit", label: "Usage limit", type: "number" },
    { name: "expires_at", label: "Expires at", type: "datetime-local" },
    { name: "description", label: "Description", wide: true },
    { name: "is_active", label: "Active", type: "checkbox" },
  ];
  const columns = [
    { label: "Code", render: (c) => <b className="code">{c.code}</b> },
    { label: "Discount", render: (c) => (c.discount_type === "percent" ? `${Number(c.value)}%` : `₹${Number(c.value)}`) },
    { label: "Min order", render: (c) => `₹${Number(c.min_order)}` },
    { label: "Used", render: (c) => `${c.used_count}${c.usage_limit ? ` / ${c.usage_limit}` : ""}` },
    { label: "Expires", render: (c) => fmtDate(c.expires_at) },
    { label: "Status", render: (c) => <span className={`badge ${c.is_active ? "s-delivered" : "s-cancelled"}`}>{c.is_active ? "Active" : "Off"}</span> },
  ];
  return (
    <ResourcePage
      title="Coupons" subtitle="Discount codes" noun="coupon"
      endpoint="/api/admin/coupons" columns={columns} fields={fields}
      blank={{ code: "", discount_type: "percent", value: "", min_order: 0, max_discount: "", usage_limit: "", expires_at: "", description: "", is_active: true }}
      toForm={(c) => ({ ...c, expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "" })}
    />
  );
}
