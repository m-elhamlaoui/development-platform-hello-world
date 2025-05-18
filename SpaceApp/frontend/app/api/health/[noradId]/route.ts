import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { noradId: string } }
) {
  try {
    const noradId = parseInt(params.noradId);
    
    // Mock data for now - replace with your actual data source
    const mockData = {
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

    return NextResponse.json(mockData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health data' },
      { status: 500 }
    );
  }
} 