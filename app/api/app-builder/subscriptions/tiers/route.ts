import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import AppBuilderSettings from '@/lib/models/AppBuilderSettings';

// GET /api/app-builder/subscriptions/tiers - Get all subscription tiers (admin can customize)
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

    const isAdmin = (user as any).role === 'admin';
    const settings = await AppBuilderSettings.findOne();

    let tiers: any;
    if (settings) {
      tiers = {
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
          configurable: isAdmin,
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
          configurable: isAdmin,
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
          configurable: isAdmin,
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
          configurable: isAdmin,
        },
      };
    } else {
      // Fallback to environment variables
      const freeCreditsPerMonth = parseInt(process.env.APP_BUILDER_FREE_CREDITS_PER_MONTH || '50');
      tiers = {
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
          configurable: isAdmin,
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
          configurable: isAdmin,
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
          configurable: isAdmin,
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
          configurable: isAdmin,
        },
      };
    }

    return NextResponse.json({ tiers });
  } catch (error: any) {
    console.error('Error fetching tiers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tiers' },
      { status: 500 }
    );
  }
}

