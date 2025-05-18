package org.example.healthmonitoringservice.Services;

import lombok.AllArgsConstructor;
import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Entities.HealthStatus;
import org.example.healthmonitoringservice.Mappers.HealthStatusMapper;
import org.example.healthmonitoringservice.Repositories.HealthStatusRepository;
import org.example.healthmonitoringservice.Services.interfaces.HealthStatusService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @AllArgsConstructor
public class HealthStatusServiceImpl implements HealthStatusService {

    private final HealthStatusRepository healthStatusRepository;

    public HealthStatusDTO getLatestStatusForSatellite(int satelliteId) {
        HealthStatus entity = healthStatusRepository.findFirstByNoradIdOrderByTimestampDesc(satelliteId);
        return entity != null ? HealthStatusMapper.toDTO(entity) : null;
    }

    @Override
    public List<HealthStatusDTO> getAllStatusesForSatellite(Integer satelliteId) {
        return healthStatusRepository.findAllByNoradIdOrderByTimestampDesc(satelliteId)
                .stream()
                .map(HealthStatusMapper::toDTO)
                .toList();
    }

}
