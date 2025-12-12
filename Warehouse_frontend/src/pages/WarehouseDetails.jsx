import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InventoryTable from "../components/inventory/InventoryTable";
import TransferModal from "../components/inventory/TransferModal";
import {
  deleteInventoryItem,
  transferInventory,
  updateInventoryItem,
} from "../api/inventory";

export default function WarehouseDetails({
  warehouses,
  inventory,
  fetchInventory,
  showToast = () => {},
}) {
  const { id } = useParams();
  const [transferModal, setTransferModal] = useState({
    open: false,
    item: null,
    destination: "",
    quantity: 1,
    storageLocation: "",
  });
  const [itemsState, setItemsState] = useState(inventory || []);

  useEffect(() => {
    if (!inventory || inventory.length === 0) {
      fetchInventory?.();
    }
  }, [inventory, fetchInventory]);

  useEffect(() => {
    setItemsState(inventory || []);
  }, [inventory]);

  const warehouse = warehouses.find((w) => `${w.id}` === id);
  const items = useMemo(
    () => itemsState.filter((item) => `${item.warehouseId}` === id),
    [itemsState, id]
  );

  const totalQty = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

  const handleDelete = (item) => {
    const confirmed = window.confirm(
      `Delete ${item.name}? This removes ${item.quantity} units from the system.`
    );
    if (!confirmed) return;

    const doDelete = async () => {
      try {
        await deleteInventoryItem(item.id);
        await fetchInventory?.();
      } catch (error) {
        console.error("Error deleting item", error);
      }
    };

    doDelete();
  };

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

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const { item, destination, quantity, storageLocation } = transferModal;
    if (!item || !destination || destination === item.warehouseId) return;
    const qty = Math.max(Number(quantity) || 0, 0);
    if (qty <= 0) return;

    const destinationWarehouse = warehouses.find(
      (w) => `${w.id}` === `${destination}`
    );
    if (destinationWarehouse) {
      const maxCapacity =
        Number(
          destinationWarehouse.maximumCapacity ??
            destinationWarehouse.capacity ??
            0
        ) || 0;
      const destinationUsed = itemsState.reduce(
        (sum, inv) =>
          `${inv.warehouseId}` === `${destination}`
            ? sum + (Number(inv.quantity) || 0)
            : sum,
        0
      );

      if (maxCapacity > 0 && destinationUsed + qty > maxCapacity) {
        showToast(
          "Cannot transfer: quantity exceeds destination capacity",
          "error"
        );
        return;
      }
    }

    try {
      await transferInventory({
        inventoryId: item.id,
        fromWarehouseId: item.warehouseId,
        toWarehouseId: destination,
        quantity: qty,
        storageLocation,
      });
      await fetchInventory?.();
      showToast("inventory transferrd", "success");
    } catch (error) {
      console.error("error transferring inventory", error);
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

  if (!warehouse) {
    return (
      <div className="stack">
        <section className="panel">
          <p className="eyebrow">Warehouse</p>
          <h3>Not found</h3>
          <Link className="link" to="/warehouses">
            Back to warehouses
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="panel hero">
        <div>
          <p className="eyebrow">Warehouse</p>
          <h2>{warehouse.name}</h2>
          <p className="muted">{warehouse.location || "No location set"}</p>
        </div>
        <div className="hero-meter">
          <div className="meter small">
            <div
              className="meter-fill"
              style={{
                width: `${Math.min(
                  (Number(warehouse.capacity ?? 0) /
                    Math.max(
                      Number(warehouse.maximumCapacity ?? warehouse.capacity) ||
                        1,
                      1
                    )) *
                    100 || 0,
                  100
                ).toFixed(1)}%`,
              }}
            />
          </div>
          <p className="muted">
            {Number(warehouse.capacity ?? 0).toLocaleString()} /{" "}
            {Number(
              warehouse.maximumCapacity ?? warehouse.capacity ?? 0
            ).toLocaleString()}{" "}
            units
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inventory</p>
            <h3>Items stored here</h3>
            <p className="muted">
              Total items: {items.length} • Total quantity:{" "}
              {totalQty.toLocaleString()}
            </p>
          </div>
          <Link className="link" to="/warehouses">
            Back to warehouses
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="empty">
            <p>No inventory assigned to this warehouse.</p>
          </div>
        ) : (
          <InventoryTable
            items={items}
            warehouses={warehouses}
            onEdit={() => {}}
            onDelete={handleDelete}
            onTransfer={handleTransferOpen}
          />
        )}
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
