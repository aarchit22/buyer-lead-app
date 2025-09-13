# Deployment Guide - Buyer Lead App

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase account (for PostgreSQL database)

## 1. Database Setup (Supabase)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `buyer-lead-app`
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### Get Database URLs
1. Go to **Settings > Database**
2. Copy the **Connection string** under "Connection parameters"
3. Replace `[YOUR-PASSWORD]` with your actual password
4. You'll need both:
   - **DATABASE_URL**: The connection string (for Prisma migrations)
   - **DIRECT_URL**: Same connection string (for direct connections)

Example:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

## 2. GitHub Repository Setup

### Push Code to GitHub
```bash
# If not already a git repository
git init
git add .
git commit -m "Initial commit - Buyer Lead App"

# Create repository on GitHub (via web interface)
# Then connect local repo to remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/buyer-lead-app.git
git push -u origin main
```

## 3. Vercel Deployment

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Environment Variables
In Vercel dashboard, go to **Settings > Environment Variables** and add:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

### Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Vercel will provide your app URL

## 4. Database Migration

After deployment, run migrations:

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Run migration in production
vercel env pull .env.local
npx prisma migrate deploy
```

### Option B: Local Migration
```bash
# Set production DATABASE_URL in local .env
# Then run migration
npx prisma migrate deploy
```

## 5. Verification

### Test Your Deployment
1. Visit your Vercel app URL
2. Test login functionality
3. Create a test lead
4. Test CSV import/export
5. Verify search and filters work

### Monitor Logs
- Vercel Dashboard > Functions tab shows serverless function logs
- Supabase Dashboard > Logs shows database queries

## 6. Custom Domain (Optional)

### Add Custom Domain
1. In Vercel dashboard, go to **Settings > Domains**
2. Add your domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your custom domain

## 7. Production Considerations

### Performance
- Vercel handles caching automatically
- Consider adding Redis for rate limiting in production
- Database connection pooling handled by Supabase

### Security
- Environment variables are secure in Vercel
- Supabase handles database security
- Rate limiting prevents abuse

### Monitoring
- Vercel provides analytics
- Supabase provides database metrics
- Consider adding error tracking (Sentry)

## 8. Troubleshooting

### Common Issues

**Build Fails:**
- Check all environment variables are set
- Ensure DATABASE_URL is accessible from Vercel

**Database Connection Issues:**
- Verify DATABASE_URL format
- Check Supabase project is running
- Ensure migrations have been run

**Authentication Issues:**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

## Quick Deploy Checklist

- [ ] Create Supabase project and get DATABASE_URL
- [ ] Push code to GitHub repository
- [ ] Create Vercel project from GitHub repo
- [ ] Set environment variables in Vercel
- [ ] Deploy project
- [ ] Run database migrations
- [ ] Test all functionality
- [ ] (Optional) Add custom domain

Your buyer lead app should now be live and fully functional! 🚀
