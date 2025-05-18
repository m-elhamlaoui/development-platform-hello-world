package net.bouraoui.fetchingdata.Services;

import lombok.AllArgsConstructor;
import net.bouraoui.fetchingdata.Entities.Satellite;
import net.bouraoui.fetchingdata.Repositories.SatelliteRepository;
import net.bouraoui.fetchingdata.Services.Interfaces.SatelliteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SatelliteServiceImpl implements SatelliteService {
    @Autowired
    private SatelliteRepository satelliteRepository;

    @Override
    public List<Satellite> getTop30SatellitesPrioritized() {
        return satelliteRepository.findTop30ByOrderByPopularDesc();
    }
}
