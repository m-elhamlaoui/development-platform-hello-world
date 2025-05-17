package org.example.healthmonitoringservice.DTOs;

import lombok.*;

import java.util.Map;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class HealthStatusDTO {
    private Integer norad_id;
    private String satelliteName;
    private Float prediction;
    private Float probability;
    private Map<String, Float> explanation;
}
