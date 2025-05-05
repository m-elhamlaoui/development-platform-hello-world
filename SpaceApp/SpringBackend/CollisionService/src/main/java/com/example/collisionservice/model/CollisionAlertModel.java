package com.example.collisionservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.util.List;

@Document(collection = "collision_alerts")
public class CollisionAlertModel {
    @Id
    private String id;
    private List<String> satellites;
    private String time;
    private String trend;
    
    @Field("distance_km")
    private double distanceKm;
    
    @Field("position1_km")
    private List<Double> position1Km;
    
    @Field("position2_km")
    private List<Double> position2Km;
    
    @Field("danger_level")
    private String dangerLevel;
    
    @Field("distance_trend")
    private String distanceTrend;
    
    @Field("distance_history_km")
    private List<Double> distanceHistoryKm;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public List<String> getSatellites() { return satellites; }
    public void setSatellites(List<String> satellites) { this.satellites = satellites; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }
    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public List<Double> getPosition1Km() { return position1Km; }
    public void setPosition1Km(List<Double> position1Km) { this.position1Km = position1Km; }
    public List<Double> getPosition2Km() { return position2Km; }
    public void setPosition2Km(List<Double> position2Km) { this.position2Km = position2Km; }
    public String getDangerLevel() { return dangerLevel; }
    public void setDangerLevel(String dangerLevel) { this.dangerLevel = dangerLevel; }
    public String getDistanceTrend() { return distanceTrend; }
    public void setDistanceTrend(String distanceTrend) { this.distanceTrend = distanceTrend; }
    public List<Double> getDistanceHistoryKm() { return distanceHistoryKm; }
    public void setDistanceHistoryKm(List<Double> distanceHistoryKm) { this.distanceHistoryKm = distanceHistoryKm; }
} 