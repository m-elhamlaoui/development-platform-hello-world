package org.example.healthmonitoringservice.Services.interfaces;

import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;

public interface HealthStatusService {

    public HealthStatusDTO getLatestStatusForSatellite(int satelliteId) ;
}
