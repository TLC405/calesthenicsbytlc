# TLC Planner - Deployment Guide

## Overview

TLC Planner is built on Lovable and uses Lovable Cloud for backend services. Deployment is streamlined through the Lovable platform.

## Prerequisites

- Lovable account
- GitHub account (optional, for version control)
- Custom domain (optional)

## Deployment Steps

### 1. Via Lovable Platform

The easiest way to deploy TLC Planner:

1. Open your project in Lovable
2. Click "Publish" in the top right
3. Your app will be deployed to `yoursite.lovable.app`
4. Share the URL with users

### 2. Connect Custom Domain (Optional)

To use your own domain:

1. Navigate to Project > Settings > Domains
2. Click "Connect Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

Note: Custom domains require a paid Lovable plan.

### 3. GitHub Integration (Optional)

For version control and CI/CD:

1. Click GitHub → Connect to GitHub
2. Authorize the Lovable GitHub App
3. Select organization/account
4. Click "Create Repository"
5. Your code syncs automatically

Changes pushed to GitHub will auto-deploy to Lovable.

## Environment Variables

Backend environment variables are managed automatically by Lovable Cloud:

- `VITE_SUPABASE_URL` - Database URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public API key
- `VITE_SUPABASE_PROJECT_ID` - Project identifier

These are injected automatically - no manual configuration needed.

## Backend Services

Lovable Cloud automatically provisions:

- PostgreSQL database with RLS
- Authentication service
- Edge functions runtime
- File storage buckets
- Secrets management

All backend services scale automatically with your app.

## Security Configuration

### Authentication

Auto-confirm email is enabled for development. For production:

1. Open backend settings
2. Navigate to Authentication
3. Disable "Auto Confirm Email"
4. Configure email templates
5. Set up OAuth providers (optional)

### Row Level Security

All tables have RLS enabled by default. Policies are defined in migrations.

### Secrets

Sensitive values are stored securely:

1. Never commit secrets to code
2. Use Lovable Cloud secrets management
3. Access via environment variables in edge functions

## Monitoring

View backend activity:

1. Open backend from Lovable
2. Check "Logs" for errors
3. Review "Analytics" for usage
4. Monitor "Database" for schema

## Performance

### Optimization Tips

- Images are lazy-loaded
- Routes are code-split
- Analytics deferred on load
- Queries use proper indexes

### Scaling

Lovable Cloud scales automatically:
- Database connections auto-managed
- Edge functions scale per request
- No manual intervention needed

## Rollback

To revert to a previous version:

1. Open version history in Lovable
2. Find the working version
3. Click "Revert"
4. Changes apply immediately

## Troubleshooting

### Build Failures

1. Check console for errors
2. Verify all imports are valid
3. Ensure TypeScript types are correct
4. Review recent changes

### Backend Issues

1. Check edge function logs
2. Verify RLS policies
3. Test queries in backend SQL editor
4. Review migration history

### Auth Problems

1. Confirm email is auto-confirmed (dev)
2. Check redirect URLs
3. Verify OAuth configuration
4. Review auth logs

## Support

For deployment issues:
- Lovable docs: https://docs.lovable.dev
- Community: Lovable Discord
- Support: support@lovable.dev

---

**TLC Planner** - Production-ready deployment on Lovable Cloud
