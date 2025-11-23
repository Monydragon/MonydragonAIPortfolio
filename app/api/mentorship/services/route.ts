import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import ServiceType from '@/lib/models/ServiceType';

// GET /api/mentorship/services - Get all service types
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const experienceLevel = searchParams.get('experienceLevel');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const query: any = {};
    
    if (activeOnly) {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query.suitableForLevels = { $in: [experienceLevel, 'all'] };
    }

    const services = await ServiceType.find(query)
      .sort({ category: 1, creditCost: 1 })
      .lean();

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/mentorship/services - Create new service type (admin only)
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

    const isAdmin = (user as any).role === 'admin';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create service types' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const service = await ServiceType.create(body);

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}

