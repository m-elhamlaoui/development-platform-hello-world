import { NextResponse } from 'next/server';

// Mock data for now - this would typically come from your database
const satellites = [
  {
    id: "68125f9c4cdfb96f2c35d0ac",
    name: "NORSAT 1",
    norad_id: 42826,
    owner: "NOR",
    launchDate: "2017-07-14",
    launchSite: "TYMSC",
    popular: "yes",
    altitude: "400 km",
    orbitType: "Low Earth Orbit",
    status: "Active",
    type: "Earth Observation"
  },
  {
    id: "68125f9f4cdfb96f2c35e5f2",
    name: "NORSAT 3",
    norad_id: 48272,
    owner: "NOR",
    launchDate: "2021-04-29",
    launchSite: "FRGUI",
    popular: "yes",
    altitude: "400 km",
    orbitType: "Low Earth Orbit",
    status: "Active",
    type: "Earth Observation"
  }
];

export async function GET() {
  try {
    // Add artificial delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(satellites);
  } catch (error) {
    console.error('Error fetching satellites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satellites' },
      { status: 500 }
    );
  }
} 