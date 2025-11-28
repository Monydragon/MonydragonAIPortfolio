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

### Quick Start

For a quick setup, see [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)

### Complete Setup

For comprehensive installation instructions covering:
- Fresh server installation
- Existing server updates
- All Docker containers (MongoDB, Poste.io, Ollama)
- Complete environment configuration
- Database setup and migrations
- Admin user management
- Production deployment

See [COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md) for full details.

## Ollama Model Setup

To add models to the Ollama Docker container:

```bash
# Start Ollama container
npm run docker:ollama:up

# Pull a model (e.g., llama3.2)
npm run docker:ollama:pull llama3.2

# List available models
npm run docker:ollama:list
```

See [OLLAMA_MODEL_SETUP.md](./OLLAMA_MODEL_SETUP.md) for detailed instructions.

### Prerequisites

- Node.js 20.9.0+ (LTS recommended)
- Docker 24.0+ and Docker Compose 2.20+
- Git
- PM2 (for production)

### Quick Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MonydragonAIPortfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

4. Start MongoDB:
```bash
npm run docker:up
```

5. Initialize database:
```bash
npm run seed-roles
npm run seed-services
npm run create-admin-custom
```

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
