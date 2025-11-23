import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Subscription from '@/lib/models/Subscription';
import AppBuilderSettings from '@/lib/models/AppBuilderSettings';
import creditService from '@/lib/services/credit-service';

// Get subscription tiers from settings or defaults
const getSubscriptionTiers = async () => {
  await connectDB();
  const settings = await AppBuilderSettings.findOne();
  
  if (settings) {
    return {
      free: {
        monthlyPrice: 0,
        creditsPerMonth: settings.freeTier.creditsPerMonth,
        additionalCreditPrice: 0.05,
        responseTime: settings.freeTier.responseTime,
        description: 'Perfect for non-commercial projects and learning',
        features: settings.freeTier.features.length > 0 
          ? settings.freeTier.features 
          : [
              `${settings.freeTier.creditsPerMonth} credits per month`,
              'Non-commercial use only',
              'Community support',
              'Basic AI models',
              settings.freeTier.responseTime,
            ],
      },
      starter: {
        monthlyPrice: settings.starterTier.monthlyPrice,
        creditsPerMonth: settings.starterTier.creditsPerMonth,
        additionalCreditPrice: settings.starterTier.additionalCreditPrice,
        responseTime: settings.starterTier.responseTime,
        description: 'Perfect for small projects',
        features: settings.starterTier.features.length > 0
          ? settings.starterTier.features
          : [
              `${settings.starterTier.creditsPerMonth} credits per month`,
              'Commercial use allowed',
              'Email support',
              'All AI models',
              settings.starterTier.responseTime,
            ],
      },
      professional: {
        monthlyPrice: settings.professionalTier.monthlyPrice,
        creditsPerMonth: settings.professionalTier.creditsPerMonth,
        additionalCreditPrice: settings.professionalTier.additionalCreditPrice,
        responseTime: settings.professionalTier.responseTime,
        description: 'For growing businesses',
        features: settings.professionalTier.features.length > 0
          ? settings.professionalTier.features
          : [
              `${settings.professionalTier.creditsPerMonth} credits per month`,
              'Priority support',
              'Advanced AI models',
              'Code review included',
              settings.professionalTier.responseTime,
            ],
      },
      enterprise: {
        monthlyPrice: settings.enterpriseTier.monthlyPrice,
        creditsPerMonth: settings.enterpriseTier.creditsPerMonth,
        additionalCreditPrice: settings.enterpriseTier.additionalCreditPrice,
        responseTime: settings.enterpriseTier.responseTime,
        description: 'For large-scale applications',
        features: settings.enterpriseTier.features.length > 0
          ? settings.enterpriseTier.features
          : [
              `${settings.enterpriseTier.creditsPerMonth} credits per month`,
              'Dedicated support',
              'Custom AI models',
              'Full code review & refinement',
              settings.enterpriseTier.responseTime,
            ],
      },
    };
  }
  
  // Fallback to environment variables
  const freeCreditsPerMonth = parseInt(process.env.APP_BUILDER_FREE_CREDITS_PER_MONTH || '50');
  
  return {
    free: {
      monthlyPrice: 0,
      creditsPerMonth: freeCreditsPerMonth,
      additionalCreditPrice: 0.05,
      responseTime: 'Up to 2 weeks',
      description: 'Perfect for non-commercial projects and learning',
      features: [
        `${freeCreditsPerMonth} credits per month`,
        'Non-commercial use only',
        'Community support',
        'Basic AI models',
        'Up to 2 weeks response time',
      ],
    },
    starter: {
      monthlyPrice: 20,
      creditsPerMonth: 200,
      additionalCreditPrice: 0.05,
      responseTime: 'Standard response (up to 2 weeks)',
      description: 'Perfect for small projects',
      features: [
        '200 credits per month',
        'Commercial use allowed',
        'Email support',
        'All AI models',
        'Standard response time (up to 2 weeks)',
      ],
    },
    professional: {
      monthlyPrice: 100,
      creditsPerMonth: 2500,
      additionalCreditPrice: 0.04,
      responseTime: 'Priority (24 hours to 1 week)',
      description: 'For growing businesses',
      features: [
        '2,500 credits per month',
        'Priority support (24 hours to 1 week)',
        'Advanced AI models',
        'Code review included',
        'Priority queue access',
      ],
    },
    enterprise: {
      monthlyPrice: 500,
      creditsPerMonth: 15000,
      additionalCreditPrice: 0.03,
      responseTime: 'Priority (24 hours to 1 week)',
      description: 'For large-scale applications',
      features: [
        '15,000 credits per month',
        'Dedicated support',
        'Custom AI models',
        'Full code review & refinement',
        'Highest priority queue',
      ],
    },
  };
};

// GET /api/app-builder/subscriptions - Get user's subscription and available tiers
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

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: 'active',
    });

    const tiers = await getSubscriptionTiers();

    return NextResponse.json({
      subscription,
      tiers,
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST /api/app-builder/subscriptions - Create or update subscription
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
    const { tier, paymentProcessor = 'paypal', userId: targetUserId } = body;
    
    // Allow admins to create subscriptions for other users
    const targetUser = targetUserId 
      ? await User.findById(targetUserId)
      : user;
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }
    
    // Check if admin is creating for another user
    const isAdmin = (user as any).role === 'admin';
    if (targetUserId && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create subscriptions for other users' },
        { status: 403 }
      );
    }

    const tiers = getSubscriptionTiers();
    if (!tier || !tiers[tier as keyof typeof tiers]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const tierConfig = tiers[tier as keyof typeof tiers];
    
    // Free tier doesn't require payment
    if (tier === 'free' && tierConfig.monthlyPrice === 0) {
      // Just create subscription without payment
      await Subscription.updateMany(
        { userId: user._id, status: 'active' },
        { status: 'cancelled', cancelledAt: new Date() }
      );

      const subscription = await Subscription.create({
        userId: user._id,
        tier: 'free' as any,
        status: 'active',
        monthlyPrice: 0,
        creditsPerMonth: tierConfig.creditsPerMonth,
        additionalCreditPrice: tierConfig.additionalCreditPrice,
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentProcessor: 'none',
      });

      // Give initial credits
      await creditService.addCredits({
        userId: user._id,
        amount: tierConfig.creditsPerMonth,
        type: 'earned',
        source: 'subscription',
        description: `Free tier subscription: ${tierConfig.creditsPerMonth} credits`,
        subscriptionId: subscription._id,
      });

      return NextResponse.json({
        subscription,
        message: 'Free subscription activated',
      });
    }

    // Cancel existing subscription if any
    await Subscription.updateMany(
      { userId: targetUser._id, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date() }
    );

    // Create new subscription
    const subscription = await Subscription.create({
      userId: targetUser._id,
      tier: tier as any,
      status: 'pending',
      monthlyPrice: tierConfig.monthlyPrice,
      creditsPerMonth: tierConfig.creditsPerMonth,
      additionalCreditPrice: tierConfig.additionalCreditPrice,
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentProcessor,
    });

      // Give initial credits
      await creditService.addCredits({
        userId: targetUser._id,
        amount: tierConfig.creditsPerMonth,
        type: 'earned',
        source: 'subscription',
        description: `Subscription credits: ${tier} tier`,
        subscriptionId: subscription._id,
      });

    return NextResponse.json({
      subscription,
      message: 'Subscription created. Complete payment to activate.',
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

