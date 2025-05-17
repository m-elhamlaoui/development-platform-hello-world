package org.example.healthmonitoringservice.Services.interfaces;

import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;

public interface HealthStatusService {

    HealthStatusDTO getLatestStatusForSatellite(int satelliteId) ;
}
