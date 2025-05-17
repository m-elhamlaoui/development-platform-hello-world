package org.example.healthmonitoringservice.Repositories;

import org.example.healthmonitoringservice.Entities.HealthStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface HealthStatusRepository extends MongoRepository<HealthStatus, String> {
    @Query(value = "{ 'norad_id': ?0 }", sort = "{ 'timestamp': -1 }")
    Optional<HealthStatus> findLatestBySatelliteNoradId(Integer satelliteId);

    HealthStatus findFirstByNoradIdOrderByTimestampDesc(Integer satelliteId);
}

