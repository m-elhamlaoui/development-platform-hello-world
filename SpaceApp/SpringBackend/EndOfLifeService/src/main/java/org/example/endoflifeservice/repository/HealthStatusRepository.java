package org.example.endoflifeservice.repository;

import org.example.endoflifeservice.model.HealthStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthStatusRepository extends MongoRepository<HealthStatus, String> {
    //@Query("{ 'satelliteId' : ?0 }")
    //Optional<HealthStatus> findBySatelliteId(Integer satelliteId);

    Optional<List<HealthStatus>> findByNoradId(int satelliteId);

    @Query("{ 'satelliteId' : ?0 }")
    List<HealthStatus> findBySatelliteId1(int satelliteId);

    @Query("{ 'batteryVoltage' : { $lt: ?0 } }")
    List<HealthStatus> findSatellitesWithLowBattery(float threshold);

    @Query("{ 'solarPanelTemperature' : { $gt: ?0 } }")
    List<HealthStatus> findSatellitesWithHighTemperature(float threshold);

    @Query("{ 'attitudeControlError' : { $gt: ?0 } }")
    List<HealthStatus> findSatellitesWithHighAttitudeError(float threshold);

    @Query(value = "{ 'prediction' : { $gt: ?0 }, 'probability' : { $gt: ?1 } }")
    List<HealthStatus> findSatellitesWithHighRisk(float predictionThreshold, float probabilityThreshold);

    @Query(value = "{ 'timestamp' : { $gte: ?0, $lte: ?1 } }")
    List<HealthStatus> findByTimestampBetween(String startDate, String endDate);

    @Query(value = "{ 'satelliteId' : ?0, 'thermalControlStatus' : ?1 }")
    List<HealthStatus> findBySatelliteIdAndThermalStatus(Integer satelliteId, Integer thermalStatus);
} 