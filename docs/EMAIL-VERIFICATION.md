# 📧 Email Verification - Feature Documentation

## 🎯 Current Status: **DISABLED**

Email verification is currently **disabled** to allow the app to work on `rakla.vercel.app` subdomain without email service limitations.

---

## 🔧 How It Works

### Feature Flag Location:
**`config/features.ts`**

```typescript
export const REQUIRE_EMAIL_VERIFICATION = false; // Currently disabled
```

### When Disabled (Current):
- ✅ Users can signup and login immediately
- ✅ No email verification required
- ✅ Works on `rakla.vercel.app` subdomain
- ✅ All email code remains intact for future use

### When Enabled (Future):
- ✅ Users receive verification email after signup
- ✅ Must verify email before logging in
- ✅ Password reset via email
- ✅ Professional email sender address

---

## 📦 What's Already Built

All email verification features are **fully implemented** and ready to use:

### ✅ Email Sending:
- Resend integration (`services/emailService.ts`)
- Vercel API routes (`/api/send-verification-email`, `/api/send-reset-email`)
- Beautiful HTML email templates

### ✅ Database:
- `verification_tokens` table
- `email_verified` and `email_verified_at` columns in `users` table
- RLS policies configured

### ✅ Backend Logic:
- Token generation and verification (`services/database.ts`)
- Email verification flow
- Password reset flow
- Timezone-safe expiration checks

### ✅ Frontend Pages:
- `pages/VerifyEmail.tsx` - Email verification page
- `pages/ForgotPassword.tsx` - Request password reset
- `pages/ResetPassword.tsx` - Set new password
- Success/error states with beautiful UI

---

## 🚀 How to Enable Email Verification

### Prerequisites:
1. **Custom domain** (e.g., `rakla.app`, `rakla.com`)
2. **Resend account** (already have)
3. **DNS access** to your domain

### Step-by-Step:

#### 1. Get a Custom Domain
Buy a domain from:
- Namecheap (~$10/year)
- GoDaddy (~$12/year)
- Cloudflare (~$10/year)
- Vercel (in dashboard)

#### 2. Add Domain to Vercel
```bash
# In Vercel Dashboard:
Settings → Domains → Add Domain → Enter your domain
```

Follow Vercel's instructions to configure DNS.

#### 3. Verify Domain in Resend

**In Resend Dashboard:**
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `rakla.app`)
4. Copy the DNS records shown

**Add DNS Records:**
You'll need to add these TXT records to your domain's DNS:

```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ... (from Resend)

Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

**Verify:**
- Click "Verify" in Resend dashboard
- Wait 10-15 minutes for DNS propagation
- Should show ✅ Verified

#### 4. Update Environment Variables

**In Vercel:**
```bash
Settings → Environment Variables

# Update this:
RESEND_FROM_EMAIL = "Rakla <noreply@yourdomain.com>"

# Keep this:
RESEND_API_KEY = (your existing key)
```

#### 5. Enable Feature Flag

**Edit `config/features.ts`:**
```typescript
export const REQUIRE_EMAIL_VERIFICATION = true; // Changed from false
```

#### 6. Commit and Deploy
```bash
git add config/features.ts
git commit -m "feat: Enable email verification"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

#### 7. Test!
1. Sign up with a new account
2. Check email for verification link
3. Click link to verify
4. Login successfully!

---

## 🧪 Testing Email Features (Current Setup)

Even with verification disabled, you can still test the email features:

### Test Password Reset:
1. Go to https://rakla.vercel.app
2. Click "Forgot Password?"
3. Enter: `the_avenger72@hotmail.com` (your Resend account email)
4. Check inbox
5. Click reset link
6. Set new password

### Test Email Verification:
1. Manually verify an account in Supabase:
```sql
UPDATE users
SET email_verified = false
WHERE email = 'your@email.com';
```

2. Enable feature flag temporarily
3. Try to login
4. Should block you
5. Check email for verification link

---

## 📊 Email Service Limits

### Resend Free Tier:
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ❌ Testing domain: Can only send to your own email
- ✅ Verified domain: Can send to anyone

### Current Limits (rakla.vercel.app):
- Can send to: `the_avenger72@hotmail.com` only
- Can't send to: Other users

### After Domain Verification:
- Can send to: **Anyone** ✅
- No restrictions

---

## 🔒 Security Features

All security features are already implemented:

- ✅ **Token expiration:** 24h for verification, 1h for password reset
- ✅ **One-time use:** Tokens can't be reused
- ✅ **Secure generation:** Crypto-random UUIDs
- ✅ **RLS policies:** Database-level security
- ✅ **Timezone-safe:** Database-side expiration checks
- ✅ **Email enumeration protection:** Silent fail for non-existent emails
- ✅ **Password hashing:** bcrypt with salt

---

## 📁 File Structure

```
SoccerWebApp/
├── config/
│   └── features.ts              # Feature flags (TOGGLE HERE!)
├── services/
│   ├── emailService.ts          # Email sending logic
│   └── database.ts              # Token management
├── api/
│   ├── send-verification-email.js  # Vercel serverless function
│   └── send-reset-email.js         # Vercel serverless function
├── pages/
│   ├── VerifyEmail.tsx          # Email verification page
│   ├── ForgotPassword.tsx       # Request reset page
│   └── ResetPassword.tsx        # Set new password page
└── scripts/sql/
    ├── create-verification-tokens.sql  # Database setup
    └── verification-tokens-rls.sql     # RLS policies
```

---

## 🆘 Troubleshooting

### Emails not sending after enabling?

**Check:**
1. Domain verified in Resend? ✅
2. `RESEND_FROM_EMAIL` updated? ✅
3. Environment variables redeployed? ✅
4. DNS records propagated? (wait 15 min)

### Users can't login after enabling?

**Solution:**
Auto-verify existing users:
```sql
UPDATE users
SET 
    email_verified = true,
    email_verified_at = NOW()
WHERE email_verified = false;
```

### Want to test with specific emails?

**Add test recipients in Resend:**
1. https://resend.com/settings/emails
2. Add up to 5 test email addresses
3. Can send to those emails even without domain

---

## 💡 Best Practices

### Development:
- Keep `REQUIRE_EMAIL_VERIFICATION = false`
- Test email templates manually
- Use your own email for testing

### Staging:
- Enable verification
- Use test domain or test recipients
- Verify full flow works

### Production:
- Enable verification
- Use custom domain
- Monitor email delivery
- Set up email analytics

---

## 📈 Future Enhancements

Possible additions when you have a custom domain:

- [ ] Resend verification email button
- [ ] Email change verification
- [ ] Welcome email series
- [ ] Email preferences
- [ ] Email analytics dashboard
- [ ] Custom email templates per league
- [ ] Email notifications for matches

---

## ✅ Summary

**Current State:**
- Email verification: **DISABLED**
- Works on: `rakla.vercel.app`
- All code: **READY**
- Just needs: **Custom domain**

**To Enable:**
1. Get custom domain
2. Verify in Resend
3. Change one line: `REQUIRE_EMAIL_VERIFICATION = true`
4. Deploy

**That's it!** 🎉

---

**Questions?** Check the code comments or ask! 😊
