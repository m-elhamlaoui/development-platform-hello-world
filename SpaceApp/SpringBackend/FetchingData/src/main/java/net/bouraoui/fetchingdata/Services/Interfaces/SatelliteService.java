package net.bouraoui.fetchingdata.Services.Interfaces;

import net.bouraoui.fetchingdata.Entities.Satellite;

import java.util.List;

public interface SatelliteService {
    List<Satellite> getTop30SatellitesPrioritized();
}
