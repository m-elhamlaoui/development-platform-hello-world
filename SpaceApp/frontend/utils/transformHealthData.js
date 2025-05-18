import { formatDistanceToNow } from 'date-fns';

const getStatus = (value, thresholds) => {
  if (value >= thresholds.critical[0] && value < thresholds.critical[1]) return 'critical';
  if (value >= thresholds.warning[0] && value < thresholds.warning[1]) return 'warning';
  if (value >= thresholds.normal[0] && value <= thresholds.normal[1]) return 'normal';
  return 'normal';
};

const generateMockHistory = (value, count = 7, variation = 0.02) => {
  return Array.from({ length: count }, () => {
    const noise = (Math.random() - 0.5) * 2 * variation * value;
    return parseFloat((value + noise).toFixed(2));
  });
};

const generateAlerts = (apiData) => {
  const alerts = [];
  if (apiData.solarPanelTemperature >= 48) {
    alerts.push({
      id: 'alert-solar-temp',
      timestamp: new Date().toISOString(),
      metric: 'solar_panel_temperature',
      severity: 'warning',
      message: `Solar panel temperature approaching threshold (${apiData.solarPanelTemperature}°C)`
    });
  }
  if (apiData.attitudeControlError >= 0.08) {
    alerts.push({
      id: 'alert-attitude-error',
      timestamp: new Date().toISOString(),
      metric: 'attitude_control_error',
      severity: 'warning',
      message: `Attitude control error increased to ${apiData.attitudeControlError}°`
    });
  }
  return alerts;
};

const formatTimeSinceLaunch = (days) => {
  const years = Math.floor(days / 365);
  const remainingDays = Math.round(days % 365);
  
  if (years === 0) {
    return `${remainingDays} days`;
  } else if (remainingDays === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'} ${remainingDays} days`;
  }
};

export const transformToFrontendFormat = (apiData) => {
  return {
    id: apiData.noradId,
    name: apiData.satelliteName,
    timestamp: apiData.timestamp,
    prediction: apiData.prediction,
    probability: apiData.probability,
    metrics: {
      time_since_launch: {
        value: formatTimeSinceLaunch(apiData.timeSinceLaunch),
        days: apiData.timeSinceLaunch,
        status: 'normal',
        history: generateMockHistory(apiData.timeSinceLaunch, 7, 0.001)
      },
      orbital_altitude: {
        value: apiData.orbitalAltitude,
        unit: 'km',
        status: 'normal',
        history: generateMockHistory(apiData.orbitalAltitude)
      },
      battery_voltage: {
        value: apiData.batteryVoltage,
        unit: 'V',
        status: getStatus(apiData.batteryVoltage, { normal: [26, 30], warning: [24, 26], critical: [0, 24] }),
        thresholds: { normal: [26, 30], warning: [24, 26], critical: [0, 24] },
        history: generateMockHistory(apiData.batteryVoltage)
      },
      solar_panel_temperature: {
        value: apiData.solarPanelTemperature,
        unit: '°C',
        status: getStatus(apiData.solarPanelTemperature, { normal: [0, 50], warning: [50, 70], critical: [70, 100] }),
        thresholds: { normal: [0, 50], warning: [50, 70], critical: [70, 100] },
        history: generateMockHistory(apiData.solarPanelTemperature)
      },
      attitude_control_error: {
        value: apiData.attitudeControlError,
        unit: '°',
        status: getStatus(apiData.attitudeControlError, { normal: [0, 0.05], warning: [0.05, 0.1], critical: [0.1, 1] }),
        thresholds: { normal: [0, 0.05], warning: [0.05, 0.1], critical: [0.1, 1] },
        history: generateMockHistory(apiData.attitudeControlError)
      },
      data_transmission_rate: {
        value: apiData.dataTransmissionRate,
        unit: 'Mbps',
        status: 'normal',
        trend: 'stable',
        history: generateMockHistory(apiData.dataTransmissionRate)
      },
      thermal_control_status: {
        value: apiData.thermalControlStatus === 1 ? 'NORMAL' : 'OVERHEATING',
        status: apiData.thermalControlStatus === 1 ? 'normal' : 'warning',
        history: Array(7).fill(apiData.thermalControlStatus === 1 ? 'NORMAL' : 'OVERHEATING')
      }
    },
    alerts: generateAlerts({
      solarPanelTemperature: apiData.solarPanelTemperature,
      attitudeControlError: apiData.attitudeControlError
    })
  };
};