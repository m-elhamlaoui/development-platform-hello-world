package org.example.healthmonitoringservice.Mappers;

import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Entities.HealthStatus;

public class HealthStatusMapper {

    public static HealthStatusDTO toDTO(HealthStatus entity) {
        return HealthStatusDTO.builder()
                .noradId(entity.getNoradId())
                .satelliteName(entity.getSatelliteName())
                .timeSinceLaunch(entity.getTimeSinceLaunch())
                .orbitalAltitude(entity.getOrbitalAltitude())
                .batteryVoltage(entity.getBatteryVoltage())
                .solarPanelTemperature(entity.getSolarPanelTemperature())
                .attitudeControlError(entity.getAttitudeControlError())
                .dataTransmissionRate(entity.getDataTransmissionRate())
                .thermalControlStatus(entity.getThermalControlStatus())
                .prediction(entity.getPrediction())
                .probability(entity.getProbability())
                .explanation(entity.getExplanation())
                .timestamp(entity.getTimestamp())
                .build();
    }

    // Optional: if you ever need to map back
    public static HealthStatus fromDTO(HealthStatusDTO dto) {
        return HealthStatus.builder()
                .noradId(dto.getNoradId())
                .satelliteName(dto.getSatelliteName())
                .timeSinceLaunch(dto.getTimeSinceLaunch())
                .orbitalAltitude(dto.getOrbitalAltitude())
                .batteryVoltage(dto.getBatteryVoltage())
                .solarPanelTemperature(dto.getSolarPanelTemperature())
                .attitudeControlError(dto.getAttitudeControlError())
                .dataTransmissionRate(dto.getDataTransmissionRate())
                .thermalControlStatus(dto.getThermalControlStatus())
                .prediction(dto.getPrediction())
                .probability(dto.getProbability())
                .explanation(dto.getExplanation())
                .timestamp(dto.getTimestamp())
                .build();
    }
}
