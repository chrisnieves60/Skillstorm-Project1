package com.project_1.warehouse_management.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity //tells hibernate this maps to row in db
@Table(name="warehouse") //needed bc db table name is diff from class
public class Warehouse {
    @Id //tells JPA Hibernate this is our primary key
    @Column //tells jpa this is a column
    @GeneratedValue(strategy = GenerationType.IDENTITY) //tells jpa this is auto incremented.
    private int id; 

    @Column 
    private String name; 

    @Column 
    private String location; 
    
    @Column 
    private int maximumCapacity;

    @OneToMany(mappedBy = "warehouse", cascade=CascadeType.REMOVE, orphanRemoval = true)
    @JsonManagedReference
    private List<Inventory> inventory;

    public Warehouse() {

    }
    
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getMaximumCapacity() {
        return maximumCapacity;
    }

    public void setMaximumCapacity(int maximumCapacity) {
        this.maximumCapacity = maximumCapacity;
    }

    public List<Inventory> getInventory() {
        return inventory;
    }

    public void setInventory(List<Inventory> inventory) {
        this.inventory = inventory;
    }

    public Warehouse(int id, String name, String location, int maximumCapacity, List<Inventory> inventory) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.maximumCapacity = maximumCapacity;
        this.inventory = inventory;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + id;
        result = prime * result + ((name == null) ? 0 : name.hashCode());
        result = prime * result + ((location == null) ? 0 : location.hashCode());
        result = prime * result + maximumCapacity;
        result = prime * result + ((inventory == null) ? 0 : inventory.hashCode());
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
        Warehouse other = (Warehouse) obj;
        if (id != other.id)
            return false;
        if (name == null) {
            if (other.name != null)
                return false;
        } else if (!name.equals(other.name))
            return false;
        if (location == null) {
            if (other.location != null)
                return false;
        } else if (!location.equals(other.location))
            return false;
        if (maximumCapacity != other.maximumCapacity)
            return false;
        if (inventory == null) {
            if (other.inventory != null)
                return false;
        } else if (!inventory.equals(other.inventory))
            return false;
        return true;
    }

    @Override
    public String toString() {
        return "Warehouse [id=" + id + ", name=" + name + ", location=" + location + ", maximumCapacity="
                + maximumCapacity + ", inventory=" + inventory + "]";
    }





}