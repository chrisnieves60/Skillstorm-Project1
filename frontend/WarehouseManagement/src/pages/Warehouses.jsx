import { useEffect, useMemo, useState } from "react";
import WarehouseFormCard from "../components/warehouses/WarehouseFormCard";
import WarehouseHero from "../components/warehouses/WarehouseHero";
import WarehouseTable from "../components/warehouses/WarehouseTable";

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
      <WarehouseHero warehouses={warehouses} />

      <section className="grid two-columns">
        <WarehouseFormCard
          eyebrow="Create"
          title="Add a new warehouse"
          form={form}
          onChange={setForm}
          onSubmit={handleAdd}
          submitLabel="Add warehouse"
        />

        {editingId && (
          <WarehouseFormCard
            eyebrow="Edit"
            title="Update warehouse"
            form={editForm}
            onChange={setEditForm}
            onSubmit={handleUpdate}
            submitLabel="Save changes"
            accent
            onCancel={() => setEditingId(null)}
            includeCapacity
          />
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

        <WarehouseTable
          warehouses={filteredWarehouses}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}
