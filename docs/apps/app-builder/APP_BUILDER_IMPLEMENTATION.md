# App Builder Service - Implementation Summary

## Overview

The App Builder service is a comprehensive interactive application development platform that allows users to build apps using AI with professional developer oversight. The service includes multiple payment options, a credit system, subscription plans, and full LLM integration.

## Features Implemented

### 1. Database Models

- **AppBuilderProject** (`lib/models/AppBuilderProject.ts`)
  - Stores user projects with metadata, payment type, generated code, and status
  - Tracks credits and tokens used per project

- **CreditTransaction** (`lib/models/CreditTransaction.ts`)
  - Records all credit transactions (earned, purchased, used, refunded)
  - Links to projects, payments, and subscriptions

- **Subscription** (`lib/models/Subscription.ts`)
  - Manages subscription tiers (starter, professional, enterprise)
  - Tracks billing dates and payment processor integration

- **Payment** (`lib/models/Payment.ts`)
  - Records all payments (one-time, subscription, credits)
  - Supports multiple payment processors (PayPal, Stripe, etc.)

- **TermsOfService** (`lib/models/TermsOfService.ts`)
  - Stores terms of service versions
  - Tracks user acceptance of terms

- **User Model Updated** (`lib/models/User.ts`)
  - Added `creditBalance` field for cached credit balance
  - Added `lastCreditUpdate` timestamp

### 2. Credit System

**Service** (`lib/services/credit-service.ts`)
- Credit balance management
- Transaction history
- Token-to-credit conversion
- Free credits for new users
- Credit pricing packages

**Features:**
- Automatic balance calculation
- Transaction logging
- Support for multiple credit sources (free tier, subscription, purchase, etc.)

### 3. API Routes

#### App Builder Projects
- `GET /api/app-builder/projects` - List user's projects
- `POST /api/app-builder/projects` - Create new project
- `GET /api/app-builder/projects/[id]` - Get single project
- `PUT /api/app-builder/projects/[id]` - Update project
- `DELETE /api/app-builder/projects/[id]` - Delete project
- `POST /api/app-builder/generate` - Generate app code using LLM

#### Credits
- `GET /api/app-builder/credits` - Get balance and pricing
- `GET /api/app-builder/credits/transactions` - Transaction history
- `POST /api/app-builder/credits/purchase` - Initiate credit purchase
- `POST /api/app-builder/credits/free` - Claim free credits

#### Payments
- `GET /api/app-builder/payments` - Payment history
- `POST /api/app-builder/payments` - Create payment
- `GET /api/app-builder/payments/[id]` - Get single payment
- `POST /api/app-builder/payments/webhook` - Payment webhook handler

#### Subscriptions
- `GET /api/app-builder/subscriptions` - Get subscription and tiers
- `POST /api/app-builder/subscriptions` - Create/update subscription
- `POST /api/app-builder/subscriptions/[id]/cancel` - Cancel subscription

#### Quote Calculator
- `POST /api/app-builder/quote` - Calculate project quote

#### Terms of Service
- `GET /api/app-builder/terms` - Get current terms
- `POST /api/app-builder/terms/accept` - Accept terms
- `GET /api/app-builder/terms/check` - Check acceptance status

### 4. Frontend Components

#### QuoteCalculator (`components/app-builder/QuoteCalculator.tsx`)
- Interactive quote calculator
- Supports all payment types (per hour, per project, subscription, credits)
- Real-time quote calculation
- Complexity-based pricing

#### ModelSelector (`components/app-builder/ModelSelector.tsx`)
- LLM model selection interface
- Shows available models based on configured providers
- Supports local (Ollama) and cloud models (OpenAI, Anthropic, Google)
- Displays model descriptions and availability

#### CreditBalance (`components/app-builder/CreditBalance.tsx`)
- Display current credit balance
- Purchase credits interface
- Claim free credits button
- Credit package selection

#### Main App Builder Page (`app/sites/app-builder/page.tsx`)
- Project management interface
- Code generation with LLM
- Terms of service enforcement
- Integration of all components

#### Terms of Service Page (`app/app-builder/terms/page.tsx`)
- Terms display and acceptance
- Required before using App Builder

### 5. Payment Processing

**PayPal Integration Structure:**
- Payment creation endpoints
- Webhook handler for payment confirmation
- Credit allocation on successful payment
- Subscription management

**Note:** Full PayPal integration requires:
1. PayPal Developer Account
2. PayPal SDK installation (`@paypal/checkout-server-sdk`)
3. Webhook configuration in PayPal dashboard
4. Environment variables setup

### 6. Pricing Structure

#### Per Hour
- Base rate: $50/hour
- Range: $20-$200/hour based on complexity
- Simple: 0.8x multiplier
- Medium: 1.0x multiplier
- Complex: 1.5x multiplier
- Enterprise: 2.0x multiplier

#### Per Project
- Base: 1.5x hourly rate
- Minimum: $100
- Complexity-based pricing

#### Subscription Tiers
- **Starter**: $20/month - 200 credits
- **Professional**: $100/month - 2,500 credits
- **Enterprise**: $500/month - 15,000 credits

#### Credits
- Token-based pricing
- 1 credit ≈ 100 tokens (varies by model)
- $0.05 per credit
- Package deals with bonus credits

### 7. Terms of Service

Default terms include:
- Service description
- Pricing and payment terms
- Token-based pricing explanation
- Free tier information
- Professional development guarantee
- User responsibilities
- Intellectual property rights
- Limitation of liability
- Refund policy

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```bash
# Payment Processing
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # or 'live' for production
PAYMENT_WEBHOOK_URL=https://yourdomain.com/api/app-builder/payments/webhook

# App Builder
APP_BUILDER_FREE_CREDITS=100
```

### 2. Initialize Terms of Service

Create an initial terms document in the database:

```javascript
// Run in MongoDB or create an admin script
db.termsofservices.insertOne({
  version: "1.0",
  content: "...", // Full terms content
  effectiveDate: new Date(),
  isActive: true
});
```

### 3. PayPal Setup (Optional)

1. Create PayPal Developer account
2. Create app and get Client ID and Secret
3. Set up webhook URL in PayPal dashboard
4. Install PayPal SDK: `npm install @paypal/checkout-server-sdk`
5. Update payment routes with actual PayPal integration

### 4. Give Free Credits to New Users

The system automatically gives free credits when users claim them via the UI. You can also create a script to give credits to existing users.

## Usage Flow

1. **User Registration/Login** - Standard authentication
2. **Terms Acceptance** - User must accept terms before using App Builder
3. **Claim Free Credits** - New users can claim 100 free credits
4. **Create Project** - User creates a new app project
5. **Select Payment Type** - Choose per hour, per project, subscription, or credits
6. **Get Quote** - Use quote calculator to estimate costs
7. **Select Model** - Choose LLM model (local or cloud)
8. **Generate Code** - AI generates code based on user prompt
9. **Credits Deducted** - Credits are automatically deducted for token usage
10. **Purchase More Credits** - Users can purchase additional credits as needed

## Key Features

✅ Interactive quote calculator with real-time pricing
✅ Multiple payment options (per hour, per project, subscription, credits)
✅ Token-based credit system
✅ Free tier with free credits
✅ Model selection (local Ollama, OpenAI, Anthropic, Google)
✅ Professional developer oversight messaging
✅ Terms of service enforcement
✅ Payment processing structure (PayPal ready)
✅ Subscription management
✅ Credit transaction history
✅ Project management

## Next Steps

1. **Complete PayPal Integration**
   - Install PayPal SDK
   - Implement checkout flow
   - Set up webhook verification
   - Test payment processing

2. **Add Stripe Support** (Optional)
   - Install Stripe SDK
   - Create Stripe checkout routes
   - Set up Stripe webhooks

3. **Enhance Code Generation**
   - Add file structure generation
   - Support for multiple file types
   - Code review and refinement workflow

4. **Add Professional Review**
   - Admin interface for reviewing generated code
   - Professional notes and feedback system
   - Code refinement workflow

5. **Analytics and Reporting**
   - Usage statistics
   - Revenue tracking
   - User engagement metrics

## Notes

- All pricing is configurable in the code
- Token-to-credit conversion rates can be adjusted per model
- Free credits amount is configurable via environment variable
- Terms of service can be updated and versioned
- Payment processors can be added (currently structured for PayPal)

## Support

For questions or issues, refer to the main project documentation or contact the development team.

