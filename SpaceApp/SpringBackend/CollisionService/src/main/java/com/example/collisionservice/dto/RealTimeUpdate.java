package com.example.collisionservice.dto;

public class RealTimeUpdate {
    private String type;
    private Object data;
    private String timestamp;

    public RealTimeUpdate(String type, Object data, String timestamp) {
        this.type = type;
        this.data = data;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
} 