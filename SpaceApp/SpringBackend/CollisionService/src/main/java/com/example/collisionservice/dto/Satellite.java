package com.example.collisionservice.dto;

public class Satellite {
    private int id;
    private String name;
    private String orbitType;
    private String status;
    private String lastUpdate;
    private Position position;

    public static class Position {
        private double x;
        private double y;
        private double z;

        // Getters and Setters
        public double getX() { return x; }
        public void setX(double x) { this.x = x; }
        public double getY() { return y; }
        public void setY(double y) { this.y = y; }
        public double getZ() { return z; }
        public void setZ(double z) { this.z = z; }
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getOrbitType() { return orbitType; }
    public void setOrbitType(String orbitType) { this.orbitType = orbitType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLastUpdate() { return lastUpdate; }
    public void setLastUpdate(String lastUpdate) { this.lastUpdate = lastUpdate; }
    public Position getPosition() { return position; }
    public void setPosition(Position position) { this.position = position; }
} 