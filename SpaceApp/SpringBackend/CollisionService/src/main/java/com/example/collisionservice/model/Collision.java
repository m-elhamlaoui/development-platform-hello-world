package com.example.collisionservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class Collision {
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
} 