package org.example.healthmonitoringservice.Services;

import lombok.AllArgsConstructor;
import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Mappers.HealthStatusMapper;
import org.example.healthmonitoringservice.Repositories.HealthStatusRepository;
import org.example.healthmonitoringservice.Services.interfaces.HealthStatusService;
import org.springframework.stereotype.Service;

@Service @AllArgsConstructor
public class HealthStatusServiceImpl implements HealthStatusService {

    private final HealthStatusRepository healthStatusRepository;

    public HealthStatusDTO getLatestStatusForSatellite(int satelliteId) {
        return healthStatusRepository.findLatestBySatelliteNoradId(satelliteId)
                .map(HealthStatusMapper::toDTO)
                .orElse(null);
    }

}
