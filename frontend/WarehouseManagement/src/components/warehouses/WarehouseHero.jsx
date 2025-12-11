export default function WarehouseHero({ warehouses }) {
  const totalUsed = warehouses.reduce((sum, w) => sum + (w.capacity ?? 0), 0);
  const totalMax = warehouses.reduce(
    (sum, w) => sum + (w.maximumCapacity ?? w.capacity ?? 0),
    0
  );

  const utilization =
    totalMax > 0 ? Math.min((totalUsed / Math.max(totalMax, 1)) * 100, 100) : 0;

  return (
    <section className="panel hero tight">
      <div>
        <p className="eyebrow">Warehouse Network</p>
        <h2>Manage sites, capacities, and readiness</h2>
        <p className="muted">
          Add new nodes, adjust caps when floor plans change, and keep locations
          tidy. Capacity rules prevent overstocking.
        </p>
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
            {totalUsed.toLocaleString()} /
            {totalMax.toLocaleString()} units
          </strong>
        </p>
      </div>
    </section>
  );
}
