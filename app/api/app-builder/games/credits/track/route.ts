import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import GameCreditConfig from '@/lib/models/GameCreditConfig';
import GameCreditEarning from '@/lib/models/GameCreditEarning';

// POST /api/app-builder/games/credits/track - Track game progress (playtime, achievements, etc.)
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
    const { gameId, type, value, achievementId, milestone } = body;

    if (!gameId || !type) {
      return NextResponse.json(
        { error: 'Game ID and type are required' },
        { status: 400 }
      );
    }

    // Get game credit config
    const config = await GameCreditConfig.findOne({ gameId, enabled: true });
    if (!config) {
      return NextResponse.json(
        { error: 'Game not configured for credit earning' },
        { status: 404 }
      );
    }

    // Find matching earning rules
    const matchingRules = config.earningRules.filter((rule) => {
      if (rule.type !== type) return false;
      
      if (type === 'playtime' && rule.requirement.playtimeHours) {
        return value >= rule.requirement.playtimeHours;
      }
      if (type === 'achievement' && rule.requirement.achievementId) {
        return achievementId === rule.requirement.achievementId;
      }
      if (type === 'milestone' && rule.requirement.milestone) {
        return milestone === rule.requirement.milestone;
      }
      return false;
    });

    const results = [];

    for (const rule of matchingRules) {
      // Check if earning already exists
      const existingQuery: any = {
        userId: user._id,
        gameId: config.gameId,
        type: rule.type,
        'requirement.description': rule.requirement.description,
      };

      if (rule.maxClaims) {
        // Check claim count
        const claimCount = await GameCreditEarning.countDocuments({
          ...existingQuery,
          status: 'claimed',
        });
        if (claimCount >= rule.maxClaims) {
          continue; // Max claims reached
        }
      }

      let earning = await GameCreditEarning.findOne(existingQuery);

      if (!earning) {
        // Create new earning
        const target = rule.requirement.playtimeHours || 1;
        earning = await GameCreditEarning.create({
          gameId: config.gameId,
          gameTitle: config.gameTitle,
          userId: user._id,
          type: rule.type,
          status: 'pending',
          creditsAwarded: rule.credits,
          requirement: rule.requirement,
          progress: {
            current: value || 0,
            target,
            percentage: Math.min(100, ((value || 0) / target) * 100),
          },
        });
      } else if (earning.status === 'pending') {
        // Update progress
        const target = earning.progress.target;
        const current = Math.max(earning.progress.current, value || 0);
        const percentage = Math.min(100, (current / target) * 100);
        const isComplete = percentage >= 100;

        earning.progress = {
          current,
          target,
          percentage,
        };

        if (isComplete && earning.status === 'pending') {
          earning.status = 'completed';
          earning.completedAt = new Date();
        }

        await earning.save();
      }

      results.push({
        earningId: earning._id,
        status: earning.status,
        credits: earning.creditsAwarded,
        progress: earning.progress,
      });
    }

    return NextResponse.json({
      message: 'Progress tracked',
      results,
    });
  } catch (error: any) {
    console.error('Error tracking progress:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track progress' },
      { status: 500 }
    );
  }
}

