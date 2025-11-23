import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import GameCreditConfig from '@/lib/models/GameCreditConfig';
import Project from '@/lib/models/Project';

// GET /api/app-builder/games/credits/config - Get developer's game credit configs
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

    const configs = await GameCreditConfig.find({ developerId: user._id })
      .populate('gameId', 'title description')
      .lean();

    return NextResponse.json({ configs });
  } catch (error: any) {
    console.error('Error fetching configs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch configs' },
      { status: 500 }
    );
  }
}

// POST /api/app-builder/games/credits/config - Create or update game credit config
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
    const { gameId, enabled, earningRules } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Verify game exists and user has access
    const game = await Project.findById(gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if config exists
    let config = await GameCreditConfig.findOne({ gameId });

    if (config) {
      // Update existing
      if (enabled !== undefined) config.enabled = enabled;
      if (earningRules) config.earningRules = earningRules;
      await config.save();
    } else {
      // Create new
      config = await GameCreditConfig.create({
        gameId,
        gameTitle: game.title,
        enabled: enabled !== undefined ? enabled : true,
        developerId: user._id,
        earningRules: earningRules || [],
      });
    }

    return NextResponse.json({ config });
  } catch (error: any) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save config' },
      { status: 500 }
    );
  }
}

