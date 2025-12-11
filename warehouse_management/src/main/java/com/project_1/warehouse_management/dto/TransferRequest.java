package com.project_1.warehouse_management.dto;

public class TransferRequest {
    public int fromWarehouseId;
    public int toWarehouseId;
    public int inventoryId;
    public int quantity;
    public String storageLocation;
}