# Monydragon AI Portfolio

A modern, responsive portfolio website showcasing AI-first development workflows, architecture expertise, and interactive projects.

## Features

- **Responsive Design**: Mobile, tablet, and desktop friendly
- **Version Management**: Visible site version and last updated timestamp
- **Interactive Blog**: Admin-authored blog posts with AI-powered content generation
- **Projects Showcase**: Portfolio of work and experiments
- **Work Experience**: Timeline of professional experience
- **Admin Dashboard**: Professional CRM system for managing content
- **AI Integration**: Local LLM (Ollama) for blog content generation
- **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS, MongoDB

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5
- **AI**: Ollama (local LLM)
- **Markdown**: react-markdown with syntax highlighting

## Getting Started

### Prerequisites

- Node.js 18+ (20.9.0+ recommended)
- Docker Desktop (recommended for MongoDB) OR MongoDB installed locally
- Ollama (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MonydragonAIPortfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB with Docker (recommended):
```bash
npm run docker:up
```

4. Set up environment variables:
```bash
# Create .env.local file with:
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

5. Create admin user:
```bash
npm run create-admin
```

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed setup instructions.

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard and management
│   ├── api/               # API routes
│   ├── blog/              # Blog pages
│   └── ...                # Other pages
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── blog/             # Blog components
│   ├── layout/           # Header, Footer, Navigation
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── models/           # Mongoose models
│   ├── ai/               # AI/LLM services
│   └── ...               # Other utilities
└── scripts/              # Utility scripts
```

## Admin Features

The admin dashboard (`/admin`) provides:

- **Blog Management**: Create, edit, delete blog posts with AI assistance
- **Project Management**: Manage portfolio projects
- **Experience Management**: Update work experience entries
- **Site Content**: Edit about section and other site content
- **AI Integration**: Generate and improve content using local LLM

## AI Features

The blog system includes AI-powered features using Ollama:

- **Generate Posts**: Create blog posts from topics
- **Improve Content**: Enhance existing content
- **Auto Excerpt**: Generate post excerpts
- **Auto Tags**: Generate relevant tags

See SETUP.md for Ollama installation instructions.

## Version

Current Version: 1.0.0

## Deployment

For self-hosting on Apache, see deployment documentation (coming soon).

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [plan.plan.md](./plan.plan.md) - Project plan and roadmap

## License

Private project - All rights reserved
