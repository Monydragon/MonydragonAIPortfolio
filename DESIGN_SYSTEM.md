# Design System Documentation

## Overview

This portfolio features a comprehensive design system with smooth animations, sound effects, and a modern, impressive UI that will "wow" visitors.

## Key Features

### 1. Animation System (Framer Motion)

**Page Animations:**
- Smooth fade-in and slide-up animations on page load
- Staggered animations for sequential elements
- Page transitions with opacity and position changes

**Component Animations:**
- **AnimatedCard**: Hover effects with scale, lift, and gradient borders
- **AnimatedButton**: Scale on hover/tap, gradient shifts, shine effects
- **AnimatedLink**: Underline animations, scale on hover
- **Header**: Slide-down on load, active tab indicator with layout animation

**Interactive Animations:**
- Hover: Scale, lift, color transitions
- Click/Tap: Scale down feedback
- Mobile menu: Smooth expand/collapse with staggered items

### 2. Sound Effects System

**Sound Types:**
- `click`: Short, crisp sound for button clicks
- `hover`: Subtle sound for hover interactions
- `navigation`: Sound for page navigation
- `success`: Ascending tones for success actions
- `error`: Descending tones for errors
- `pageTransition`: Sound for page changes

**Features:**
- Web Audio API for lightweight, programmatic sounds
- User preference storage (localStorage)
- Volume control
- Automatic audio context initialization

**Usage:**
```typescript
import { useSound } from '@/hooks/useSound';

const { play } = useSound('click');
play(); // Plays click sound
```

### 3. Living Resume System

**Features:**
- Auto-updates from site content (projects, experience)
- Downloadable resume generation
- Real-time last updated timestamp
- Structured data format for easy updates

**Resume Data Structure:**
- Personal information
- Experience (auto-updated from site)
- Projects (auto-synced from portfolio)
- Skills
- Education

**How It Works:**
1. Resume data stored in `lib/resume.ts`
2. Projects and experience automatically sync to resume
3. Download generates formatted text file
4. Last updated timestamp tracks changes

### 4. Enhanced Components

#### AnimatedButton
- Gradient backgrounds with hover shifts
- Shine effect on hover
- Scale animations
- Multiple variants (primary, secondary, ghost)

#### AnimatedCard
- Gradient border on hover
- Lift effect (y: -8px)
- Shimmer animation
- Staggered entrance animations

#### AnimatedLink
- Animated underline
- Scale on hover
- Sound integration

#### Header
- Sticky positioning with backdrop blur
- Active tab indicator with layout animation
- Mobile menu with smooth transitions
- Sound effects on interactions

### 5. Visual Design

**Color Palette:**
- Primary: Blue (#3b82f6) to Purple (#8b5cf6) gradients
- Accent: Pink (#ec4899)
- Background: White/Dark gray
- Text: Gray scale with good contrast

**Typography:**
- System font stack for performance
- Gradient text for headings
- Responsive font sizes

**Effects:**
- Gradient backgrounds
- Backdrop blur on header
- Custom scrollbar with gradient
- Smooth scrolling
- Custom selection colors

### 6. Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Features:**
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions
- Mobile menu with animations

## Component Library

### UI Components
- `AnimatedButton` - Interactive buttons with animations
- `AnimatedCard` - Cards with hover effects
- `AnimatedLink` - Links with underline animations
- `PageTransition` - Page transition wrapper

### Layout Components
- `Header` - Animated navigation header
- `Footer` - Footer with version info

### Resume Components
- `ResumeDownload` - Living resume download component

## Usage Examples

### Adding Animations to New Components

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  whileHover={{ scale: 1.05 }}
>
  Content
</motion.div>
```

### Using Sound Effects

```typescript
import { useSound } from '@/hooks/useSound';

function MyComponent() {
  const { play } = useSound('click');
  
  return (
    <button onClick={() => play()}>
      Click me
    </button>
  );
}
```

### Using Animated Components

```typescript
import { AnimatedCard } from '@/components/ui/AnimatedCard';

<AnimatedCard href="/page" delay={0.2}>
  <h2>Title</h2>
  <p>Content</p>
</AnimatedCard>
```

## Performance Considerations

- Animations use GPU acceleration (transform, opacity)
- Sound effects are lightweight (Web Audio API)
- Lazy loading for images
- Code splitting for optimal bundle size
- Smooth 60fps animations

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Reduced motion support (can be added)
- High contrast colors
- Focus indicators

## Future Enhancements

- [ ] Sound toggle in settings
- [ ] Dark/light mode toggle
- [ ] Reduced motion preference
- [ ] More animation presets
- [ ] Advanced resume formatting (PDF generation)
- [ ] Resume template customization

