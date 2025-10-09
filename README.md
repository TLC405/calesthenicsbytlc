# TLC Planner

Production-ready calisthenics training application with calendar-first planning, skill progressions, and intelligent workout tracking.

## 🎯 Features

- **Calendar-First Planning** - Intuitive monthly calendar with drag-to-schedule sessions
- **Exercise Library** - Comprehensive database with progressions and coaching cues
- **Skill Tree System** - Deterministic progression pathways from basics to advanced
- **Workout Builder** - Block-based sessions (warm-up, skill, strength, accessory, cool-down)
- **Role-Based Access** - User, Coach, and Admin roles with appropriate permissions
- **Multi-Factor Auth** - Email/password with optional 4-digit PIN second factor
- **Data Export** - Download your complete training history
- **Neumorphic Design** - Beautiful, modern UI with soft shadows and depth

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with Row Level Security
- **Auth**: Multi-factor authentication with OAuth support
- **Design**: Neumorphic CSS variables (no Tailwind classes)
- **Icons**: Lucide React

## 📁 Project Structure

```
/src
  /components     - Reusable UI components
    /Calendar     - Calendar views and interactions
    /Forms        - Form components and validation
    /Library      - Exercise library components
    /SkillTree    - Progression visualization
    /UI           - Base UI components (shadcn)
  /hooks          - Custom React hooks
  /pages          - Route pages
  /providers      - Context providers (Auth, Theme, Query)
  /services       - API and business logic
  /styles         - Design system and neumorphic CSS
/docs             - Comprehensive documentation
/supabase         - Database migrations and policies
```

## 🎨 Design System

TLC Planner uses a neumorphic design system with CSS variables:

### Color Palette
- Navy: `#0f1b2d` - Primary brand color
- Electric Blue: `#1178ff` - Accent and interactive elements
- Charcoal: `#1e1f24` - Text and secondary surfaces
- White: `#ffffff` - Light mode background

### Neumorphic Tokens
- `--neumorph-distance: 8px` - Shadow offset
- `--neumorph-blur: 16px` - Shadow blur radius
- Dual shadows (light/dark) for depth effect

## 🔒 Security

- Row Level Security (RLS) on all tables
- Server-side role validation via security definer functions
- PIN hashing with per-user salt
- No client-side role checks
- Secrets managed via Lovable Cloud

## 📚 Documentation

- [Quick Start Guide](docs/QUICKSTART.md) - Get up and running
- [Database Schema](docs/SCHEMA.md) - Complete data model
- [Deployment Guide](docs/DEPLOY.md) - Production deployment
- [Accessibility](docs/ACCESSIBILITY.md) - WCAG compliance

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Lovable account (for backend)

### Setup
```bash
# Clone repository
git clone <YOUR_GIT_URL>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment
Backend services are automatically configured via Lovable Cloud. No manual setup required.

## 🧪 Testing

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests for critical flows
- Accessibility audits with Lighthouse

Run tests:
```bash
npm test
```

## 📦 Deployment

Deploy via Lovable:
1. Click "Publish" in Lovable editor
2. App deploys to `yoursite.lovable.app`
3. Optional: Connect custom domain

See [DEPLOY.md](docs/DEPLOY.md) for details.

## 🎯 Roadmap

- [ ] Workout templates marketplace
- [ ] Social features and training partners
- [ ] Video exercise demonstrations
- [ ] AI-powered progression suggestions
- [ ] Mobile app (React Native)
- [ ] Coach certification program

## 🤝 Contributing

This is a production app. For feature requests or bug reports, contact support.

## 📄 License

Proprietary - All rights reserved to TLC

## 🙏 Credits

Built with [Lovable](https://lovable.dev) - The AI-powered full-stack platform

---

**TLC Planner** - Master calisthenics through intelligent progression
