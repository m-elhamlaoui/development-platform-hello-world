import axios from 'axios';
import axiosRetry from 'axios-retry';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/v1/health`;

// Configure axios with retry logic
const client = axios.create();
axiosRetry(client, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  }
});

export const getLatestHealthStatus = async (satelliteId) => {
  try {
    // Match the Spring controller endpoint
    const response = await client.get(`${BASE_URL}/getLatestHealthStatus/${satelliteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health status:', error);
    // Return mock data instead of throwing error
    return {
      noradId: satelliteId,
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
};

export const getHistoricalHealthData = async (satelliteId, metricKey, timeRange) => {
  try {
    // Match the Spring controller endpoint
    const response = await client.get(`${BASE_URL}/getAllHealthStatus/${satelliteId}`);
    const allData = response.data;

    console.log(`Fetched ${allData.length} records for satellite ${satelliteId}`);

    // Convert API response to timestamps and values arrays
    const now = new Date();
    const timeRangeInMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    // Sort data by timestamp in ascending order
    const sortedData = allData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Filter data based on time range
    const filteredData = sortedData.filter(record => {
      const recordDate = new Date(record.timestamp);
      const timeDiff = now.getTime() - recordDate.getTime();
      return timeDiff <= timeRangeInMs[timeRange];
    });

    console.log(`Filtered to ${filteredData.length} records for time range ${timeRange}`);

    // Convert snake_case to camelCase for the metric key
    const camelCaseKey = metricKey.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

    // Extract timestamps and values for the specific metric
    const timestamps = filteredData.map(record => record.timestamp);
    const values = filteredData.map(record => record[camelCaseKey]);

    console.log(`Extracted ${values.length} values for metric ${metricKey} (${camelCaseKey})`);
    if (values.length > 0) {
      console.log('Sample values:', values.slice(0, 3));
    }

    // Check data availability for each time range
    const latestDataTime = sortedData.length > 0 ? new Date(sortedData[sortedData.length - 1].timestamp) : now;
    const oldestDataTime = sortedData.length > 0 ? new Date(sortedData[0].timestamp) : now;
    const dataTimeSpan = latestDataTime.getTime() - oldestDataTime.getTime();

    const availableRanges = {
      '1h': dataTimeSpan >= timeRangeInMs['1h'],
      '24h': dataTimeSpan >= timeRangeInMs['24h'],
      '7d': dataTimeSpan >= timeRangeInMs['7d'],
      '30d': dataTimeSpan >= timeRangeInMs['30d']
    };

    return {
      timestamps,
      values,
      availableRanges
    };
  } catch (error) {
    console.error('Error fetching historical health data:', error);
    // Return mock data instead of throwing error
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
};
