import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import AppBuilderSettings from '@/lib/models/AppBuilderSettings';
import User from '@/lib/models/User';

// GET /api/app-builder/settings - Get app builder settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await AppBuilderSettings.findOne().lean();

    // If no settings exist, create from environment variables or defaults
    if (!settings) {
      const freeCredits = parseInt(process.env.APP_BUILDER_FREE_CREDITS || '100');
      const freeCreditsPerMonth = parseInt(process.env.APP_BUILDER_FREE_CREDITS_PER_MONTH || '50');
      const referralCredits = parseInt(process.env.APP_BUILDER_REFERRAL_CREDITS || '100');

      // Create default admin user reference (will be updated when admin saves)
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        return NextResponse.json(
          { error: 'No admin user found. Please create an admin user first.' },
          { status: 500 }
        );
      }

      settings = await AppBuilderSettings.create({
        enabled: true,
        freeTier: {
          credits: freeCredits,
          creditsPerMonth: freeCreditsPerMonth,
          responseTime: 'Up to 2 weeks',
          features: [
            `${freeCreditsPerMonth} credits per month`,
            'Non-commercial use only',
            'Community support',
            'Basic AI models',
            'Up to 2 weeks response time',
          ],
        },
        starterTier: {
          monthlyPrice: 20,
          creditsPerMonth: 200,
          responseTime: 'Standard response (up to 2 weeks)',
          additionalCreditPrice: 0.05,
          features: [
            '200 credits per month',
            'Commercial use allowed',
            'Email support',
            'All AI models',
            'Standard response time (up to 2 weeks)',
          ],
        },
        professionalTier: {
          monthlyPrice: 100,
          creditsPerMonth: 2500,
          responseTime: 'Priority (24 hours to 1 week)',
          additionalCreditPrice: 0.04,
          features: [
            '2,500 credits per month',
            'Priority support (24 hours to 1 week)',
            'Advanced AI models',
            'Code review included',
            'Priority queue access',
          ],
        },
        enterpriseTier: {
          monthlyPrice: 500,
          creditsPerMonth: 15000,
          responseTime: 'Priority (24 hours to 1 week)',
          additionalCreditPrice: 0.03,
          features: [
            '15,000 credits per month',
            'Dedicated support',
            'Custom AI models',
            'Full code review & refinement',
            'Highest priority queue',
          ],
        },
        referralCredits,
        kickoffMeetingEnabled: true,
        kickoffMeetingPrice: 50,
        updatedBy: adminUser._id,
      });

      settings = settings.toObject();
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST /api/app-builder/settings - Update app builder settings (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    let settings = await AppBuilderSettings.findOne();

    if (settings) {
      // Update existing
      Object.assign(settings, body);
      settings.updatedBy = user._id;
      await settings.save();
    } else {
      // Create new
      settings = await AppBuilderSettings.create({
        ...body,
        updatedBy: user._id,
      });
    }

    const settingsObj = settings.toObject();
    return NextResponse.json({ settings: settingsObj });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}

