# 🚀 Quick Start Guide - Deploy to Production

This guide will help you deploy your Rakla Football Manager app to production with Supabase.

## ⚡ Quick Steps

### 1. Configure Your Superuser (Local Development)

Edit `services/storage.ts` and replace the placeholder values:

```typescript
const DEFAULT_USERS: User[] = [
  { 
    id: '1', 
    email: 'your-actual-email@example.com',  // Your email
    password: 'your-secure-password',         // Your password
    username: 'YourUsername',                 // Your nickname
    firstName: 'Your',                        // Your first name
    lastName: 'Name',                         // Your last name
    dateOfBirth: '1990-01-01',               // Your birth date
    avatar: 'https://picsum.photos/seed/admin/200', 
    role: 'superuser' 
  }
];
```

### 2. Set Up Supabase

1. **Create Account**: Go to [supabase.com](https://supabase.com) and sign up
2. **New Project**: Click "New Project"
   - Name: `rakla-football-manager`
   - Database Password: Choose a strong password
   - Region: Select closest to you
3. **Wait**: Project creation takes ~2 minutes

### 3. Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Copy the entire content of `supabase-schema.sql`
3. Paste into SQL Editor
4. Click **Run**

### 4. Create Your Superuser in Supabase

**Option A: Using the Script (Recommended)**
```bash
node scripts/create-superuser.js
```
Follow the prompts, then copy the generated SQL into Supabase SQL Editor.

**Option B: Manual SQL**
```sql
INSERT INTO users (email, password, username, first_name, last_name, date_of_birth, role)
VALUES (
  'your-email@example.com',
  '$2b$10$YOUR_BCRYPT_HASHED_PASSWORD',  -- Use bcrypt to hash your password
  'YourUsername',
  'Your',
  'Name',
  '1990-01-01',
  'superuser'
);
```

### 5. Get Supabase Credentials

1. In Supabase, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 6. Configure Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 7. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and try logging in with your Superuser credentials.

### 8. Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click **Deploy**

3. **Wait**: Deployment takes ~2 minutes

### 9. Test Production

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Log in with your Superuser credentials
3. Create leagues, add users, enjoy! 🎉

---

## 📋 Checklist

- [ ] Configured Superuser in `storage.ts`
- [ ] Created Supabase project
- [ ] Ran `supabase-schema.sql`
- [ ] Created Superuser in Supabase
- [ ] Created `.env` file with credentials
- [ ] Tested locally
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Added environment variables to Vercel
- [ ] Tested production site

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check your `.env` file has correct Supabase URL and key
- Verify Supabase project is active

### "Login not working"
- Ensure Superuser was created in Supabase
- Check password was hashed with bcrypt
- Clear browser cache

### "Build fails on Vercel"
- Check all environment variables are set in Vercel
- Verify `npm run build` works locally

---

## 🎯 Next Steps

After deployment:
1. Log in as Superuser
2. Create your first league
3. Invite users to sign up
4. Upgrade user roles as needed (Settings → User Management)

Enjoy your production-ready football manager app! ⚽
