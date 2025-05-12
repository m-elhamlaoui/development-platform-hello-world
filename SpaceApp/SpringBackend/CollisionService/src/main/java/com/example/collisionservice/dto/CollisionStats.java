package com.example.collisionservice.dto;

import java.util.List;

public class CollisionStats {
    private int totalCollisions;
    private int activeAlerts;
    private DangerLevels dangerLevels;
    private List<CollisionAlert> recentCollisions;

    public static class DangerLevels {
        private int LOW;
        private int MODERATE;
        private int HIGH;
        private int CRITICAL;

        // Getters and Setters
        public int getLOW() { return LOW; }
        public void setLOW(int LOW) { this.LOW = LOW; }
        public int getMODERATE() { return MODERATE; }
        public void setMODERATE(int MODERATE) { this.MODERATE = MODERATE; }
        public int getHIGH() { return HIGH; }
        public void setHIGH(int HIGH) { this.HIGH = HIGH; }
        public int getCRITICAL() { return CRITICAL; }
        public void setCRITICAL(int CRITICAL) { this.CRITICAL = CRITICAL; }
    }

    // Getters and Setters
    public int getTotalCollisions() { return totalCollisions; }
    public void setTotalCollisions(int totalCollisions) { this.totalCollisions = totalCollisions; }
    public int getActiveAlerts() { return activeAlerts; }
    public void setActiveAlerts(int activeAlerts) { this.activeAlerts = activeAlerts; }
    public DangerLevels getDangerLevels() { return dangerLevels; }
    public void setDangerLevels(DangerLevels dangerLevels) { this.dangerLevels = dangerLevels; }
    public List<CollisionAlert> getRecentCollisions() { return recentCollisions; }
    public void setRecentCollisions(List<CollisionAlert> recentCollisions) { this.recentCollisions = recentCollisions; }
} 