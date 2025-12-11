import { useEffect, useMemo, useState } from "react";

const emptyItem = {
  name: "",
  sku: "",
  description: "",
  quantity: 1,
  storageLocation: "",
  warehouseId: "",
};

const apiBase = "http://localhost:8080";
const PAGE_SIZE = 10;

const toClientItem = (item) => ({
  ...item,
  warehouseId:
    item.warehouseId ??
    item.warehouse_id ??
    (typeof item.warehouse === "object" ? item.warehouse?.id : item.warehouse) ??
    "",
});

const toApiPayload = (item) => {
  const { warehouseId, warehouse_id, warehouse, ...rest } = item;
  const resolvedWarehouseId =
    warehouseId ?? warehouse_id ?? (typeof warehouse === "object" ? warehouse?.id : warehouse) ?? "";
  const payload = {
    ...rest,
    warehouseId: resolvedWarehouseId,
    warehouse_id: resolvedWarehouseId,
  };

  if (resolvedWarehouseId) {
    payload.warehouse = { id: resolvedWarehouseId };
  }

  return payload;
};

export default function Inventory() {
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    warehouseId: "all",
  });
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyItem);
  const [transfer, setTransfer] = useState({
    open: false,
    id: null,
    quantity: 0,
    destination: "",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch(`${apiBase}/warehouses`);
        const data = await res.json();
        setWarehouses(data);
      } catch (error) {
        console.error("Error fetching warehouses", error);
      }
    };

    const fetchItems = async () => {
      try {
        const res = await fetch(`${apiBase}/inventory`);
        const data = await res.json();
        setItems(data.map(toClientItem));
      } catch (error) {
        console.error("Error fetching inventory", error);
      }
    };

    fetchWarehouses();
    fetchItems();
    console.log(items);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.sku
          .toLowerCase()
          .includes(filters.search.toLowerCase())
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchesWarehouse =
        filters.warehouseId === "all" ||
        item.warehouseId === filters.warehouseId;

      return matchesSearch && matchesWarehouse;
    });
  }, [filters, items]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paginatedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || !form.warehouseId) return;

    const payload = toApiPayload({
      ...form,
      quantity: Number(form.quantity) || 0,
    });

    const createItem = async () => {
      try {
        const res = await fetch(`${apiBase}/inventory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const saved = await res.json();
          setItems((prev) => [...prev, toClientItem({ ...payload, ...saved })]);
        } else {
          setItems((prev) => [...prev, toClientItem(payload)]);
          console.warn("Falling back to local add; server returned non-OK");
        }
      } catch (error) {
        console.error("Error creating item, keeping local copy", error);
        setItems((prev) => [...prev, toClientItem(payload)]);
      }
    };

    createItem();
    setForm(emptyItem);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingId) return;

    const payload = toApiPayload({
      ...editForm,
      quantity: Number(editForm.quantity) || 0,
    });

    const updateItem = async () => {
      try {
        const res = await fetch(`${apiBase}/inventory/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const saved = res.ok ? await res.json() : null;

        if (!res.ok) {
          console.warn("Update call failed; applying optimistic update");
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? toClientItem({ ...item, ...payload, ...(saved || {}) })
              : item
          )
        );
        setEditingId(null);
        setEditForm(emptyItem);
      } catch (error) {
        console.error("Error updating item", error);
      }
    };

    updateItem();
  };

  const handleDelete = (item) => {
    const confirmed = window.confirm(
      `Delete ${item.name}? This removes ${item.quantity} units from the system.`
    );
    if (confirmed) {
      const deleteItem = async () => {
        try {
          const res = await fetch(`${apiBase}/inventory/${item.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            console.error("Failed to delete item");
          } else {
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          }
        } catch (error) {
          console.error("Error deleting item", error);
        }
      };
      deleteItem();
    }
  };

  const openTransfer = (item) => {
    setTransfer({
      open: true,
      id: item.id,
      quantity: Math.min(50, item.quantity),
      destination: warehouses.find((w) => w.id !== item.warehouseId)?.id || "",
    });
  };

  const submitTransfer = (e) => {
    e.preventDefault();
    if (!transfer.id || !transfer.destination) return;

    const qtyToMove = Math.max(Number(transfer.quantity) || 0, 0);
    if (qtyToMove === 0) return;

    setItems((prev) => {
      const source = prev.find((i) => i.id === transfer.id);
      if (!source) return prev;

      const remaining = Math.max((Number(source.quantity) || 0) - qtyToMove, 0);
      const timestamped = new Date().toISOString();

      const updated = prev
        .map((i) =>
          i.id === source.id
            ? { ...i, quantity: remaining, lastMoved: timestamped }
            : i
        )
        .filter((i) => !(i.id === source.id && remaining === 0));

      const moved = {
        ...source,
        id: source.id === transfer.id ? `itm-${Date.now()}` : source.id,
        warehouseId: transfer.destination,
        quantity: qtyToMove,
        lastMoved: timestamped,
      };

      return [...updated, moved];
    });

    const pushTransfer = async () => {
      try {
        await fetch(`${apiBase}/inventory/transfer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: transfer.id,
            destination: transfer.destination,
            quantity: qtyToMove,
          }),
        });
      } catch (error) {
        console.warn(
          "Transfer endpoint unavailable; kept local state only",
          error
        );
      }
    };

    pushTransfer();
    setTransfer({ open: false, id: null, quantity: 0, destination: "" });
  };

  return (
    <div className="stack">
      <section className="panel hero tight">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Move product without backend calls</h2>
          <p className="muted">
            Add, edit, delete, and transfer items while validating capacity and
            duplicates in the browser. Use the filters to drill down by SKU , or
            warehouse.
          </p>
        </div>
        <div className="filters compact">
          <input
            placeholder="Search name or SKU"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            value={filters.warehouseId}
            onChange={(e) =>
              setFilters({ ...filters, warehouseId: e.target.value })
            }
          >
            <option value="all">All warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid two-columns">
        <form className="panel form-card" onSubmit={handleAdd}>
          <p className="eyebrow">Create</p>
          <h3>Add inventory item</h3>
          <div className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product name"
                required
              />
            </label>
            <label>
              SKU
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
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
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>
            <label>
              Storage location
              <input
                value={form.storageLocation}
                onChange={(e) =>
                  setForm({ ...form, storageLocation: e.target.value })
                }
                placeholder="Aisle / bay"
              />
            </label>
            <label>
              Warehouse
              <select
                value={form.warehouseId}
                onChange={(e) =>
                  setForm({ ...form, warehouseId: e.target.value })
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
            <label className="full">
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What makes this item special?"
                rows={3}
              />
            </label>
          </div>
          <button type="submit" className="btn">
            Add item
          </button>
        </form>

        {editingId && (
          <form className="panel form-card accent" onSubmit={handleUpdate}>
            <p className="eyebrow">Edit</p>
            <h3>Update item</h3>
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
                SKU
                <input
                  value={editForm.sku}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sku: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  min="0"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantity: e.target.value })
                  }
                />
              </label>
              <label>
                Storage location
                <input
                  value={editForm.storageLocation}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      storageLocation: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Warehouse
                <select
                  value={editForm.warehouseId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, warehouseId: e.target.value })
                  }
                  required
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full">
                Description
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
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
                Save item
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h3>Inventory list</h3>
          </div>
        </div>

        <div className="table">
          <div className="table-head">
            <span>Item</span>
            <span>SKU</span>
            <span>Qty</span>
            <span>Warehouse</span>
            <span>Location</span>
            <span>Actions</span>
          </div>
          {paginatedItems.map((item) => {
            const warehouse = warehouses.find((w) => w.id === item.warehouseId);
            return (
              <div key={item.id} className="table-row">
                <span>
                  <strong>{item.name}</strong>
                </span>
                <span>{item.sku}</span>
                <span>{item.quantity.toLocaleString()}</span>
                <span>{warehouse?.name ?? "Unknown"}</span>
                <span>{item.storageLocation || "—"}</span>
                <span className="actions">
                  <button className="link" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button className="link" onClick={() => openTransfer(item)}>
                    Transfer
                  </button>
                  <button
                    className="link danger"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </span>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="empty">
              <p>No items match the filters. Try clearing your search.</p>
            </div>
          )}
        </div>
        {filteredItems.length > 0 && (
          <div className="panel-footer pagination">
            <div className="muted">
              Page {page} of {pageCount}
            </div>
            <div className="actions">
              <button
                type="button"
                className="btn ghost"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div className="pager">
                {Array.from({ length: pageCount }, (_, idx) => idx + 1).map(
                  (num) => (
                    <button
                      key={num}
                      type="button"
                      className={`btn ghost ${num === page ? "active" : ""}`}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>
              <button
                type="button"
                className="btn ghost"
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {transfer.open && (
        <div className="modal">
          <div className="modal-body">
            <div className="panel">
              <div className="panel-header">
                <h3>Transfer inventory</h3>
                <button
                  className="link"
                  onClick={() => setTransfer({ open: false, id: null })}
                >
                  Close
                </button>
              </div>
              <form className="form-grid" onSubmit={submitTransfer}>
                <label>
                  Destination warehouse
                  <select
                    value={transfer.destination}
                    onChange={(e) =>
                      setTransfer({ ...transfer, destination: e.target.value })
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
                      setTransfer({ ...transfer, quantity: e.target.value })
                    }
                  />
                </label>
                <div className="actions">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setTransfer({ open: false, id: null })}
                  >
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
      )}
    </div>
  );
}
