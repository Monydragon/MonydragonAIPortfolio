import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import ServiceType from '../lib/models/ServiceType';
import connectDB from '../lib/mongodb';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const defaultServices = [
  {
    name: 'One-on-One Code Review (Mentored)',
    description: 'Get personalized code review with guidance and explanations. Perfect for beginners and intermediate developers who want to learn best practices.',
    category: 'code_review',
    level: 'mentored',
    creditCost: 50,
    durationMinutes: 60,
    suitableForLevels: ['beginner', 'intermediate', 'advanced'],
    requiresMentor: true,
    maxParticipants: 1,
    isActive: true,
  },
  {
    name: 'Professional Code Review',
    description: 'Comprehensive code review from experienced developers. Focus on architecture, performance, security, and best practices.',
    category: 'code_review',
    level: 'professional',
    creditCost: 100,
    durationMinutes: 90,
    suitableForLevels: ['intermediate', 'advanced', 'expert'],
    requiresMentor: true,
    maxParticipants: 1,
    isActive: true,
  },
  {
    name: 'Architecture Discussion',
    description: 'Discuss your project architecture, design patterns, and technical decisions with an experienced architect.',
    category: 'architecture',
    level: 'professional',
    creditCost: 150,
    durationMinutes: 90,
    suitableForLevels: ['intermediate', 'advanced', 'expert', 'all'],
    requiresMentor: true,
    maxParticipants: 1,
    isActive: true,
  },
  {
    name: 'Prompt Engineering Advice',
    description: 'Learn how to craft effective prompts for AI tools, optimize your AI interactions, and get the best results.',
    category: 'prompt_advice',
    level: 'mentored',
    creditCost: 40,
    durationMinutes: 45,
    suitableForLevels: ['beginner', 'intermediate', 'advanced', 'all'],
    requiresMentor: true,
    maxParticipants: 1,
    isActive: true,
  },
  {
    name: 'Tailored Project Consultation',
    description: 'Get personalized advice and guidance tailored to your specific project needs and goals.',
    category: 'tailored_service',
    level: 'professional',
    creditCost: 200,
    durationMinutes: 120,
    suitableForLevels: ['beginner', 'intermediate', 'advanced', 'expert', 'all'],
    requiresMentor: true,
    maxParticipants: 1,
    isActive: true,
  },
  {
    name: 'Beginner Programming Lesson',
    description: 'Learn programming fundamentals, best practices, and get started with your coding journey. Perfect for non-developers and beginners.',
    category: 'lesson',
    level: 'mentored',
    creditCost: 60,
    durationMinutes: 60,
    suitableForLevels: ['beginner'],
    requiresMentor: true,
    maxParticipants: 1,
    isActive: true,
  },
  {
    name: 'Intermediate Development Lesson',
    description: 'Level up your skills with intermediate concepts, design patterns, and advanced techniques.',
    category: 'lesson',
    level: 'professional',
    creditCost: 80,
    durationMinutes: 60,
    suitableForLevels: ['intermediate'],
    requiresMentor: true,
    maxParticipants: 1,
    isActive: true,
  },
  {
    name: 'Advanced Technical Consultation',
    description: 'Deep dive into advanced topics, system design, and complex technical challenges.',
    category: 'consultation',
    level: 'expert',
    creditCost: 250,
    durationMinutes: 120,
    suitableForLevels: ['advanced', 'expert'],
    requiresMentor: true,
    maxParticipants: 1,
    isActive: true,
  },
];

async function seedServiceTypes() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing service types (optional - comment out if you want to keep existing)
    // await ServiceType.deleteMany({});
    // console.log('Cleared existing service types');

    let created = 0;
    let updated = 0;

    for (const service of defaultServices) {
      const existing = await ServiceType.findOne({ name: service.name });
      
      if (existing) {
        await ServiceType.findByIdAndUpdate(existing._id, service);
        updated++;
        console.log(`Updated: ${service.name}`);
      } else {
        await ServiceType.create(service);
        created++;
        console.log(`Created: ${service.name}`);
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${created} services`);
    console.log(`   Updated: ${updated} services`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding service types:', error);
    process.exit(1);
  }
}

seedServiceTypes();

