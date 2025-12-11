import { useEffect, useMemo, useState } from "react";
import Pagination from "../components/Pagination";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventoryFormCard from "../components/inventory/InventoryFormCard";
import InventoryTable from "../components/inventory/InventoryTable";
import TransferModal from "../components/inventory/TransferModal";

const emptyItem = {
  name: "",
  sku: "",
  description: "",
  quantity: 1,
  storageLocation: "",
  warehouseId: "",
};

const emptyTransfer = {
  open: false,
  fromWarehouseId: 0,
  toWarehouseId: 0,
  inventoryId: 0,
  quantity: 0,
  storageLocation: "",
};

const apiBase = "http://localhost:8080";
const PAGE_SIZE = 10;

const toClientItem = (item) => ({
  ...item,
  warehouseId:
    item.warehouseId ??
    item.warehouse_id ??
    (typeof item.warehouse === "object"
      ? item.warehouse?.id
      : item.warehouse) ??
    "",
});

const toApiPayload = (item) => {
  const { warehouseId, warehouse_id, warehouse, ...rest } = item;
  const resolvedWarehouseId =
    warehouseId ??
    warehouse_id ??
    (typeof warehouse === "object" ? warehouse?.id : warehouse) ??
    "";
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
  const [transfer, setTransfer] = useState(emptyTransfer);
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
  }, []);

  const filteredItems = useMemo(() => {
    const search = filters.search.toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search);

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
    const qty = Math.min(50, Number(item.quantity) || 0);
    setTransfer({
      open: true,
      id: item.id,
      quantity: qty,
      destination:
        warehouses.find((w) => w.id !== item.warehouseId)?.id || "",
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
        const sourceWarehouseId = items.find((i) => i.id === transfer.id)
          ?.warehouseId;
        await fetch(`${apiBase}/warehouses/transfer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inventoryId: transfer.id,
            fromWarehouseId: sourceWarehouseId,
            toWarehouseId: transfer.destination,
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
    setTransfer(emptyTransfer);
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
        <InventoryFilters
          filters={filters}
          warehouses={warehouses}
          onChange={setFilters}
        />
      </section>

      <section className="grid two-columns">
        <InventoryFormCard
          eyebrow="Create"
          title="Add inventory item"
          form={form}
          warehouses={warehouses}
          onChange={setForm}
          onSubmit={handleAdd}
          submitLabel="Add item"
        />

        {editingId && (
          <InventoryFormCard
            eyebrow="Edit"
            title="Update item"
            form={editForm}
            warehouses={warehouses}
            onChange={setEditForm}
            onSubmit={handleUpdate}
            submitLabel="Save item"
            accent
            onCancel={() => setEditingId(null)}
          />
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h3>Inventory list</h3>
          </div>
        </div>

        <InventoryTable
          items={paginatedItems}
          warehouses={warehouses}
          onEdit={startEdit}
          onTransfer={openTransfer}
          onDelete={handleDelete}
        />
        {filteredItems.length > 0 && (
          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={(num) => setPage(num)}
          />
        )}
      </section>

      <TransferModal
        transfer={transfer}
        warehouses={warehouses}
        onClose={() => setTransfer(emptyTransfer)}
        onChange={setTransfer}
        onSubmit={submitTransfer}
      />
    </div>
  );
}
