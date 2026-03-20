# Lakshveer Rao - Personal Website

Production-grade minimalist website for Lakshveer Rao, an 8-year-old Hardware + AI Systems Builder and Co-Founder of Projects by Laksh.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + RLS)
- **Email:** Resend (for collaboration inquiries)
- **Hosting:** Vercel-compatible

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, momentum strip, selected systems, impact snapshot |
| `/systems` | Engineering index categorized by type |
| `/impact` | Grants, awards, panels, workshops, products, media |
| `/venture` | Projects by Laksh company information |
| `/collaborate` | Contact form for partnership inquiries |
| `/admin` | Protected dashboard for content management |

## Setup

### 1. Clone and Install

```bash
git clone <repo>
cd lakshveer-website
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor
3. Copy your project URL and anon key to `.env.local`

### 4. Resend Setup (Optional)

1. Create a Resend account
2. Add your API key to `.env.local`
3. Verify your domain for sending emails

### 5. Run Development Server

```bash
npm run dev
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The site is standard Next.js and can be deployed to any platform supporting Node.js.

## Design System

- **Background:** zinc-950 (#09090b)
- **Primary Text:** zinc-100 (#f4f4f5)
- **Secondary Text:** zinc-400 (#a1a1aa)
- **Accent:** Blueprint cyan (#06b6d4) for links only
- **Typography:** Geist Sans (headings), Geist Mono (dates/numbers)
- **Max Width:** 1100px
- **Animations:** Subtle opacity transitions only

### Link Conventions

- Internal links: `→` arrow
- External links: `↗` arrow
- No emoji anywhere

## Database Schema

See `supabase-schema.sql` for the complete schema including:

- `systems` - Engineering projects
- `impact` - Achievements and outcomes
- `supporters` - Partner/backer logos
- `collaboration_inquiries` - Contact form submissions

Row Level Security (RLS) is configured for:
- Public read access to featured items
- Public write access to collaboration inquiries
- Authenticated full CRUD access for admin

## Admin Dashboard

Access at `/admin`. Features:

- Demo mode for testing (any credentials work)
- CRUD for Systems, Impact, Supporters
- View and manage Collaboration Inquiries
- Ready for Supabase Auth integration

## Performance

Target metrics:
- Lighthouse score: 95+
- Static homepage
- ISR for dynamic sections
- Self-hosted fonts
- Minimal third-party scripts

## License

Private - All rights reserved.

---

Built for **Projects by Laksh** | Hyderabad, India
