package net.bouraoui.fetchingdata.Repositories;

import net.bouraoui.fetchingdata.Entities.Satellite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SatelliteRepository extends MongoRepository<Satellite, String> {

    @Query(value = "{}", sort = "{ popular : -1 }")
    List<Satellite> findTop30ByOrderByPopularDesc();

}
