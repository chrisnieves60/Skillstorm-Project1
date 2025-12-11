import CapacityDial from "../CapacityDial";

export default function WarehouseTable({ warehouses, onEdit, onDelete }) {
  return (
    <div className="table warehouse-table">
      <div className="table-head">
        <span>Name</span>
        <span>Location</span>
        <span>Capacity</span>
        <span>Utilization</span>
        <span>Used</span>
        <span>Actions</span>
      </div>
      {warehouses.map((w) => {
        const used = Number(w.capacity ?? 0);
        const max = Number(w.maximumCapacity ?? w.capacity ?? 0);
        const remaining = Math.max(max - used, 0);
        const percent = max > 0 ? Math.round((used / max) * 100) : 0;
        return (
          <div key={w.id} className="table-row">
            <span>
              <strong>{w.name}</strong>
            </span>
            <span>{w.location}</span>
            <span>
              {used.toLocaleString()} used / {max.toLocaleString()} max
            </span>
            <span>
              <CapacityDial used={used} max={max || 1} label={`${percent}%`} />
            </span>
            <span>{remaining.toLocaleString()} left</span>
            <span className="actions">
              <button className="link" onClick={() => onEdit(w)}>
                Edit
              </button>
              <button className="link danger" onClick={() => onDelete(w)}>
                Delete
              </button>
            </span>
          </div>
        );
      })}
      {warehouses.length === 0 && (
        <div className="empty">
          <p>No warehouses match your search.</p>
        </div>
      )}
    </div>
  );
}
