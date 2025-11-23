# Mentorship Platform Documentation

## Overview

The mentorship platform transforms your portfolio site into a comprehensive teaching and code review platform. Users can subscribe to tiers, earn credits, and use those credits to book various services including code reviews, architecture discussions, prompt advice, and lessons.

## Key Features

### 1. Customizable Subscription Tiers
- **Free Tier**: Perfect for beginners and non-developers
- **Starter Tier**: Small projects and learning
- **Professional Tier**: Growing businesses and serious developers
- **Enterprise Tier**: Large-scale applications

Each tier can be fully customized by admins with:
- Monthly price
- Credits per month
- Additional credit pricing
- Response times
- Feature lists

### 2. Service Types

The platform supports multiple service types, each with configurable credit costs:

- **Code Review (Mentored)**: Personalized code review with guidance (50 credits, 60 min)
- **Professional Code Review**: Comprehensive review from experts (100 credits, 90 min)
- **Architecture Discussion**: Discuss project architecture and design (150 credits, 90 min)
- **Prompt Engineering Advice**: Learn effective AI prompt crafting (40 credits, 45 min)
- **Tailored Project Consultation**: Personalized project advice (200 credits, 120 min)
- **Beginner Programming Lesson**: Perfect for non-developers (60 credits, 60 min)
- **Intermediate Development Lesson**: Level up your skills (80 credits, 60 min)
- **Advanced Technical Consultation**: Deep dive into complex topics (250 credits, 120 min)

### 3. Mentor System

Users can become mentors with:
- **Mentor Profiles**: Bio, specialties, experience levels, ratings
- **Availability Management**: Weekly schedules with time slots
- **Booking System**: Students can book sessions with mentors
- **Multi-mentor Support**: Platform supports multiple mentors (scalable)

### 4. Scheduling System

- **User Schedules**: Recurring weekly availability
- **Exception Handling**: One-off availability changes (holidays, vacations)
- **Time Zone Support**: Full timezone awareness
- **Buffer Times**: Configurable buffer between sessions
- **Booking Windows**: Minimum notice and maximum advance booking

### 5. Credit System

Credits are used for:
- Booking mentorship sessions
- Code reviews
- Architecture discussions
- Lessons and consultations

Credits are:
- Earned through subscriptions
- Purchased directly
- Tracked with full transaction history
- Refundable on cancellations

## Database Models

### Mentor (`lib/models/Mentor.ts`)
- Links to User account
- Status (active, inactive, pending_approval)
- Specialties and experience levels
- Ratings and session statistics
- Availability settings

### ServiceType (`lib/models/ServiceType.ts`)
- Configurable service definitions
- Credit costs per service
- Duration and participant limits
- Suitable experience levels
- Category and level classification

### UserSchedule (`lib/models/UserSchedule.ts`)
- Weekly recurring schedule
- Day-specific availability
- Time slot definitions
- Exception handling
- Timezone support

### Appointment (`lib/models/Appointment.ts`)
- Links student, mentor, and service type
- Scheduling information
- Status tracking (pending, confirmed, in_progress, completed, cancelled)
- Credit charging and refunds
- Ratings and feedback

## API Routes

### Mentors
- `GET /api/mentorship/mentors` - List all active mentors
- `POST /api/mentorship/mentors` - Create/update mentor profile
- `GET /api/mentorship/mentors/[id]` - Get specific mentor
- `PUT /api/mentorship/mentors/[id]` - Update mentor profile

### Services
- `GET /api/mentorship/services` - List all service types
- `POST /api/mentorship/services` - Create service type (admin)
- `GET /api/mentorship/services/[id]` - Get specific service
- `PUT /api/mentorship/services/[id]` - Update service (admin)
- `DELETE /api/mentorship/services/[id]` - Deactivate service (admin)

### Appointments
- `GET /api/mentorship/appointments` - Get user's appointments
- `POST /api/mentorship/appointments` - Book new appointment
- `GET /api/mentorship/appointments/[id]` - Get specific appointment
- `PUT /api/mentorship/appointments/[id]` - Update appointment

### Schedule
- `GET /api/mentorship/schedule` - Get user's schedule
- `POST /api/mentorship/schedule` - Update user's schedule

### Availability
- `GET /api/mentorship/availability` - Check mentor availability and get slots

## Setup Instructions

### 1. Seed Default Service Types

Run the seed script to create default service types:

```bash
npm run seed-services
```

### 2. Create a Mentor Profile

Users can create mentor profiles via the API or admin interface:

```typescript
POST /api/mentorship/mentors
{
  "bio": "Experienced full-stack developer...",
  "specialties": ["React", "Node.js", "Architecture"],
  "experienceLevels": ["beginner", "intermediate", "advanced"],
  "timezone": "America/New_York",
  "availableForBooking": true
}
```

### 3. Set Up User Schedule

Mentors need to set their availability:

```typescript
POST /api/mentorship/schedule
{
  "timezone": "America/New_York",
  "weeklySchedule": [
    {
      "day": "monday",
      "available": true,
      "slots": [
        { "start": "09:00", "end": "17:00" }
      ]
    },
    // ... other days
  ],
  "bufferTimeMinutes": 15,
  "minBookingNoticeHours": 24,
  "maxBookingAdvanceDays": 90
}
```

### 4. Book an Appointment

Students can book appointments:

```typescript
POST /api/mentorship/appointments
{
  "serviceTypeId": "...",
  "mentorId": "...",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "timezone": "America/New_York",
  "studentNotes": "I need help with..."
}
```

## Credit Costs

Default credit costs for services:
- Beginner lessons: 60 credits
- Prompt advice: 40 credits
- Mentored code review: 50 credits
- Professional code review: 100 credits
- Architecture discussion: 150 credits
- Tailored consultation: 200 credits
- Advanced consultation: 250 credits

## User Experience Levels

The platform supports all experience levels:
- **Beginner**: Non-developers and those just starting
- **Intermediate**: Some experience, looking to improve
- **Advanced**: Experienced developers seeking expert advice
- **Expert**: Senior developers and architects

## Scalability

The platform is designed to scale:
- Multiple mentors can be active simultaneously
- Each mentor has their own schedule and availability
- Service types are configurable and can be added/removed
- Credit system tracks all transactions
- Appointment system handles concurrent bookings

## Future Enhancements

Potential additions:
- Group sessions (multiple participants)
- Video call integration (Zoom, Google Meet)
- Automated scheduling suggestions
- Mentor matching algorithm
- Session recordings
- Progress tracking
- Certification programs

## Admin Features

Admins can:
- Create and configure service types
- Manage mentor profiles
- View all appointments
- Adjust credit costs
- Customize subscription tiers
- View analytics and reports

