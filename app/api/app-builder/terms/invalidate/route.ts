import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import TermsOfService, { TermsAcceptance } from '@/lib/models/TermsOfService';

// POST /api/app-builder/terms/invalidate - Admin: Invalidate all acceptances and create new version
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
    const { action, newContent, newVersion } = body;

    if (action === 'create_new_version') {
      // Deactivate all current terms
      await TermsOfService.updateMany(
        { isActive: true },
        { $set: { isActive: false } }
      );

      // Create new version
      if (!newContent || !newVersion) {
        return NextResponse.json(
          { error: 'newContent and newVersion are required' },
          { status: 400 }
        );
      }

      const newTerms = await TermsOfService.create({
        version: newVersion,
        content: newContent,
        effectiveDate: new Date(),
        isActive: true,
      });

      // All existing acceptances are now invalid (they're for old versions)
      // Users will need to accept the new version

      return NextResponse.json({
        message: 'New terms version created. All users must re-accept.',
        newVersion: newTerms.version,
      });
    } else if (action === 'invalidate_all') {
      // Deactivate all current terms (forces re-acceptance)
      await TermsOfService.updateMany(
        { isActive: true },
        { $set: { isActive: false } }
      );

      // Optionally delete all acceptances (or just let them be invalid due to version mismatch)
      // We'll keep them for audit purposes but they won't be valid

      return NextResponse.json({
        message: 'All terms invalidated. Users must accept new terms.',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "create_new_version" or "invalidate_all"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error invalidating terms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to invalidate terms' },
      { status: 500 }
    );
  }
}

// GET /api/app-builder/terms/invalidate - Get invalidation status and history
export async function GET(request: NextRequest) {
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

    const allTerms = await TermsOfService.find()
      .sort({ effectiveDate: -1 })
      .lean();

    const acceptanceCounts = await TermsAcceptance.aggregate([
      {
        $group: {
          _id: '$termsVersion',
          count: { $sum: 1 },
        },
      },
    ]);

    const acceptanceMap = new Map(
      acceptanceCounts.map((item) => [item._id, item.count])
    );

    const termsWithCounts = allTerms.map((term) => ({
      ...term,
      acceptanceCount: acceptanceMap.get(term.version) || 0,
    }));

    return NextResponse.json({ terms: termsWithCounts });
  } catch (error: any) {
    console.error('Error fetching terms history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch terms history' },
      { status: 500 }
    );
  }
}

