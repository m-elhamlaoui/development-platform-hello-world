package org.example.endoflifeservice.service;

import org.example.endoflifeservice.model.EolModel;
import org.example.endoflifeservice.model.HealthStatus;
import org.example.endoflifeservice.model.Satellite;
import org.example.endoflifeservice.repository.EolRepository;
import org.example.endoflifeservice.repository.HealthStatusRepository;
import org.example.endoflifeservice.repository.SatelliteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SatelliteDataServiceImpl implements SatelliteDataService {

    @Autowired
    private SatelliteRepository satelliteRepository;

    @Autowired
    private HealthStatusRepository healthStatusRepository;

    @Autowired
    private EolRepository eolRepository;

    @Override
    public List<Map<String, Object>> getAllSatellites() {
        List<HealthStatus> satellites = healthStatusRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (HealthStatus sat : satellites) {
            Map<String, Object> satellite = new HashMap<>();
            satellite.put("id", sat.getNoradId());
            satellite.put("name", sat.getSatelliteName());
            response.add(satellite);
        }

        return response;
    }

    @Override
    public Map<String, Object> getSatelliteDetails(int noradId) {
        Map<String, Object> details = new HashMap<>();

        // Get basic satellite information
        Satellite satellite = satelliteRepository.findByNorad(noradId)
                .orElseThrow(() -> new RuntimeException("Satellite not found"));

        details.put("basicInfo", createBasicInfo(satellite));

        // Get health status
        healthStatusRepository.findByNoradId(noradId)
                .ifPresent(health -> details.put("healthStatus", createHealthStatus((HealthStatus) health)));

        // Get EOL status
        eolRepository.findByNorad(noradId)
                .ifPresent(eol -> details.put("eolStatus", createEolStatus(eol)));

        return details;
    }

    @Override
    public List<Map<String, Object>> getAllSatellitesWithDetails() {
        List<Map<String, Object>> satellites = new ArrayList<>();

        satelliteRepository.findAll().forEach(satellite -> {
            Map<String, Object> details = new HashMap<>();
            details.put("basicInfo", createBasicInfo(satellite));

            healthStatusRepository.findByNoradId(satellite.getNorad())
                    .ifPresent(health -> details.put("healthStatus", createHealthStatus((HealthStatus) health)));

            eolRepository.findByNorad(satellite.getNorad())
                    .ifPresent(eol -> details.put("eolStatus", createEolStatus(eol)));

            satellites.add(details);
        });

        return satellites;
    }

    @Override
    public Map<String, Object> getSatelliteHealth(int noradId) {
        Optional<List<HealthStatus>> health = healthStatusRepository.findByNoradId(noradId);
        if (health.isPresent()) {
            HealthStatus   healthStatus = health.get().get(0);
            return createHealthStatus(healthStatus);
        }
        return null;

        //RED LBAAAAAAAAAAAAL
    }

    @Override
    public Map<String, Object> getSatelliteEolStatus(int noradId) {
        EolModel eol = eolRepository.findByNorad(noradId)
                .orElseThrow(() -> new RuntimeException("EOL status not found"));
        
        return createEolStatus(eol);
    }

    private Map<String, Object> createBasicInfo(Satellite satellite) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", satellite.getId());
        info.put("name", satellite.getName());
        info.put("noradId", satellite.getNorad());
        info.put("owner", satellite.getOwner());
        info.put("launchDate", satellite.getLaunchDate());
        info.put("launchSite", satellite.getLaunchSite());
        info.put("popular", satellite.getPopular());
        return info;
    }

    private Map<String, Object> createHealthStatus(HealthStatus health) {
        Map<String, Object> status = new HashMap<>();
        status.put("satelliteId", health.getNoradId());
        status.put("satelliteName", health.getSatelliteName());
        status.put("timeSinceLaunch", health.getTimeSinceLaunch());
        status.put("orbitalAltitude", health.getOrbitalAltitude());
        status.put("batteryVoltage", health.getBatteryVoltage());
        status.put("solarPanelTemperature", health.getSolarPanelTemperature());
        status.put("attitudeControlError", health.getAttitudeControlError());
        status.put("dataTransmissionRate", health.getDataTransmissionRate());
        status.put("thermalControlStatus", health.getThermalControlStatus());
        status.put("prediction", health.getPrediction());
        status.put("probability", health.getProbability());
        status.put("explanation", health.getExplanation());
        status.put("timestamp", health.getTimestamp());
        return status;
    }

    private Map<String, Object> createEolStatus(EolModel eol) {
        Map<String, Object> status = new HashMap<>();
        status.put("noradId", eol.getNorad());
        status.put("eccentricity", eol.getEccentricity());
        status.put("orbitalVelocity", eol.getOrbital_velocity_approx());
        status.put("raan", eol.getRaan());
        status.put("collisionWarning", eol.getCollision_warning());
        status.put("orbitalAltitude", eol.getOrbital_altitude());
        status.put("line1Epoch", eol.getLine1_epoch());
        status.put("motionLaunchInteraction", eol.getMotion_launch_interaction());
        status.put("meanMotion", eol.getMean_motion());
        status.put("prediction", eol.getPrediction());
        status.put("timestamp", eol.getTimestamp());
        return status;
    }
} 