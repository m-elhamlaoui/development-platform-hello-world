package org.example.healthmonitoringservice.Services.interfaces;

import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;

import java.util.List;

public interface HealthStatusService {

    HealthStatusDTO getLatestStatusForSatellite(int satelliteId) ;
    List<HealthStatusDTO> getAllStatusesForSatellite(Integer satelliteId);

}
