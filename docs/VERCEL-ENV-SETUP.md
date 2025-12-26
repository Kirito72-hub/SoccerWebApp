# 🔐 Vercel Environment Variables Setup

## Required Environment Variables

To enable email verification and password reset features, you need to add the following environment variables to your Vercel project:

### 1. RESEND_API_KEY
**Value:** Your Resend API key (starts with `re_`)  
**Where to get it:** https://resend.com/api-keys  
**Required for:** Sending all emails (verification & password reset)

### 2. RESEND_FROM_EMAIL  
**Value:** `onboarding@resend.dev` (for testing) or your verified domain email  
**Required for:** Setting the "from" email address

---

## How to Add Environment Variables to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project (Rakla)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add each variable:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_your_actual_key_here`
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**
6. Repeat for `RESEND_FROM_EMAIL`:
   - **Key:** `RESEND_FROM_EMAIL`
   - **Value:** `onboarding@resend.dev`
   - **Environment:** Select all
   - Click **Save**

### Method 2: Vercel CLI

```bash
vercel env add RESEND_API_KEY
# Paste your API key when prompted

vercel env add RESEND_FROM_EMAIL
# Enter: onboarding@resend.dev
```

---

## After Adding Variables

### Redeploy Your App

Vercel needs to redeploy for environment variables to take effect:

**Option A: Automatic (Recommended)**
- Push any commit to main branch
- Vercel will automatically redeploy

**Option B: Manual**
1. Go to Vercel Dashboard → Deployments
2. Click the three dots (...) on latest deployment
3. Click **Redeploy**

---

## Testing

### Test Email Verification:
1. Sign up with a new account
2. Check your email inbox
3. You should receive: "Verify Your Email - Rakla Football Manager"
4. Click the verification link
5. Should redirect to login with success message

### Test Password Reset:
1. Go to login page
2. Click "Forgot Password?"
3. Enter your email
4. Check your email inbox
5. You should receive: "Reset Your Password - Rakla Football Manager"
6. Click the reset link
7. Enter new password
8. Should redirect to login

---

## Troubleshooting

### Emails not sending?

1. **Check Vercel logs:**
   - Dashboard → Deployments → Click deployment → Functions tab
   - Look for errors in `/api/send-verification-email` or `/api/send-reset-email`

2. **Verify environment variables:**
   - Settings → Environment Variables
   - Make sure both variables are set for Production

3. **Check Resend dashboard:**
   - https://resend.com/emails
   - See if emails are being sent
   - Check for errors

4. **Common issues:**
   - API key not set correctly (missing `re_` prefix)
   - Using wrong email (must use `onboarding@resend.dev` for testing)
   - Environment variables not redeployed

### Still not working?

Check browser console for errors:
```javascript
// Should see:
✅ Verification email sent to: user@example.com

// If you see error:
❌ Failed to send verification email: [error details]
```

---

## Production Setup (Optional)

For production, you should verify your own domain:

1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `rakla.app`)
3. Add DNS records as instructed
4. Wait for verification
5. Update `RESEND_FROM_EMAIL` to `noreply@rakla.app`

**Benefits:**
- Better deliverability
- Professional sender address
- Higher sending limits

---

## Current Status

✅ API routes created (`/api/send-verification-email`, `/api/send-reset-email`)  
✅ Email service updated to use API routes  
✅ Code deployed to Vercel  
⏳ **NEXT:** Add environment variables to Vercel  
⏳ **THEN:** Test email features  

---

## Quick Reference

**Resend Dashboard:** https://resend.com  
**Vercel Dashboard:** https://vercel.com/dashboard  
**Your App:** https://rakla.vercel.app  

**Free Tier Limits:**
- 3,000 emails/month
- 100 emails/day
- Perfect for beta testing!
