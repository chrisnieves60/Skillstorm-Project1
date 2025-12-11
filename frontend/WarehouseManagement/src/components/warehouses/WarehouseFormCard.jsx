export default function WarehouseFormCard({
  eyebrow,
  title,
  form,
  onChange,
  onSubmit,
  submitLabel,
  accent = false,
  onCancel,
  includeCapacity = false,
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
            placeholder="E.g., Northridge Fulfillment"
            required
          />
        </label>
        <label>
          Location
          <input
            value={form.location}
            onChange={(e) => onChange({ ...form, location: e.target.value })}
            placeholder="City, State"
            required
          />
        </label>
        <label>
          Maximum capacity
          <input
            type="number"
            min="0"
            value={form.maximumCapacity}
            onChange={(e) =>
              onChange({ ...form, maximumCapacity: e.target.value })
            }
            placeholder="Max units"
          />
        </label>
        {includeCapacity && (
          <label>
            Current used
            <input
              type="number"
              min="0"
              value={form.capacity}
              onChange={(e) => onChange({ ...form, capacity: e.target.value })}
            />
          </label>
        )}
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
