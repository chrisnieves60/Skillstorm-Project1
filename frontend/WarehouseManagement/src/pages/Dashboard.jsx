const formatNumber = (value) => value.toLocaleString();

export default function Dashboard({ warehouses = [] }) {
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalUsed = warehouses.reduce((sum, w) => sum + w.used, 0);
  // const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const utilization = totalCapacity
    ? Math.round((totalUsed / totalCapacity) * 100)
    : 0;

  // const recent = [...items]
  //   .sort(
  //     (a, b) =>
  //       new Date(b.lastMoved || b.id).getTime() -
  //       new Date(a.lastMoved || a.id).getTime()
  //   )
  //   .slice(0, 5);

  return (
    <div className="stack">
      <section className="panel hero">
        <div>
          <p className="eyebrow">Command Center</p>
          <h2>Multi-site inventory at a glance</h2>
          <p className="muted">
            Monitor utilization, capacity risks, and activity without touching
            the backend. Use the tabs above to edit warehouses, items, and
            transfers.
          </p>
          <div className="cta-row">
            {/* <span className="pill pill-ghost">
              {warehouses.length} sites · {totalItems} units tracked
            </span> */}
          </div>
        </div>
        <div className="hero-meter">
          <div className="meter">
            <div
              className="meter-fill"
              style={{ width: `${Math.min(utilization, 100)}%` }}
              aria-label={`Overall utilization ${utilization}%`}
            />
          </div>
          <p className="muted">
            Overall utilization <strong>{utilization}%</strong> of{" "}
            <strong>{formatNumber(totalCapacity)}</strong> unit capacity
          </p>
        </div>
      </section>

      <section className="grid stats">
        <StatCard
          title="Warehouses online"
          value={warehouses.length}
          hint="Active, ready for inbound"
        />
        {/* <StatCard
          title="Units in motion"
          value={formatNumber(totalItems)}
          hint="Count of all stored items"
        /> */}
        <StatCard
          title="Average headroom"
          value={`${Math.max(
            0,
            totalCapacity - totalUsed
          ).toLocaleString()} units`}
          hint="Remaining capacity across all sites"
        />
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
