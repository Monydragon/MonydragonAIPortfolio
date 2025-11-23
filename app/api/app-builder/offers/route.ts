import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Offer from '@/lib/models/Offer';

// GET /api/app-builder/offers - Get available offers
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const offers = await Offer.find({
      status: 'active',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ offers });
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

