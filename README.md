# Monydragon AI Portfolio

A modern, responsive portfolio website showcasing AI-first development workflows, architecture expertise, and interactive projects.

## Features

- **Responsive Design**: Mobile, tablet, and desktop friendly
- **Version Management**: Visible site version and last updated timestamp
- **Interactive Blog**: Coming soon - Admin-authored blog posts
- **Games Section**: Coming soon - Phaser, Unity, and Canvas games
- **Projects Showcase**: Portfolio of work and experiments
- **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (coming soon)
- **Authentication**: NextAuth.js (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+ (20.9.0+ recommended)
- npm or yarn
- MongoDB (for future features)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components
│   └── layout/            # Header, Footer, Navigation
├── lib/                   # Utilities and configurations
│   └── version.ts         # Version management
└── public/                # Static assets
```

## Version

Current Version: 1.0.0

## Deployment

For self-hosting on Apache, see deployment documentation (coming soon).

## License

Private project - All rights reserved
