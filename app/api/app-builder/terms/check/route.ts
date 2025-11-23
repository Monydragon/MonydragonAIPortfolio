import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import TermsOfService, { TermsAcceptance } from '@/lib/models/TermsOfService';
import User from '@/lib/models/User';

// GET /api/app-builder/terms/check - Check if user has accepted current terms
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ accepted: false, version: null });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ accepted: false, version: null });
    }

    // Get the current active terms
    const terms = await TermsOfService.findOne({ isActive: true })
      .sort({ effectiveDate: -1 })
      .lean();

    if (!terms) {
      // If no terms exist, consider it accepted (no terms to accept)
      return NextResponse.json({ accepted: true, version: null });
    }

    // Check if user has accepted this specific version
    const acceptance = await TermsAcceptance.findOne({
      userId: user._id,
      termsVersion: terms.version,
    });

    return NextResponse.json({ 
      accepted: !!acceptance, 
      version: terms.version,
      currentVersion: terms.version,
    });
  } catch (error: any) {
    console.error('Error checking terms acceptance:', error);
    return NextResponse.json({ accepted: false, version: null });
  }
}

