import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Offer from '@/lib/models/Offer';
import OfferClaim from '@/lib/models/OfferClaim';
import creditService from '@/lib/services/credit-service';

// POST /api/app-builder/offers/[id]/claim - Claim offer credits
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const offer = await Offer.findById(params.id);
    if (!offer || offer.status !== 'active') {
      return NextResponse.json(
        { error: 'Offer not found or not available' },
        { status: 404 }
      );
    }

    // Check if already claimed
    const existingClaim = await OfferClaim.findOne({
      userId: user._id,
      offerId: offer._id,
      status: 'claimed',
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'Offer already claimed' },
        { status: 400 }
      );
    }

    // Check max claims
    if (offer.maxClaims && offer.currentClaims >= offer.maxClaims) {
      return NextResponse.json(
        { error: 'Offer has reached maximum claims' },
        { status: 400 }
      );
    }

    // Create claim
    const claim = await OfferClaim.create({
      userId: user._id,
      offerId: offer._id,
      status: 'claimed',
      creditsAwarded: offer.creditsReward,
      claimedAt: new Date(),
    });

    // Award credits
    await creditService.addCredits({
      userId: user._id,
      amount: offer.creditsReward,
      type: 'earned',
      source: 'promotion',
      description: `Earned credits from: ${offer.title}`,
      metadata: { offerId: offer._id.toString(), offerType: offer.type },
    });

    // Update offer claim count
    offer.currentClaims = (offer.currentClaims || 0) + 1;
    await offer.save();

    return NextResponse.json({
      success: true,
      credits: offer.creditsReward,
      balance: await creditService.getBalance(user._id),
    });
  } catch (error: any) {
    console.error('Error claiming offer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to claim offer' },
      { status: 500 }
    );
  }
}

