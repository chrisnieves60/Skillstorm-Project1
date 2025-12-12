export default function InventoryFilters({ filters, warehouses, onChange }) {
  return (
    <div className="filters compact">
      <input
        placeholder="Search name or SKU"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <select
        value={filters.warehouseId}
        onChange={(e) => onChange({ ...filters, warehouseId: e.target.value })}
      >
        <option value="all">All warehouses</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  );
}
