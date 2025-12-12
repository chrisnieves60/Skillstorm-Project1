export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  return (
    <div className="panel-footer pagination">
      <div className="muted">
        Page {page} of {pageCount}
      </div>
      <div className="actions">
        <button
          type="button"
          className="btn ghost"
          disabled={page === 1}
          onClick={() => onChange(Math.max(1, page - 1))}
        >
          Previous
        </button>
        <div className="pager">
          {Array.from({ length: pageCount }, (_, idx) => idx + 1).map((num) => (
            <button
              key={num}
              type="button"
              className={`btn ghost ${num === page ? "active" : ""}`}
              onClick={() => onChange(num)}
            >
              {num}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn ghost"
          disabled={page === pageCount}
          onClick={() => onChange(Math.min(pageCount, page + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
