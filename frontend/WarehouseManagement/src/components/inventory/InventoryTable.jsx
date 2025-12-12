import { useState } from "react";

export default function InventoryTable({
  items,
  warehouses,
  onEdit,
  onTransfer,
  onDelete,
  renderFooter,
  renderInlineEdit,
}) {
  const [expandedId, setExpandedId] = useState(null);

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
          <div key={item.id}>
            <div className="table-row">
              <span>
                <button
                  className="link"
                  onClick={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                >
                  <strong>{item.name}</strong>
                </button>
                <div
                  className={`description-panel ${
                    expandedId === item.id ? "open" : ""
                  }`}
                  style={{
                    maxHeight: expandedId === item.id ? "80px" : "0",
                    opacity: expandedId === item.id ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 200ms ease, opacity 200ms ease",
                    marginTop: "4px",
                  }}
                >
                  <div className="muted">
                    {item.description || "No description"}
                  </div>
                </div>
              </span>
              <span>{item.sku}</span>
              <span>{quantity.toLocaleString()}</span>
              <span>{warehouse?.name ?? "Unknown"}</span>
              <span>{item.storageLocation || "—"}</span>
              <span className="actions">
                <button className="link" onClick={() => onEdit(item)}>
                  Edit
                </button>
                {onTransfer && (
                  <button className="link" onClick={() => onTransfer(item)}>
                    Transfer
                  </button>
                )}
                <button className="link danger" onClick={() => onDelete(item)}>
                  Delete
                </button>
              </span>
            </div>
            {renderInlineEdit ? renderInlineEdit(item) : null}
          </div>
        );
      })}
      {items.length === 0 && (
        <div className="empty">
          <p>No items match the filters. Try clearing your search.</p>
        </div>
      )}
      {renderFooter ? renderFooter() : null}
    </div>
  );
}
