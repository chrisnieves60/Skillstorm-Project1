export default function InventoryTable({
  items,
  warehouses,
  onEdit,
  onTransfer,
  onDelete,
}) {
  return (
    <div className="table">
      <div className="table-head">
        <span>Item</span>
        <span>SKU</span>
        <span>Qty</span>
        <span>Warehouse</span>
        <span>Location</span>
        <span>Actions</span>
      </div>
      {items.map((item) => {
        const warehouse = warehouses.find((w) => w.id === item.warehouseId);
        const quantity = Number(item.quantity ?? 0);
        return (
          <div key={item.id} className="table-row">
            <span>
              <strong>{item.name}</strong>
            </span>
            <span>{item.sku}</span>
            <span>{quantity.toLocaleString()}</span>
            <span>{warehouse?.name ?? "Unknown"}</span>
            <span>{item.storageLocation || "—"}</span>
            <span className="actions">
              <button className="link" onClick={() => onEdit(item)}>
                Edit
              </button>
              <button className="link" onClick={() => onTransfer(item)}>
                Transfer
              </button>
              <button className="link danger" onClick={() => onDelete(item)}>
                Delete
              </button>
            </span>
          </div>
        );
      })}
      {items.length === 0 && (
        <div className="empty">
          <p>No items match the filters. Try clearing your search.</p>
        </div>
      )}
    </div>
  );
}
