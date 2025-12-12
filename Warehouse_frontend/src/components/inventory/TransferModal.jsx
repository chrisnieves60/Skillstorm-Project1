export default function TransferModal({
  open,
  item,
  warehouses,
  destination,
  quantity,
  storageLocation,
  onDestinationChange,
  onQuantityChange,
  onStorageLocationChange,
  onClose,
  onSubmit,
}) {
  if (!open || !item) return null;

  return (
    <div className="modal">
      <div className="modal-body">
        <div className="panel">
          <div className="panel-header">
            <h3>Transfer inventory</h3>
            <button className="link" onClick={onClose}>
              Close
            </button>
          </div>
          <div className="muted" style={{ marginBottom: "8px" }}>
            {item.name} (Qty: {item.quantity})
          </div>
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Destination warehouse
              <select
                value={destination}
                onChange={(e) => onDestinationChange(e.target.value)}
                required
              >
                <option value="">Select</option>
                {warehouses
                  .filter((w) => w.id !== item.warehouseId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Quantity to move
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => onQuantityChange(e.target.value)}
                required
              />
            </label>
            <label>
              Storage location (destination)
              <input
                value={storageLocation}
                onChange={(e) => onStorageLocationChange(e.target.value)}
                placeholder="Aisle / bay"
              />
            </label>
            <div className="actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn">
                Transfer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
