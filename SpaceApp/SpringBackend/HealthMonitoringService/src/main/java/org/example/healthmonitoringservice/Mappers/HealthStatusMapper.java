package org.example.healthmonitoringservice.Mappers;

import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Entities.HealthStatus;

public class HealthStatusMapper {
    public static HealthStatusDTO toDTO(HealthStatus entity) {
        return HealthStatusDTO.builder()
                .satelliteId(entity.getSatelliteId())
                .satelliteName(entity.getSatelliteName())
                .prediction(entity.getPrediction())
                .probability(entity.getProbability())
                .explanation(entity.getExplanation())
                .build();
    }

    // Optional: if you ever need to map back
    public static HealthStatus fromDTO(HealthStatusDTO dto) {
        return HealthStatus.builder()
                .satelliteId(dto.getSatelliteId())
                .satelliteName(dto.getSatelliteName())
                .prediction(dto.getPrediction())
                .probability(dto.getProbability())
                .explanation(dto.getExplanation())
                .build();
    }
}
