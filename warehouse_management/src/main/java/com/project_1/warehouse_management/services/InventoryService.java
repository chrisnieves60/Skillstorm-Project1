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

    //constructor injection for beans 
    public InventoryService(InventoryRepository inventoryRepository) {
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
    public Inventory createInventory(Inventory inventory) {
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
