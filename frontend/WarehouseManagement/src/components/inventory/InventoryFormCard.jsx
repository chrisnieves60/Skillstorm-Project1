export default function InventoryFormCard({
  eyebrow,
  title,
  form,
  warehouses,
  onChange,
  onSubmit,
  submitLabel,
  accent = false,
  onCancel,
  hideWarehouse = false,
}) {
  return (
    <form
      className={`panel form-card ${accent ? "accent" : ""}`}
      onSubmit={onSubmit}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <div className="form-grid">
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="Product name"
            required
          />
        </label>
        <label>
          SKU
          <input
            value={form.sku}
            onChange={(e) => onChange({ ...form, sku: e.target.value })}
            placeholder="Unique code"
            required
          />
        </label>
        <label>
          Quantity
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => onChange({ ...form, quantity: e.target.value })}
          />
        </label>
        <label>
          Storage location
          <input
            value={form.storageLocation}
            onChange={(e) =>
              onChange({ ...form, storageLocation: e.target.value })
            }
            placeholder="Aisle / bay"
          />
        </label>
        {!hideWarehouse && (
          <label>
            Warehouse
            <select
              value={form.warehouseId}
              onChange={(e) =>
                onChange({ ...form, warehouseId: e.target.value })
              }
              required
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="full">
          Description
          <textarea
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            placeholder="Describe this Item"
            rows={3}
          />
        </label>
      </div>
      <div className="actions">
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
