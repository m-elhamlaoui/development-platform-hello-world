package org.example.endoflifeservice.repository;

import org.example.endoflifeservice.model.EolModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EolRepository extends MongoRepository<EolModel, String> {
    @Query("{ 'Norad_id' : ?0 }")
    Optional<EolModel> findByNorad(int norad);

    @Query("{ 'prediction' : { $gt: ?0 } }")
    List<EolModel> findByPredictionGreaterThan(double threshold);

    @Query("{ 'collision_warning' : { $gt: 0 } }")
    List<EolModel> findSatellitesWithCollisionWarnings();

    @Query("{ 'orbital_altitude' : { $lt: ?0 } }")
    List<EolModel> findSatellitesBelowAltitude(double altitude);

    @Query(value = "{ 'timestamp' : { $gte: ?0, $lte: ?1 } }")
    List<EolModel> findByTimestampBetween(String startDate, String endDate);

    @Query(value = "{ 'norad' : ?0, 'prediction' : { $gt: ?1 } }")
    Optional<EolModel> findByNoradAndPredictionGreaterThan(int norad, double threshold);
}
