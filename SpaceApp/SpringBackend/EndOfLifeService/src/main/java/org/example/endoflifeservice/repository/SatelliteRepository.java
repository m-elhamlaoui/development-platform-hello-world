package org.example.endoflifeservice.repository;

import org.example.endoflifeservice.model.Satellite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SatelliteRepository extends MongoRepository<Satellite, String> {
    @Query("{ 'norad_id' : ?0 }")
    Optional<Satellite> findByNorad(int norad);

    @Query("{ 'owner' : ?0 }")
    List<Satellite> findByOwner(String owner);

    @Query("{ 'launchDate' : { $gte: ?0, $lte: ?1 } }")
    List<Satellite> findByLaunchDateBetween(String startDate, String endDate);

    @Query("{ 'popular' : ?0 }")
    List<Satellite> findByPopular(String popular);

    @Query(value = "{ 'launchSite' : ?0 }")
    List<Satellite> findByLaunchSite(String launchSite);

    @Query(value = "{ 'owner' : ?0, 'popular' : ?1 }")
    List<Satellite> findByOwnerAndPopular(String owner, String popular);

    @Query(value = "{ 'name' : { $regex: ?0, $options: 'i' } }")
    List<Satellite> findByNameContainingIgnoreCase(String name);
} 