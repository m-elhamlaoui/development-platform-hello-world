package org.example.endoflifeservice.service;

import org.example.endoflifeservice.model.EolModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class EolServiceImplTest {

    @InjectMocks
    private EolServiceImpl eolService;

    @Mock
    private SatelliteDataService satelliteDataService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getMetrics_ShouldReturnMetrics() {
        // Arrange
        int satelliteId = 1;
        when(satelliteDataService.getSatelliteData(satelliteId))
            .thenReturn(new EolModel()); // Add appropriate mock data

        // Act
        Map<String, Object> result = eolService.getMetrics(satelliteId);

        // Assert
        assertNotNull(result);
        verify(satelliteDataService, times(1)).getSatelliteData(satelliteId);
    }

    @Test
    void getForecast_ShouldReturnForecast() {
        // Arrange
        int satelliteId = 1;
        when(satelliteDataService.getSatelliteData(satelliteId))
            .thenReturn(new EolModel()); // Add appropriate mock data

        // Act
        Map<String, Object> result = eolService.getForecast(satelliteId);

        // Assert
        assertNotNull(result);
        verify(satelliteDataService, times(1)).getSatelliteData(satelliteId);
    }

    @Test
    void getAlerts_ShouldReturnAlerts() {
        // Arrange
        int satelliteId = 1;
        when(satelliteDataService.getSatelliteData(satelliteId))
            .thenReturn(new EolModel()); // Add appropriate mock data

        // Act
        List<Map<String, Object>> result = eolService.getAlerts(satelliteId);

        // Assert
        assertNotNull(result);
        verify(satelliteDataService, times(1)).getSatelliteData(satelliteId);
    }

    @Test
    void getTimeline_ShouldReturnTimeline() {
        // Arrange
        int satelliteId = 1;
        when(satelliteDataService.getSatelliteData(satelliteId))
            .thenReturn(new EolModel()); // Add appropriate mock data

        // Act
        Map<String, List<Map<String, Object>>> result = eolService.getTimeline(satelliteId);

        // Assert
        assertNotNull(result);
        verify(satelliteDataService, times(1)).getSatelliteData(satelliteId);
    }

    @Test
    void getDisposalOptions_ShouldReturnOptions() {
        // Arrange
        int satelliteId = 1;
        when(satelliteDataService.getSatelliteData(satelliteId))
            .thenReturn(new EolModel()); // Add appropriate mock data

        // Act
        List<Map<String, Object>> result = eolService.getDisposalOptions(satelliteId);

        // Assert
        assertNotNull(result);
        verify(satelliteDataService, times(1)).getSatelliteData(satelliteId);
    }
} 