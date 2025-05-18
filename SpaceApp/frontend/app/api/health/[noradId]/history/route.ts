import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { noradId: string } }
) {
  try {
    const noradId = parseInt(params.noradId);
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const range = searchParams.get('range');

    // Mock data generation based on range
    const getDataPoints = (range: string) => {
      switch (range) {
        case '1h':
          return 60;
        case '24h':
          return 24;
        case '7d':
          return 168;
        case '30d':
          return 720;
        default:
          return 24;
      }
    };

    const points = getDataPoints(range || '24h');
    const mockData = {
      timestamps: Array.from({ length: points }, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - i);
        return date.toISOString();
      }).reverse(),
      values: Array.from({ length: points }, () => Math.random() * 100),
      availableRanges: {
        "1h": true,
        "24h": true,
        "7d": true,
        "30d": points >= 720
      }
    };

    return NextResponse.json(mockData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
} 