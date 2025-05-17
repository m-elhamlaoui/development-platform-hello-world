package org.example.healthmonitoringservice.Entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "HealthStatus")
@AllArgsConstructor@Getter@Setter@NoArgsConstructor@Builder
public class HealthStatus {

    @Id
    private String id;

    private Integer norad_id;//norad_id
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

    // Optional: Store explanation as a map (feature → SHAP value or importance)
    private Map<String, Float> explanation;

    private LocalDateTime timestamp;
}
