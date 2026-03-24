import { NextRequest, NextResponse } from 'next/server';
import { getGameOrders } from '@/lib/services/order.service';

export async function GET(request: NextRequest) {
  try {
    const gameId = request.nextUrl.searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ error: 'Missing required query param: gameId' }, { status: 400 });
    }

    const orders = await getGameOrders(gameId);
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
