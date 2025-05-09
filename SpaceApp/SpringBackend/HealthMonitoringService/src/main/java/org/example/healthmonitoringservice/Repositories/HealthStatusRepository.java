package org.example.healthmonitoringservice.Repositories;

import org.example.healthmonitoringservice.Entities.HealthStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HealthStatusRepository extends MongoRepository<HealthStatus, String> {

}

