import { NextResponse } from 'next/server';

// Mock data for now - replace with your actual data source
const mockSatellites = [
  {
    _id: "68125f824cdfb96f2c352962",
    name: "SL-1 R/B",
    norad_id: 1,
    Owner: "CIS",
    launchDate: "1957-10-04",
    launchSite: "TYMSC",
    popular: "no"
  },
  {
    _id: "68125f824cdfb96f2c352963",
    name: "ROBUSTA 1B",
    norad_id: 42792,
    Owner: "France",
    launchDate: "2017-06-23",
    launchSite: "KIMSC",
    popular: "no"
  }
];

export async function GET() {
  try {
    // Add artificial delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(mockSatellites, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });
  } catch (error) {
    console.error('Error fetching satellites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satellites' },
      { status: 500 }
    );
  }
} 