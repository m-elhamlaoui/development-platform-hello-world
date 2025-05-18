package org.example.healthmonitoringservice.DTOs;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class HealthStatusDTO {
    private Integer noradId;
    private String satelliteName;

    private Integer timeSinceLaunch;
    private Integer orbitalAltitude;
    private Float batteryVoltage;
    private Float solarPanelTemperature;
    private Float attitudeControlError;
    private Float dataTransmissionRate;
    private Integer thermalControlStatus;

    private Float prediction;
    private Float probability;

    private Map<String, Float> explanation;

    private LocalDateTime timestamp;
}
