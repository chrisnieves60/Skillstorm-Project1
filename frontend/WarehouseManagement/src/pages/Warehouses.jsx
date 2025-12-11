import { useEffect, useMemo, useState } from "react";
import CapacityDial from "../components/CapacityDial";

const emptyForm = {
  name: "",
  location: "",
  maximumCapacity: 1000,
  capacity: 0,
};

const apiBase = "http://localhost:8080";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch(`${apiBase}/warehouses`);
        const warehouseList = await res.json();

        const enriched = await Promise.all(
          warehouseList.map(async (w) => {
            const capRes = await fetch(
              `${apiBase}/warehouses/${w.id}/capacity`
            );
            const capacity = await capRes.json();
            return { ...w, capacity };
          })
        );

        setWarehouses(enriched);
      } catch (error) {
        console.error("Error fetching warehouses", error);
      }
    };

    fetchWarehouses();
  }, []);

  const filteredWarehouses = useMemo(() => {
    if (!filter) return warehouses;
    return warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(filter.toLowerCase()) ||
        w.location.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, warehouses]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;

    const payload = {
      ...form, //form object is entire warehouse object.

      maximumCapacity: Number(form.maximumCapacity) || 0,
    };

    const addWarehouse = async () => {
      try {
        const res = await fetch(`${apiBase}/warehouses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const saved = await res.json();
          setWarehouses((prev) => [...prev, { ...payload, ...saved }]);
        } else {
          setWarehouses((prev) => [...prev, payload]);
          console.warn("Falling back to local add");
        }
      } catch (error) {
        console.error("Error creating warehouse, keeping local copy", error);
        setWarehouses((prev) => [...prev, payload]);
      }
    };

    addWarehouse();
    setForm(emptyForm);
  };

  const startEdit = (warehouse) => {
    setEditingId(warehouse.id);
    setEditForm({
      name: warehouse.name,
      location: warehouse.location,
      maximumCapacity: warehouse.maximumCapacity ?? warehouse.capacity ?? 0,
      capacity: warehouse.capacity ?? 0,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingId) return;

    const payload = {
      ...editForm,
      maximumCapacity: Number(editForm.maximumCapacity) || 0,
      capacity: Number(editForm.capacity) || 0,
    };

    const updateWarehouse = async () => {
      try {
        const res = await fetch(`${apiBase}/warehouses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.warn("Update call failed; applying optimistic update");
        }

        setWarehouses((prev) =>
          prev.map((w) => (w.id === editingId ? { ...w, ...payload } : w))
        );
        setEditingId(null);
        setEditForm(emptyForm);
      } catch (error) {
        console.error("Error updating warehouse", error);
      }
    };

    updateWarehouse();
  };

  const handleDelete = (warehouse) => {
    const confirmed = window.confirm(
      `Delete ${warehouse.name}? Its inventory will be deleted as well.`
    );
    if (confirmed) {
      const deleteWarehouse = async () => {
        try {
          const res = await fetch(`${apiBase}/warehouses/${warehouse.id}`, {
            method: "Delete",
          });
          if (!res.ok) {
            console.error("Failed to delete warehouse");
          } else if (res.ok) {
            setWarehouses((prev) => prev.filter((w) => w.id !== warehouse.id));
          }
        } catch (error) {
          console.error("Error deleting warehouses", error);
        }
      };
      deleteWarehouse();
    }
  };

  return (
    <div className="stack">
      <section className="panel hero tight">
        <div>
          <p className="eyebrow">Warehouse Network</p>
          <h2>Manage sites, capacities, and readiness</h2>
          <p className="muted">
            Add new nodes, adjust caps when floor plans change, and keep
            locations tidy. Capacity rules prevent overstocking.
          </p>
        </div>
        <div className="hero-meter">
          <div className="meter small">
            <div
              className="meter-fill"
              style={{
                width: `${Math.min(
                  (warehouses.reduce((sum, w) => sum + (w.capacity ?? 0), 0) /
                    Math.max(
                      warehouses.reduce(
                        (sum, w) =>
                          sum + (w.maximumCapacity ?? w.capacity ?? 0),
                        0
                      ) || 1,
                      1
                    )) *
                    100,
                  100
                ).toFixed(1)}%`,
              }}
            />
          </div>
          <p className="muted">
            Total used:{" "}
            <strong>
              {warehouses
                .reduce((sum, w) => sum + (w.capacity ?? 0), 0)
                .toLocaleString()}{" "}
              /
              {warehouses
                .reduce(
                  (sum, w) => sum + (w.maximumCapacity ?? w.capacity ?? 0),
                  0
                )
                .toLocaleString()}{" "}
              units
            </strong>
          </p>
        </div>
      </section>

      <section className="grid two-columns">
        <form className="panel form-card" onSubmit={handleAdd}>
          <p className="eyebrow">Create</p>
          <h3>Add a new warehouse</h3>
          <div className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="E.g., Northridge Fulfillment"
                required
              />
            </label>
            <label>
              Location
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
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
                  setForm({ ...form, maximumCapacity: e.target.value })
                }
                placeholder="Max units"
              />
            </label>
          </div>
          <button type="submit" className="btn">
            Add warehouse
          </button>
        </form>

        {editingId && (
          <form className="panel form-card accent" onSubmit={handleUpdate}>
            <p className="eyebrow">Edit</p>
            <h3>Update warehouse</h3>
            <div className="form-grid">
              <label>
                Name
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Location
                <input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Maximum capacity
                <input
                  type="number"
                  min="0"
                  value={editForm.maximumCapacity}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maximumCapacity: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Current used
                <input
                  type="number"
                  min="0"
                  value={editForm.capacity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, capacity: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn">
                Save changes
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Network</p>
            <h3>All warehouses</h3>
          </div>
          <div className="filters">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by name or location"
            />
          </div>
        </div>

        <div className="table warehouse-table">
          <div className="table-head">
            <span>Name</span>
            <span>Location</span>
            <span>Capacity</span>
            <span>Utilization</span>
            <span>Used</span>
            <span>Actions</span>
          </div>
          {filteredWarehouses.map((w) => {
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
                  <CapacityDial
                    used={used}
                    max={max || 1}
                    label={`${percent}%`}
                  />
                </span>
                <span>{remaining.toLocaleString()} left</span>
                <span className="actions">
                  <button className="link" onClick={() => startEdit(w)}>
                    Edit
                  </button>
                  <button
                    className="link danger"
                    onClick={() => handleDelete(w)}
                  >
                    Delete
                  </button>
                </span>
              </div>
            );
          })}
          {filteredWarehouses.length === 0 && (
            <div className="empty">
              <p>No warehouses match your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
