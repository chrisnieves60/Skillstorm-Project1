export default function TransferModal({
  transfer,
  warehouses,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!transfer.open) return null;

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
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Destination warehouse
              <select
                value={transfer.destination}
                onChange={(e) =>
                  onChange({ ...transfer, destination: e.target.value })
                }
              >
                <option value="">Select</option>
                {warehouses.map((w) => (
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
                value={transfer.quantity}
                onChange={(e) =>
                  onChange({ ...transfer, quantity: e.target.value })
                }
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
