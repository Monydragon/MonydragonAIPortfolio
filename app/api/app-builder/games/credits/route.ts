import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import GameCreditConfig from '@/lib/models/GameCreditConfig';
import GameCreditEarning from '@/lib/models/GameCreditEarning';
import creditService from '@/lib/services/credit-service';

// GET /api/app-builder/games/credits - Get available games for earning credits
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all enabled game credit configs
    const games = await GameCreditConfig.find({ enabled: true })
      .populate('gameId', 'title description')
      .lean();

    // Get user's progress for each game
    const gamesWithProgress = await Promise.all(
      games.map(async (game) => {
        const earnings = await GameCreditEarning.find({
          userId: user._id,
          gameId: game.gameId,
          status: { $in: ['pending', 'completed'] },
        }).lean();

        return {
          ...game,
          userProgress: earnings,
          availableCredits: earnings
            .filter((e) => e.status === 'completed')
            .reduce((sum, e) => sum + e.creditsAwarded, 0),
        };
      })
    );

    return NextResponse.json({ games: gamesWithProgress });
  } catch (error: any) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// POST /api/app-builder/games/credits/claim - Claim earned credits
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { earningId } = body;

    if (!earningId) {
      return NextResponse.json(
        { error: 'Earning ID is required' },
        { status: 400 }
      );
    }

    const earning = await GameCreditEarning.findOne({
      _id: earningId,
      userId: user._id,
      status: 'completed',
    });

    if (!earning) {
      return NextResponse.json(
        { error: 'Earning not found or not ready to claim' },
        { status: 404 }
      );
    }

    // Check if already claimed
    if (earning.status === 'claimed') {
      return NextResponse.json(
        { error: 'Credits already claimed' },
        { status: 400 }
      );
    }

    // Add credits to user account
    await creditService.addCredits({
      userId: user._id,
      amount: earning.creditsAwarded,
      type: 'earned',
      source: 'app_development',
      description: `Earned credits from ${earning.gameTitle}: ${earning.requirement.description}`,
      metadata: {
        gameId: earning.gameId.toString(),
        earningType: earning.type,
      },
    });

    // Update earning status
    earning.status = 'claimed';
    earning.claimedAt = new Date();
    await earning.save();

    return NextResponse.json({
      message: 'Credits claimed successfully',
      credits: earning.creditsAwarded,
      balance: await creditService.getBalance(user._id),
    });
  } catch (error: any) {
    console.error('Error claiming credits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to claim credits' },
      { status: 500 }
    );
  }
}

