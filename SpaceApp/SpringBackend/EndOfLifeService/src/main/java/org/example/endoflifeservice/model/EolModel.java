package org.example.endoflifeservice.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "Eol_collection")
public class EolModel {

    @Id
    private String id;

    @JsonProperty("Norad_id")
    private int norad;
    private double eccentricity;
    private double orbital_velocity_approx;
    private double raan;
    private int collision_warning;
    private double orbital_altitude;
    private double line1_epoch;
    private double motion_launch_interaction;
    private double mean_motion;
    private double prediction;
    private LocalDateTime timestamp;
}
