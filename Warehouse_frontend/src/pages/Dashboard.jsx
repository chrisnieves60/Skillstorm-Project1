const formatNumber = (value) => value.toLocaleString();

export default function Dashboard({ warehouses }) {
  //compute utilization for ALL warehouses
  const totalUsed = warehouses.reduce((sum, w) => sum + (w.capacity ?? 0), 0);
  const totalMax = warehouses.reduce(
    (sum, w) => sum + (w.maximumCapacity ?? w.capacity ?? 0),
    0
  );

  const utilization =
    totalMax > 0 ? Math.min((totalUsed / Math.max(totalMax, 1)) * 100, 100) : 0;

  const watchlist = warehouses
    .map((w) => {
      const used = Number(w.capacity ?? 0);
      const max = Number(w.maximumCapacity ?? w.capacity ?? 0);
      const percent = max > 0 ? (used / max) * 100 : 0;
      return { ...w, used, max, percent };
    })
    .filter((w) => w.max > 0 && w.percent >= 85)
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="stack">
      <section className="panel hero">
        <div>
          <p className="eyebrow">Operations Center</p>
          <h2>Multi-site Overview</h2>
          <p className="muted"></p>
          <div className="cta-row"></div>
        </div>
        <div className="hero-meter">
          <div className="meter small">
            <div
              className="meter-fill"
              style={{
                width: `${utilization.toFixed(1)}%`,
              }}
            />
          </div>
          <p className="muted">
            Total used:{" "}
            <strong>
              {totalUsed.toLocaleString()} /{totalMax.toLocaleString()} units
            </strong>
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Capacity Watchlist</p>
            <h3>Warehouses nearing capacity</h3>
            <p className="muted">
              When a site passes 85% utilization, it is flagged. Adjust capacity
              or transfer items before the threshold is breached.
            </p>
          </div>
        </div>
        {watchlist.length === 0 ? (
          <div className="empty">
            <p>All sites are under 85% utilization.</p>
          </div>
        ) : (
          <div className="table">
            <div className="table-head">
              <span>Warehouse</span>
              <span>Capacity</span>
              <span>Utilization</span>
            </div>
            {watchlist.map((w) => (
              <div key={w.id} className="table-row">
                <span>
                  <strong>{w.name}</strong>
                  <div className="muted">{w.location || "—"}</div>
                </span>
                <span>
                  {w.used.toLocaleString()} / {w.max.toLocaleString()}
                </span>
                <span className="actions">
                  <span
                    className="pill pill-ghost"
                    style={{ color: "#b91c1c", borderColor: "#b91c1c" }}
                  >
                    {w.percent.toFixed(1)}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Activity</p>
            <h3>Latest inventory moves</h3>
          </div>
          <span className="pill pill-ghost">Chronological log</span>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, hint }) {
  return (
    <div className="panel stat">
      <p className="eyebrow">{title}</p>
      <h3>{value}</h3>
      <p className="muted">{hint}</p>
    </div>
  );
}
