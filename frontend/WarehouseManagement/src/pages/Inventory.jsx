import { useEffect, useMemo, useState } from "react";
import Pagination from "../components/Pagination";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventoryFormCard from "../components/inventory/InventoryFormCard";
import InventoryTable from "../components/inventory/InventoryTable";
import TransferModal from "../components/inventory/TransferModal";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventory,
  getWarehouses,
  toApiPayload,
  toClientItem,
  transferInventory,
  updateInventoryItem,
} from "../api/inventory";

const emptyItem = {
  name: "",
  sku: "",
  description: "",
  quantity: 1,
  storageLocation: "",
  warehouseId: "",
};

const PAGE_SIZE = 10;

export default function Inventory({
  warehouses,
  setWarehouses,
  fetchWarehouses,
  inventory,
  setInventory,
  fetchInventory,
  showToast = () => {},
}) {
  const [items, setItems] = useState(inventory || []);
  const [filters, setFilters] = useState({
    search: "",
    warehouseId: "all",
  });
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyItem);
  const [page, setPage] = useState(1);
  const [transferModal, setTransferModal] = useState({
    open: false,
    item: null,
    destination: "",
    quantity: 1,
    storageLocation: "",
  });

  useEffect(() => {
    if (!warehouses || warehouses.length === 0) {
      fetchWarehouses?.();
    }
    if (!inventory || inventory.length === 0) {
      fetchInventory?.();
    }
  }, [fetchInventory, fetchWarehouses, inventory, warehouses]);

  useEffect(() => {
    setItems(inventory || []);
  }, [inventory]);

  /**
   * filter functionality for search/warehouse dropdown GRADE NOTE: (Didnt have time to complete this in the backend)
   */
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

  /**
   * add functionality for new inventory item
   */
  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || !form.warehouseId) return;

    const payload = toApiPayload({
      ...form,
      quantity: Number(form.quantity) || 0,
    });

    const createItem = async () => {
      try {
        const saved = await createInventoryItem(payload);
        const newItem = toClientItem({ ...payload, ...saved });
        setItems((prev) => [...prev, newItem]);
        setInventory((prev) => [...prev, newItem]);
        setForm(emptyItem);
      } catch (error) {
        console.error("Error creating item", error);
      }
    };

    createItem();
  };

  /**
   * Starts editing by populating edit form
   */
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  /**
   * update functionality for inventory items
   */
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingId) return;

    const payload = toApiPayload({
      ...editForm,
      quantity: Number(editForm.quantity) || 0,
    });

    const updateItem = async () => {
      try {
        const saved = await updateInventoryItem(editingId, payload);

        const updatedItems = items.map((item) =>
          item.id === editingId
            ? toClientItem({ ...item, ...payload, ...(saved || {}) })
            : item
        );
        setItems(updatedItems);
        setInventory(updatedItems);
        setEditingId(null);
        setEditForm(emptyItem);
      } catch (error) {
        console.error("Error updating item", error);
      }
    };

    updateItem();
  };

  /**
   * delete functionality (with confirmation modal/alert)
   */
  const handleDelete = (item) => {
    const confirmed = window.confirm(
      `Delete ${item.name}? This removes ${item.quantity} units from the system.`
    );
    if (confirmed) {
      const deleteItem = async () => {
        try {
          await deleteInventoryItem(item.id);
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          setInventory((prev) => prev.filter((i) => i.id !== item.id));
        } catch (error) {
          console.error("Error deleting item", error);
        }
      };
      deleteItem();
    }
  };

  /**
   * prepares transfer modal with defaults
   */
  const handleTransferOpen = (item) => {
    const firstDestination =
      warehouses.find((w) => w.id !== item.warehouseId)?.id || "";
    setTransferModal({
      open: true,
      item,
      destination: firstDestination,
      quantity: Math.min(Number(item.quantity) || 1, 1000),
      storageLocation: "",
    });
  };

  /**
   * transfer functionality between warehouses
   */
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const { item, destination, quantity, storageLocation } = transferModal;
    if (!item || !destination || destination === item.warehouseId) return;
    const qty = Math.max(Number(quantity) || 0, 0);
    if (qty <= 0) return;

    try {
      await transferInventory({
        inventoryId: item.id,
        fromWarehouseId: item.warehouseId,
        toWarehouseId: destination,
        quantity: qty,
        storageLocation,
      });
      await fetchInventory?.();
      showToast("Inventory transferred", "success");
    } catch (error) {
      console.error("Error transferring inventory", error);
    } finally {
      setTransferModal({
        open: false,
        item: null,
        destination: "",
        quantity: 1,
        storageLocation: "",
      });
    }
  };

  return (
    <div className="stack">
      <section className="panel hero tight">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Manage Inventory</h2>
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
          onDelete={handleDelete}
          onTransfer={handleTransferOpen}
          renderFooter={() =>
            filteredItems.length > 0 ? (
              <Pagination
                page={page}
                pageCount={pageCount}
                onChange={(num) => setPage(num)}
              />
            ) : null
          }
          renderInlineEdit={(item) =>
            editingId === item.id ? (
              <div className="panel form-card accent">
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
                  hideWarehouse
                />
              </div>
            ) : null
          }
        />
      </section>

      <TransferModal
        open={transferModal.open}
        item={transferModal.item}
        warehouses={warehouses}
        destination={transferModal.destination}
        quantity={transferModal.quantity}
        storageLocation={transferModal.storageLocation}
        onDestinationChange={(value) =>
          setTransferModal((prev) => ({ ...prev, destination: value }))
        }
        onQuantityChange={(value) =>
          setTransferModal((prev) => ({ ...prev, quantity: value }))
        }
        onStorageLocationChange={(value) =>
          setTransferModal((prev) => ({ ...prev, storageLocation: value }))
        }
        onClose={() =>
          setTransferModal({
            open: false,
            item: null,
            destination: "",
            quantity: 1,
            storageLocation: "",
          })
        }
        onSubmit={handleTransferSubmit}
      />
    </div>
  );
}
