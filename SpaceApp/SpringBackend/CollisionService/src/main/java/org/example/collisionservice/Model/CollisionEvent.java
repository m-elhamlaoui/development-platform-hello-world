package org.example.collisionservice.Model;



import java.util.List;
import java.util.Map;

public class CollisionEvent {
    private String user;
    private List<String> satellites; // Adjust based on actual structure
    private List<Map<String, Object>> collisions; // Updated to handle array of objects

    // Getters and setters
    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public List<String> getSatellites() {
        return satellites;
    }

    public void setSatellites(List<String> satellites) {
        this.satellites = satellites;
    }

    public List<Map<String, Object>> getCollisions() {
        return collisions;
    }

    public void setCollisions(List<Map<String, Object>> collisions) {
        this.collisions = collisions;
    }
}