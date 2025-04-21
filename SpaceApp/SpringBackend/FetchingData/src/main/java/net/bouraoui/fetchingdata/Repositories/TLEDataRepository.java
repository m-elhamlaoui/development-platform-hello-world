package net.bouraoui.fetchingdata.Repositories;

import net.bouraoui.fetchingdata.Entities.TLEData;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TLEDataRepository extends MongoRepository<TLEData, String> {
    Optional<TLEData> findBySatelliteName(String satelliteName);
}
