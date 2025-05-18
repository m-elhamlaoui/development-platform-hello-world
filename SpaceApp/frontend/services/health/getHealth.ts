import axios from 'axios';
import axiosRetry from 'axios-retry';

// Configure axios with retry logic
const client = axios.create();
axiosRetry(client, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  }
});

export async function getLatestHealthStatus(noradId: number) {
  try {
    // TODO: Replace with your actual API endpoint
    const response = await client.get(`/api/health/${noradId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch health status:', error);
    // Return mock data for now
    return {
      noradId,
      satelliteName: "GRACE-FO 1",
      timestamp: new Date().toISOString(),
      prediction: 1,
      probability: 0.95,
      timeSinceLaunch: 1479,
      orbitalAltitude: 500,
      batteryVoltage: 28.5,
      solarPanelTemperature: 45.2,
      attitudeControlError: 0.03,
      dataTransmissionRate: 150.5,
      thermalControlStatus: 1
    };
  }
}

export async function getHistoricalHealthData(noradId: number, metricKey: string, timeRange: string) {
  try {
    // TODO: Replace with your actual API endpoint
    const response = await client.get(`/api/health/${noradId}/history`, {
      params: { metric: metricKey, range: timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    // Return mock data for now
    return {
      timestamps: Array.from({ length: 24 }, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - i);
        return date.toISOString();
      }).reverse(),
      values: Array.from({ length: 24 }, () => Math.random() * 100),
      availableRanges: {
        "1h": true,
        "24h": true,
        "7d": true,
        "30d": false
      }
    };
  }
} 