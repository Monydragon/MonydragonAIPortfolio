import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import CreditTransaction, { ICreditTransaction } from '@/lib/models/CreditTransaction';
import ServiceType from '@/lib/models/ServiceType';
import mongoose from 'mongoose';

export interface CreditOptions {
  userId: string | mongoose.Types.ObjectId;
  amount: number;
  type: 'earned' | 'purchased' | 'used' | 'refunded' | 'bonus';
  source: 'free_tier' | 'subscription' | 'purchase' | 'referral' | 'promotion' | 'app_development' | 'refund' | 'mentorship' | 'service';
  description: string;
  projectId?: string | mongoose.Types.ObjectId;
  paymentId?: string | mongoose.Types.ObjectId;
  subscriptionId?: string | mongoose.Types.ObjectId;
  appointmentId?: string | mongoose.Types.ObjectId;
  serviceTypeId?: string | mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
}

class CreditService {
  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string | mongoose.Types.ObjectId): Promise<number> {
    await connectDB();
    const user = await User.findById(userId).select('creditBalance');
    return user?.creditBalance || 0;
  }

  /**
   * Calculate actual balance from transactions (for verification)
   */
  async calculateBalance(userId: string | mongoose.Types.ObjectId): Promise<number> {
    await connectDB();
    const transactions = await CreditTransaction.find({ userId }).sort({ createdAt: 1 });
    return transactions.reduce((balance, tx) => balance + tx.amount, 0);
  }

  /**
   * Add credits to user account
   */
  async addCredits(options: CreditOptions): Promise<ICreditTransaction> {
    await connectDB();
    
    const userId = typeof options.userId === 'string' 
      ? new mongoose.Types.ObjectId(options.userId) 
      : options.userId;

    // Get current balance
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentBalance = user.creditBalance || 0;
    const newBalance = currentBalance + options.amount;

    // Create transaction
    const transaction = await CreditTransaction.create({
      userId,
      type: options.type,
      amount: options.amount,
      balanceAfter: newBalance,
      source: options.source,
      description: options.description,
      projectId: options.projectId ? (typeof options.projectId === 'string' ? new mongoose.Types.ObjectId(options.projectId) : options.projectId) : undefined,
      paymentId: options.paymentId ? (typeof options.paymentId === 'string' ? new mongoose.Types.ObjectId(options.paymentId) : options.paymentId) : undefined,
      subscriptionId: options.subscriptionId ? (typeof options.subscriptionId === 'string' ? new mongoose.Types.ObjectId(options.subscriptionId) : options.subscriptionId) : undefined,
      metadata: {
        ...options.metadata,
        appointmentId: options.appointmentId ? (typeof options.appointmentId === 'string' ? options.appointmentId : options.appointmentId.toString()) : undefined,
        serviceTypeId: options.serviceTypeId ? (typeof options.serviceTypeId === 'string' ? options.serviceTypeId : options.serviceTypeId.toString()) : undefined,
      },
    });

    // Update user balance
    user.creditBalance = newBalance;
    user.lastCreditUpdate = new Date();
    await user.save();

    return transaction;
  }

  /**
   * Use credits from user account
   */
  async useCredits(
    userId: string | mongoose.Types.ObjectId,
    amount: number,
    description: string,
    projectId?: string | mongoose.Types.ObjectId,
    metadata?: Record<string, any>
  ): Promise<ICreditTransaction> {
    await connectDB();
    
    const userIdObj = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    const user = await User.findById(userIdObj);
    if (!user) {
      throw new Error('User not found');
    }

    const currentBalance = user.creditBalance || 0;
    
    if (currentBalance < amount) {
      throw new Error('Insufficient credits');
    }

    const newBalance = currentBalance - amount;

    // Create transaction
    const transaction = await CreditTransaction.create({
      userId: userIdObj,
      type: 'used',
      amount: -amount, // Negative for usage
      balanceAfter: newBalance,
      source: 'app_development',
      description,
      projectId: projectId ? (typeof projectId === 'string' ? new mongoose.Types.ObjectId(projectId) : projectId) : undefined,
      metadata,
    });

    // Update user balance
    user.creditBalance = newBalance;
    user.lastCreditUpdate = new Date();
    await user.save();

    return transaction;
  }

  /**
   * Get user's credit transaction history
   */
  async getTransactionHistory(
    userId: string | mongoose.Types.ObjectId,
    limit: number = 50,
    skip: number = 0
  ): Promise<ICreditTransaction[]> {
    await connectDB();
    
    const userIdObj = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    return await CreditTransaction.find({ userId: userIdObj })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('projectId', 'title')
      .lean();
  }

  /**
   * Give free tier credits (for new users or promotions)
   */
  async giveFreeCredits(
    userId: string | mongoose.Types.ObjectId,
    amount: number = 100, // Default free credits
    description: string = 'Welcome bonus - Free credits to get started'
  ): Promise<ICreditTransaction> {
    return this.addCredits({
      userId,
      amount,
      type: 'earned',
      source: 'free_tier',
      description,
    });
  }

  /**
   * Convert tokens to credits (for pricing)
   */
  tokensToCredits(tokens: number, modelProvider?: string): number {
    // Base conversion: 1 token = 0.01 credits (adjustable)
    // Different models may have different rates
    const baseRate = 0.01;
    const providerMultiplier: Record<string, number> = {
      'ollama': 0.005, // Local models are cheaper
      'local': 0.005,
      'openai': 0.01,
      'anthropic': 0.015, // Claude is more expensive
      'google': 0.008,
    };

    const multiplier = modelProvider ? (providerMultiplier[modelProvider] || baseRate) : baseRate;
    return Math.ceil(tokens * multiplier);
  }

  /**
   * Get credit pricing for purchasing credits
   */
  getCreditPricing(): Array<{ credits: number; price: number; bonus?: number }> {
    return [
      { credits: 100, price: 5.00 },
      { credits: 500, price: 20.00, bonus: 50 }, // 550 total
      { credits: 1000, price: 35.00, bonus: 150 }, // 1150 total
      { credits: 2500, price: 75.00, bonus: 500 }, // 3000 total
      { credits: 5000, price: 125.00, bonus: 1500 }, // 6500 total
    ];
  }

  /**
   * Get credit cost for a service type
   */
  async getServiceCreditCost(serviceTypeId: string | mongoose.Types.ObjectId): Promise<number> {
    await connectDB();
    const serviceType = await ServiceType.findById(serviceTypeId);
    if (!serviceType) {
      throw new Error('Service type not found');
    }
    return serviceType.creditCost;
  }

  /**
   * Use credits for a service/appointment
   */
  async useCreditsForService(
    userId: string | mongoose.Types.ObjectId,
    serviceTypeId: string | mongoose.Types.ObjectId,
    appointmentId?: string | mongoose.Types.ObjectId,
    description?: string
  ): Promise<ICreditTransaction> {
    await connectDB();
    
    const serviceType = await ServiceType.findById(serviceTypeId);
    if (!serviceType) {
      throw new Error('Service type not found');
    }

    const customDescription = description || `Service: ${serviceType.name}`;
    
    return this.useCredits(
      userId,
      serviceType.creditCost,
      customDescription,
      undefined,
      {
        serviceTypeId: serviceTypeId.toString(),
        appointmentId: appointmentId?.toString(),
        serviceName: serviceType.name,
        serviceCategory: serviceType.category,
      }
    );
  }
}

export const creditService = new CreditService();
export default creditService;

