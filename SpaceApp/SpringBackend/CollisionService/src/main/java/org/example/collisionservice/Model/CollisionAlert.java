package org.example.collisionservice.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "collision_alerts")
public class CollisionAlert {
    @Id
    private String id;
    private LocalDateTime createdAt;

    private List<String> satellites;
    private String time;
    @JsonProperty("distance_km")
    private Double distanceKm;
    @JsonProperty("position1_km")
    private List<Double> position1Km;
    @JsonProperty("position2_km")
    private List<Double> position2Km;
    @JsonProperty("danger_level")
    private String dangerLevel;
    private String trend;
    @JsonProperty("distance_trend")
    private String distanceTrend;
    @JsonProperty("distance_history_km")
    private List<Double> distanceHistoryKm;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public List<String> getSatellites() { return satellites; }
    public void setSatellites(List<String> satellites) { this.satellites = satellites; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public List<Double> getPosition1Km() { return position1Km; }
    public void setPosition1Km(List<Double> position1Km) { this.position1Km = position1Km; }
    public List<Double> getPosition2Km() { return position2Km; }
    public void setPosition2Km(List<Double> position2Km) { this.position2Km = position2Km; }
    public String getDangerLevel() { return dangerLevel; }
    public void setDangerLevel(String dangerLevel) { this.dangerLevel = dangerLevel; }
    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }
    public List<Double> getDistanceHistoryKm() { return distanceHistoryKm; }
    public void setDistanceHistoryKm(List<Double> distanceHistoryKm) { this.distanceHistoryKm = distanceHistoryKm; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}