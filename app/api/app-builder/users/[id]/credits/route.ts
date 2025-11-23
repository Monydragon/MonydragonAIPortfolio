import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import creditService from '@/lib/services/credit-service';

// POST /api/app-builder/users/[id]/credits - Admin manage user credits
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
    const admin = await User.findOne({ email: session.user.email });
    if (!admin || (admin as any).role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, amount, description } = body;

    if (!action || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid action or amount' },
        { status: 400 }
      );
    }

    let transaction;
    const currentBalance = await creditService.getBalance(user._id);

    if (action === 'add') {
      transaction = await creditService.addCredits({
        userId: user._id,
        amount,
        type: 'earned',
        source: 'promotion',
        description: description || `Admin added ${amount} credits`,
        metadata: { adminId: admin._id.toString(), action: 'admin_add' },
      });
    } else if (action === 'set') {
      // Set balance to specific amount
      const difference = amount - currentBalance;
      if (difference > 0) {
        transaction = await creditService.addCredits({
          userId: user._id,
          amount: difference,
          type: 'earned',
          source: 'promotion',
          description: description || `Admin set balance to ${amount} credits`,
          metadata: { adminId: admin._id.toString(), action: 'admin_set', previousBalance: currentBalance },
        });
      } else if (difference < 0) {
        await creditService.useCredits(
          user._id,
          Math.abs(difference),
          description || `Admin adjusted balance to ${amount} credits`,
          undefined,
          { adminId: admin._id.toString(), action: 'admin_set', previousBalance: currentBalance }
        );
      }
    } else if (action === 'remove') {
      if (currentBalance < amount) {
        return NextResponse.json(
          { error: 'Insufficient credits to remove' },
          { status: 400 }
        );
      }
      await creditService.useCredits(
        user._id,
        amount,
        description || `Admin removed ${amount} credits`,
        undefined,
        { adminId: admin._id.toString(), action: 'admin_remove' }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use: add, set, or remove' },
        { status: 400 }
      );
    }

    const newBalance = await creditService.getBalance(user._id);

    return NextResponse.json({
      success: true,
      message: `Credits ${action}ed successfully`,
      previousBalance: currentBalance,
      newBalance,
      amount,
    });
  } catch (error: any) {
    console.error('Error managing credits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to manage credits' },
      { status: 500 }
    );
  }
}

