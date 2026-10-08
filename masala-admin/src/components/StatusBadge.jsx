const LABELS = {
  placed: "Placed", under_review: "Under Review", confirmed: "Confirmed",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
  new: "New", contacted: "Contacted", closed: "Closed",
};

export default function StatusBadge({ status }) {
  return <span className={`badge s-${status}`}>{LABELS[status] || status}</span>;
}
export { LABELS };
