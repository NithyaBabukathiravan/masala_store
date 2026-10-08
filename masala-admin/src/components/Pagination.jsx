// Backend page response: { total, page, size, pages, has_next, has_prev }
export default function Pagination({ data, onPage }) {
  if (!data) return null;
  if (data.pages <= 1) {
    return <div className="pager"><span className="muted">{data.total} item(s)</span></div>;
  }
  const { page, pages, total, size } = data;
  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  // current page around 5 numbers mattum kaattum
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const nums = [];
  for (let i = start; i <= Math.min(pages, start + 4); i++) nums.push(i);

  return (
    <div className="pager">
      <span className="muted">Showing {from}-{to} of {total}</span>
      <div className="pager-btns">
        <button disabled={!data.has_prev} onClick={() => onPage(page - 1)}>‹ Prev</button>
        {start > 1 && <><button onClick={() => onPage(1)}>1</button><span>…</span></>}
        {nums.map((n) => (
          <button key={n} className={n === page ? "active" : ""} onClick={() => onPage(n)}>{n}</button>
        ))}
        {start + 4 < pages && <><span>…</span><button onClick={() => onPage(pages)}>{pages}</button></>}
        <button disabled={!data.has_next} onClick={() => onPage(page + 1)}>Next ›</button>
      </div>
    </div>
  );
}
