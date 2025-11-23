import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import ServiceType from '@/lib/models/ServiceType';

// GET /api/mentorship/services/[id] - Get specific service type
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const service = await ServiceType.findById(params.id).lean();

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT /api/mentorship/services/[id] - Update service type (admin only)
export async function PUT(
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

    const isAdmin = (user as any).role === 'admin';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update service types' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const service = await ServiceType.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/mentorship/services/[id] - Delete service type (admin only)
export async function DELETE(
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

    const isAdmin = (user as any).role === 'admin';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can delete service types' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    const service = await ServiceType.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Service deactivated', service });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service' },
      { status: 500 }
    );
  }
}

