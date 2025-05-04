package com.example.collisionservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Data
@Document(collection = "collision_alerts")
public class CollisionAlert {
    @Id
    private String id;

    private List<String> satellites;
    private String time;
    
    @JsonProperty("distance_km")
    private double distanceKm;
    
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
} 