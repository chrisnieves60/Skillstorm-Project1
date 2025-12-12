import { useMemo, useState } from "react";
import WarehouseFormCard from "../components/warehouses/WarehouseFormCard";
import WarehouseHero from "../components/warehouses/WarehouseHero";
import WarehouseTable from "../components/warehouses/WarehouseTable";
import {
  createWarehouse,
  deleteWarehouse as deleteWarehouseApi,
  updateWarehouse as updateWarehouseApi,
} from "../api/warehouses";

const emptyForm = {
  name: "",
  location: "",
  maximumCapacity: 1000,
  capacity: 0,
};

export default function Warehouses({
  warehouses,
  setWarehouses,
  fetchWarehouses,
  showToast = () => {},
}) {
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  /**
   *  Filter warehouse functionality:
   *  */
  const filteredWarehouses = useMemo(() => {
    if (!filter) return warehouses;
    return warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(filter.toLowerCase()) ||
        w.location.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, warehouses]);

  /**
   *
   * Adding functionality,
   */

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;

    const payload = {
      ...form, //form object is warehouse add object.
    };

    const addWarehouse = async () => {
      try {
        const saved = await createWarehouse(payload);
        setWarehouses((prev) => [...prev, saved]);
        showToast("Warehouse added", "success");
      } catch (error) {
        console.error("Error creating warehouse", error);
      }
    };

    addWarehouse();
    setForm(emptyForm);
  };

  /**
   *
   * UPDATE functionality
   */
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
        const saved = await updateWarehouseApi(editingId, payload);
        setWarehouses((prev) =>
          prev.map((w) =>
            w.id === editingId ? { ...w, ...payload, ...saved } : w
          )
        );
        setEditingId(null);
        setEditForm(emptyForm);
      } catch (error) {
        console.error("Error updating warehouse", error);
      }
    };

    updateWarehouse();
  };
  /**
   *
   * Edit helper function
   */
  const startEdit = (warehouse) => {
    setEditingId(warehouse.id);
    setEditForm({
      name: warehouse.name,
      location: warehouse.location,
      maximumCapacity: warehouse.maximumCapacity ?? warehouse.capacity ?? 0,
      capacity: warehouse.capacity ?? 0,
    });
  };

  /**
   *
   *
   * Delete functionality
   */
  const handleDelete = (warehouse) => {
    const confirmed = window.confirm(
      `Delete ${warehouse.name}? Its inventory will be deleted as well.`
    );
    if (confirmed) {
      const deleteWarehouse = async () => {
        try {
          await deleteWarehouseApi(warehouse.id);
          setWarehouses((prev) => prev.filter((w) => w.id !== warehouse.id));
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
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Network</p>
            <h3>All warehouses</h3>
          </div>
          <div className="filters width" style={{ width: "200px" }}>
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
          renderInlineEdit={(w) =>
            editingId === w.id ? (
              <div
                className="panel form-card accent"
                style={{ marginTop: "8px" }}
              >
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
              </div>
            ) : null
          }
        />
      </section>
    </div>
  );
}
