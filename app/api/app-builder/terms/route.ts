import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import TermsOfService, { TermsAcceptance } from '@/lib/models/TermsOfService';
import User from '@/lib/models/User';

// GET /api/app-builder/terms - Get current terms of service
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const terms = await TermsOfService.findOne({ isActive: true })
      .sort({ effectiveDate: -1 })
      .lean();

    if (!terms) {
      // Return default terms if none exist
      return NextResponse.json({
        version: '1.0',
        content: getDefaultTerms(),
        effectiveDate: new Date().toISOString(),
      });
    }

    return NextResponse.json(terms);
  } catch (error: any) {
    console.error('Error fetching terms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch terms' },
      { status: 500 }
    );
  }
}

// POST /api/app-builder/terms/accept - Accept terms of service
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
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        { error: 'Terms version is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if already accepted
    const existing = await TermsAcceptance.findOne({
      userId: user._id,
      termsVersion: version,
    });

    if (existing) {
      return NextResponse.json({ message: 'Terms already accepted', accepted: true });
    }

    // Record acceptance
    await TermsAcceptance.create({
      userId: user._id,
      termsVersion: version,
      acceptedAt: new Date(),
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ message: 'Terms accepted', accepted: true });
  } catch (error: any) {
    console.error('Error accepting terms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept terms' },
      { status: 500 }
    );
  }
}


function getDefaultTerms(): string {
  return `# Terms of Service - App Builder Service

## 1. Service Description

This App Builder service provides AI-powered application development assistance with professional developer oversight. The service allows users to create applications using AI technology, with pricing based on token usage and development time.

## 2. Pricing and Payment

### Payment Options
- **Per Hour**: Hourly rates starting at $20/hour, up to $200/hour based on complexity
- **Per Project**: Fixed project pricing based on scope and complexity
- **Subscription**: Monthly subscription plans from $20/month to $500+/month
- **Credits**: Token-based credits for pay-as-you-go development

### Token-Based Pricing
All AI-generated outputs and final products are priced per token request. Token costs vary by model:
- Local models (Ollama): Lower cost per token
- Cloud models (GPT, Claude): Higher cost per token
- Users can choose their preferred model

### Free Tier
Users can start building apps for free with free credits. Free credits are provided as a welcome bonus and may be earned through promotions.

## 3. Professional Development

This service includes hands-on app development with AI assistance, supervised by a 20+ year professional developer. All code generated is reviewed and refined by experienced professionals.

## 4. User Responsibilities

- Users must provide accurate project requirements
- Users are responsible for testing and deploying generated applications
- Users must comply with all applicable laws and regulations
- Users must not use the service for illegal or harmful purposes

## 5. Intellectual Property

- Users retain ownership of their applications and code
- The service provider retains rights to the AI-generated code templates and patterns
- Users grant the service provider rights to use anonymized code for service improvement

## 6. Limitation of Liability

The service is provided "as is" without warranties. The service provider is not liable for:
- Application failures or bugs
- Data loss
- Third-party service issues
- Indirect or consequential damages

## 7. Refund Policy

**IMPORTANT: No Refunds for Credits or Tokens**
- Credits and tokens (whether earned or purchased) are non-refundable
- Once credits are earned or purchased, they cannot be refunded or exchanged for cash
- Project-based payments are non-refundable once development begins
- Subscription payments are non-refundable, but can be cancelled (cancellation takes effect at end of billing period)
- All credit and token transactions are final

## 8. Changes to Terms

These terms may be updated at any time. Users will be notified of significant changes and must accept new terms to continue using the service.

## 9. Contact

For questions or support, please contact the service provider through the contact page.

**Last Updated**: ${new Date().toLocaleDateString()}
**Version**: 1.0`;
}

