# Portfolio Catalogue Website

A modern, filterable portfolio website built with Next.js, TypeScript, and Supabase. Features a catalogue-style layout with side filters, media previews, and URL-persistent filter states.

## Features

- Single-page catalogue with side filters (top on mobile)
- List view (desktop/tablet) and grid view (mobile)
- Hover preview module with looping media
- Filter state persistence in URL
- Full-screen landing "screensaver"
- Responsive design across all devices
- Admin CMS for content management

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **Data & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Table & Virtualization**: TanStack Table + Virtual
- **Deployment**: Vercel
- **Media Optimization**: Next.js Image, Supabase Storage CDN

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components
├── lib/          # Library configurations
├── types/        # TypeScript types
├── hooks/        # Custom React hooks
├── utils/        # Utility functions
└── styles/       # Global styles
```

## Development Status

🚧 Currently in development 