package com.project_1.warehouse_management.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.project_1.warehouse_management.repositories.InventoryRepository;
import com.project_1.warehouse_management.repositories.WarehouseRepository;
import com.project_1.warehouse_management.models.Inventory;
import com.project_1.warehouse_management.models.Warehouse;
@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;  //Instantiate repositroy,
    private final WarehouseRepository warehouseRepository;  //Instantiate repositroy,

    //constructor injection for beans 
    public InventoryService(InventoryRepository inventoryRepository, WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository; 
        this.inventoryRepository = inventoryRepository; 
    }

    public List<Inventory> findAllInventories() { //return list of inventories 
        return inventoryRepository.findAll(); //SELECT * FROM Inventory
    }
    public Inventory findInventoryById(int id) {
        Optional<Inventory> inventory = inventoryRepository.findById(id); 
        if(inventory.isPresent()) {
            return inventory.get(); //return object from the optional
        }
        else {
            throw new IllegalArgumentException("No inventory with that ID"); 
        }
    }
    public void deleteInventoryById(int id) { 
        inventoryRepository.deleteById(id);
    }
    public Inventory createInventory(Inventory inventory, int warehouse_id) {

        //Check if dup exists in the same warehouse
        Inventory existing = inventoryRepository.findByWarehouse_IdAndSkuAndStorageLocation(warehouse_id, inventory.getSku(), inventory.getStorageLocation()); 

        Warehouse warehouse = warehouseRepository.findById(warehouse_id).orElseThrow(() -> new RuntimeException("Inventory not found")); 

        List<Inventory> inventoryItems = warehouse.getInventory(); //get inventory items as list from warehouse object 
        int capacity = 0; 
        for (Inventory item : inventoryItems) {
            int quantity = item.getQuantity(); 
            capacity+=quantity; 
        }
        
        //HANDLE DUPLICATE LOGIC
        if (existing != null) {
            //merge quantities
            if (capacity + inventory.getQuantity() > warehouse.getMaximumCapacity()) {
                throw new RuntimeException("Warehouse is at or over capacity");
            }
            existing.setQuantity(existing.getQuantity() + inventory.getQuantity()); 
            return inventoryRepository.save(existing); 
        }

       
        if (capacity + inventory.getQuantity() > warehouse.getMaximumCapacity()) {
            throw new RuntimeException("Warehouse is at or over capacity");
        }

        inventory.setWarehouse(warehouse);

        return inventoryRepository.save(inventory); 
    }
    public Inventory updateInventory(int id, Inventory newData) {
        Inventory exists = inventoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Inventory not found")); 

        exists.setDescription(newData.getDescription()); 
        exists.setName(newData.getName()); 
        exists.setQuantity(newData.getQuantity()); 
        exists.setSku(newData.getSku()); 
        exists.setStorageLocation(newData.getStorageLocation()); 
        exists.setWarehouse(newData.getWarehouse()); 

        return inventoryRepository.save(exists); //if exists is in the db, itll update it, if not, Error happens. 
    }
}
