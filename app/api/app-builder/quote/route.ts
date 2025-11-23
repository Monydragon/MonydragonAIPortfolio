import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// Pricing configuration
const PRICING = {
  perHour: {
    base: 50, // $50/hour base rate
    min: 20, // Minimum $20/hour
    max: 200, // Maximum $200/hour
  },
  perProject: {
    baseMultiplier: 1.5, // 1.5x hourly rate
    min: 100, // Minimum $100
  },
  credits: {
    tokensPerCredit: 100, // 100 tokens = 1 credit
    creditPrice: 0.05, // $0.05 per credit
  },
};

// POST /api/app-builder/quote - Calculate project quote
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      paymentType,
      estimatedHours,
      complexity,
      features,
      appType,
    } = body;

    if (!paymentType) {
      return NextResponse.json(
        { error: 'Payment type is required' },
        { status: 400 }
      );
    }

    let quote: any = {
      paymentType,
      breakdown: {},
      total: 0,
    };

    if (paymentType === 'per_hour') {
      // Calculate hourly rate based on complexity
      const complexityMultiplier: Record<string, number> = {
        simple: 0.8,
        medium: 1.0,
        complex: 1.5,
        enterprise: 2.0,
      };

      const baseRate = PRICING.perHour.base;
      const multiplier = complexityMultiplier[complexity] || 1.0;
      const hourlyRate = Math.max(
        PRICING.perHour.min,
        Math.min(PRICING.perHour.max, baseRate * multiplier)
      );

      const hours = estimatedHours || 10;
      const total = hourlyRate * hours;

      quote = {
        ...quote,
        hourlyRate,
        estimatedHours: hours,
        breakdown: {
          hourlyRate: `$${hourlyRate.toFixed(2)}/hour`,
          estimatedHours: `${hours} hours`,
        },
        total: total,
        totalFormatted: `$${total.toFixed(2)}`,
      };
    } else if (paymentType === 'per_project') {
      // Calculate project-based pricing
      const baseHours = estimatedHours || 20;
      const hourlyRate = PRICING.perHour.base;
      const projectMultiplier = PRICING.perProject.baseMultiplier;
      const complexityMultiplier: Record<string, number> = {
        simple: 0.8,
        medium: 1.0,
        complex: 1.5,
        enterprise: 2.0,
      };

      const multiplier = complexityMultiplier[complexity] || 1.0;
      const baseCost = hourlyRate * baseHours * projectMultiplier * multiplier;
      const total = Math.max(PRICING.perProject.min, baseCost);

      quote = {
        ...quote,
        estimatedHours: baseHours,
        complexity,
        breakdown: {
          baseCost: `$${baseCost.toFixed(2)}`,
          complexity: complexity,
        },
        total: total,
        totalFormatted: `$${total.toFixed(2)}`,
      };
    } else if (paymentType === 'subscription') {
      // Return subscription tiers
      quote = {
        ...quote,
        tiers: [
          {
            name: 'starter',
            price: 20,
            credits: 200,
            description: 'Perfect for small projects',
          },
          {
            name: 'professional',
            price: 100,
            credits: 2500,
            description: 'For growing businesses',
          },
          {
            name: 'enterprise',
            price: 500,
            credits: 15000,
            description: 'For large-scale applications',
          },
        ],
      };
    } else if (paymentType === 'credits') {
      // Estimate credits needed based on project complexity
      const baseTokens = 5000; // Base tokens for a simple app
      const complexityMultiplier: Record<string, number> = {
        simple: 1.0,
        medium: 2.0,
        complex: 4.0,
        enterprise: 8.0,
      };

      const multiplier = complexityMultiplier[complexity] || 1.0;
      const estimatedTokens = baseTokens * multiplier;
      const estimatedCredits = Math.ceil(estimatedTokens / PRICING.credits.tokensPerCredit);
      const total = estimatedCredits * PRICING.credits.creditPrice;

      quote = {
        ...quote,
        estimatedTokens,
        estimatedCredits,
        creditPrice: PRICING.credits.creditPrice,
        breakdown: {
          estimatedTokens: `${estimatedTokens.toLocaleString()} tokens`,
          estimatedCredits: `${estimatedCredits} credits`,
          pricePerCredit: `$${PRICING.credits.creditPrice.toFixed(2)}`,
        },
        total: total,
        totalFormatted: `$${total.toFixed(2)}`,
      };
    }

    return NextResponse.json({ quote });
  } catch (error: any) {
    console.error('Error calculating quote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate quote' },
      { status: 500 }
    );
  }
}

