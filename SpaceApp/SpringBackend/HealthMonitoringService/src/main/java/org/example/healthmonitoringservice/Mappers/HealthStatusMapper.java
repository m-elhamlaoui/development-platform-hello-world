package org.example.healthmonitoringservice.Mappers;

import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Entities.HealthStatus;

public class HealthStatusMapper {
    public static HealthStatusDTO toDTO(HealthStatus entity) {
        return HealthStatusDTO.builder()
                .norad_id(entity.getNorad_id())
                .satelliteName(entity.getSatelliteName())
                .prediction(entity.getPrediction())
                .probability(entity.getProbability())
                .explanation(entity.getExplanation())
                .build();
    }

    // Optional: if you ever need to map back
    public static HealthStatus fromDTO(HealthStatusDTO dto) {
        return HealthStatus.builder()
                .norad_id(dto.getNorad_id())
                .satelliteName(dto.getSatelliteName())
                .prediction(dto.getPrediction())
                .probability(dto.getProbability())
                .explanation(dto.getExplanation())
                .build();
    }
}
