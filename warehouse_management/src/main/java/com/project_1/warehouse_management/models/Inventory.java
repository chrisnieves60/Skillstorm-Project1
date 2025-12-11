package com.project_1.warehouse_management.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity //tells hibernate this maps to row in db 
@Table(name="inventory") //needed bc db table name is diff from class 
public class Inventory {
    @Id //tells JPA Hibernate this is our primary key 
    @Column //tells jpa this is a column 
    @GeneratedValue(strategy = GenerationType.IDENTITY) //tells jpa this is auto incremented. 
    private int id; 

    @ManyToOne
    @JoinColumn(name="warehouse_id") 
    @JsonBackReference //When converting object to JSON, DO NOT serialize field. prevent infinite loop. 
    private Warehouse warehouse;  

    @Column 
    private String name; 

    @Column 
    private String sku; 
    
    @Column 
    private String description; 

    @Column 
    private int quantity; 

    @Column 
    private String storageLocation;

    public Inventory() {

    }
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
    public int getWarehouseId() {
    return warehouse != null ? warehouse.getId() : 0;
}

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public Inventory(int id, Warehouse warehouse, String name, String sku, String description, int quantity,
            String storageLocation) {
        this.id = id;
        this.warehouse = warehouse;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.quantity = quantity;
        this.storageLocation = storageLocation;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + id;
        result = prime * result + ((warehouse == null) ? 0 : warehouse.hashCode());
        result = prime * result + ((name == null) ? 0 : name.hashCode());
        result = prime * result + ((sku == null) ? 0 : sku.hashCode());
        result = prime * result + ((description == null) ? 0 : description.hashCode());
        result = prime * result + quantity;
        result = prime * result + ((storageLocation == null) ? 0 : storageLocation.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Inventory other = (Inventory) obj;
        if (id != other.id)
            return false;
        if (warehouse == null) {
            if (other.warehouse != null)
                return false;
        } else if (!warehouse.equals(other.warehouse))
            return false;
        if (name == null) {
            if (other.name != null)
                return false;
        } else if (!name.equals(other.name))
            return false;
        if (sku == null) {
            if (other.sku != null)
                return false;
        } else if (!sku.equals(other.sku))
            return false;
        if (description == null) {
            if (other.description != null)
                return false;
        } else if (!description.equals(other.description))
            return false;
        if (quantity != other.quantity)
            return false;
        if (storageLocation == null) {
            if (other.storageLocation != null)
                return false;
        } else if (!storageLocation.equals(other.storageLocation))
            return false;
        return true;
    }

    @Override
    public String toString() {
        return "Inventory [id=" + id + ", warehouse=" + warehouse + ", name=" + name + ", sku=" + sku + ", description="
                + description + ", quantity=" + quantity + ", storageLocation=" + storageLocation + "]";
    }


}