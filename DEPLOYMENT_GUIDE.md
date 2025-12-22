# 🚀 Deployment Guide - Rakla Football Manager

## Prerequisites
- Node.js installed
- Git installed
- Supabase account (free tier available)
- Vercel/Netlify account (for hosting)

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `rakla-football-manager`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### Step 2: Get API Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 3: Create Database Tables
1. Go to **SQL Editor** in Supabase
2. Run the SQL script from `supabase-schema.sql` (we'll create this)

---

## Part 2: Configure Environment Variables

### Step 1: Create `.env` file
Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 2: Add to `.gitignore`
Ensure `.env` is in your `.gitignore` file to keep credentials safe.

---

## Part 3: Deploy to Vercel

### Step 1: Prepare for Deployment
```bash
npm run build
```

### Step 2: Deploy to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

### Step 3: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Part 4: Initial Superuser Setup

After deployment, the first user to sign up will automatically be assigned as Superuser.

Alternatively, you can manually insert your Superuser via Supabase SQL Editor:

```sql
INSERT INTO users (email, password, username, first_name, last_name, date_of_birth, role)
VALUES (
  'your-email@example.com',
  'your-hashed-password', -- Use bcrypt to hash
  'YourUsername',
  'Your',
  'Name',
  '1990-01-01',
  'superuser'
);
```

---

## Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Environment variables configured
- [ ] Code updated to use Supabase
- [ ] Build tested locally (`npm run build`)
- [ ] Deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Initial Superuser created
- [ ] Test login on live site
- [ ] Custom domain configured (optional)

---

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors: `npm run build`

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Ensure RLS policies are configured correctly

### Authentication Not Working
- Clear browser cache and cookies
- Check Supabase Auth settings
- Verify environment variables in Vercel

---

## Support

For issues, check:
- Supabase Documentation: https://supabase.com/docs
- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev/guide/
