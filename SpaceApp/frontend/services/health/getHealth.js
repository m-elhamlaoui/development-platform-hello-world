import axios from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/health`;

export const getLatestHealthStatus = async (satelliteId) => {
  try {
    const response = await axios.get(`${BASE_URL}/getLatestHealthStatus/${satelliteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health status:', error);
    throw error;
  }
};
