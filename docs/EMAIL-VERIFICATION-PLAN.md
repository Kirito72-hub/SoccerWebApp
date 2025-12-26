# 🔐 Forgot Password + Email Verification Implementation Plan

**Feature:** Password Reset & Email Verification  
**Priority:** HIGH  
**Complexity:** MEDIUM  
**Estimated Time:** 6-8 hours

---

## 📋 Overview

Currently, Rakla uses **custom authentication** (bcrypt + localStorage/Supabase), NOT Supabase Auth. This means we need to implement email features ourselves.

### **Current Authentication:**
```typescript
// Custom auth in database.ts
async login(email: string, password: string) {
    // Fetch user from Supabase
    // Compare password with bcrypt
    // Return user object
}

async register(userData) {
    // Hash password with bcrypt
    // Insert into Supabase users table
    // Return user object
}
```

### **What We Need:**
1. Email sending service (Supabase can't send emails with custom auth)
2. Verification token system
3. Password reset token system
4. New database tables for tokens
5. UI components for reset/verification

---

## 🎯 Two Approaches

### **Option 1: Keep Custom Auth + Add Email Service** ⭐ RECOMMENDED
**Pros:**
- Keep existing auth system
- Full control over email templates
- No breaking changes
- Can use free email services

**Cons:**
- Need to set up email service
- More code to maintain

### **Option 2: Migrate to Supabase Auth**
**Pros:**
- Built-in email verification
- Built-in password reset
- Less code to maintain
- Supabase handles everything

**Cons:**
- MAJOR BREAKING CHANGE
- Need to migrate all users
- Lose custom features (roles, avatars)
- Requires database restructure

**Recommendation:** **Option 1** - Keep custom auth, add email features

---

## 🛠️ Implementation Plan (Option 1)

### **Phase 1: Email Service Setup**

#### **1.1 Choose Email Provider**

**Free Options:**
- **Resend** (3,000 emails/month free) ⭐ BEST
- **SendGrid** (100 emails/day free)
- **Mailgun** (5,000 emails/month trial)
- **Amazon SES** (62,000 emails/month free for 1 year)

**Recommendation:** **Resend** - Modern, simple API, generous free tier

#### **1.2 Set Up Resend**

1. Sign up at https://resend.com
2. Verify your domain (or use resend.dev for testing)
3. Get API key
4. Add to `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

### **Phase 2: Database Schema**

#### **2.1 Create Verification Tokens Table**

```sql
-- Create verification_tokens table
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- 'email_verification' or 'password_reset'
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP NULL
);

-- Add index for faster lookups
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);
```

#### **2.2 Add Email Verified Field to Users**

```sql
-- Add email_verified column to users table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;
```

---

### **Phase 3: Backend Implementation**

#### **3.1 Create Email Service**

**File:** `services/emailService.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
    async sendVerificationEmail(email: string, token: string, username: string) {
        const verificationUrl = `${window.location.origin}/#/verify-email?token=${token}`;
        
        await resend.emails.send({
            from: 'Rakla <noreply@yourdomain.com>',
            to: email,
            subject: 'Verify Your Email - Rakla Football Manager',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #7c3aed;">Welcome to Rakla! 🏆</h1>
                    <p>Hi ${username},</p>
                    <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 8px; margin: 20px 0;">
                        Verify Email
                    </a>
                    <p>Or copy this link: <br/>${verificationUrl}</p>
                    <p>This link expires in 24 hours.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        Rakla Football Manager<br/>
                        Your Ultimate Football League Manager
                    </p>
                </div>
            `
        });
    },

    async sendPasswordResetEmail(email: string, token: string, username: string) {
        const resetUrl = `${window.location.origin}/#/reset-password?token=${token}`;
        
        await resend.emails.send({
            from: 'Rakla <noreply@yourdomain.com>',
            to: email,
            subject: 'Reset Your Password - Rakla Football Manager',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #7c3aed;">Password Reset Request 🔐</h1>
                    <p>Hi ${username},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <a href="${resetUrl}" 
                       style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 8px; margin: 20px 0;">
                        Reset Password
                    </a>
                    <p>Or copy this link: <br/>${resetUrl}</p>
                    <p>This link expires in 1 hour.</p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        Rakla Football Manager<br/>
                        Your Ultimate Football League Manager
                    </p>
                </div>
            `
        });
    }
};
```

#### **3.2 Add Token Management to Database Service**

**File:** `services/database.ts` (add these methods)

```typescript
// Generate random token
function generateToken(): string {
    return crypto.randomUUID() + '-' + Date.now().toString(36);
}

// Add to db object:
async createVerificationToken(userId: string, type: 'email_verification' | 'password_reset'): Promise<string> {
    const token = generateToken();
    const expiresAt = new Date();
    
    // Email verification: 24 hours
    // Password reset: 1 hour
    if (type === 'email_verification') {
        expiresAt.setHours(expiresAt.getHours() + 24);
    } else {
        expiresAt.setHours(expiresAt.getHours() + 1);
    }
    
    const { error } = await supabase
        .from('verification_tokens')
        .insert({
            user_id: userId,
            token,
            type,
            expires_at: expiresAt.toISOString()
        });
    
    if (error) throw error;
    return token;
},

async verifyToken(token: string, type: 'email_verification' | 'password_reset'): Promise<string | null> {
    const { data, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', type)
        .is('used_at', null)
        .single();
    
    if (error || !data) return null;
    
    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
        return null;
    }
    
    // Mark as used
    await supabase
        .from('verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', data.id);
    
    return data.user_id;
},

async verifyEmail(userId: string): Promise<void> {
    const { error } = await supabase
        .from('users')
        .update({ 
            email_verified: true,
            email_verified_at: new Date().toISOString()
        })
        .eq('id', userId);
    
    if (error) throw error;
},

async requestPasswordReset(email: string): Promise<void> {
    // Get user by email
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    
    if (!user) {
        // Don't reveal if email exists
        return;
    }
    
    // Create reset token
    const token = await this.createVerificationToken(user.id, 'password_reset');
    
    // Send email
    await emailService.sendPasswordResetEmail(user.email, token, user.username);
},

async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Verify token
    const userId = await this.verifyToken(token, 'password_reset');
    if (!userId) return false;
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', userId);
    
    if (error) throw error;
    return true;
}
```

#### **3.3 Update Register Function**

```typescript
async register(userData: Omit<User, 'id' | 'role' | 'avatar'>): Promise<User> {
    // ... existing code to create user ...
    
    // Create verification token
    const token = await this.createVerificationToken(newUser.id, 'email_verification');
    
    // Send verification email
    await emailService.sendVerificationEmail(
        newUser.email, 
        token, 
        newUser.username
    );
    
    return newUser;
}
```

---

### **Phase 4: Frontend Implementation**

#### **4.1 Create Forgot Password Page**

**File:** `pages/ForgotPassword.tsx`

```typescript
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { db } from '../services/database';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await db.requestPasswordReset(email);
            setSent(true);
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
                <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-4">Check Your Email!</h2>
                    <p className="text-gray-400 mb-6">
                        If an account exists for {email}, you'll receive password reset instructions.
                    </p>
                    <Link 
                        to="/" 
                        className="text-purple-400 hover:text-purple-300 font-bold"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
            <div className="glass rounded-3xl p-8 max-w-md w-full">
                <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
                
                <h2 className="text-3xl font-black mb-2">Forgot Password?</h2>
                <p className="text-gray-400 mb-8">
                    Enter your email and we'll send you reset instructions.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 glass border border-white/10 rounded-xl focus:border-purple-500 outline-none"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
```

#### **4.2 Create Reset Password Page**

**File:** `pages/ResetPassword.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { db } from '../services/database';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await db.resetPassword(token!, password);
            if (result) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 3000);
            } else {
                setError('Invalid or expired reset link');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
                <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-4">Password Reset!</h2>
                    <p className="text-gray-400 mb-6">
                        Your password has been successfully reset. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
            <div className="glass rounded-3xl p-8 max-w-md w-full">
                <h2 className="text-3xl font-black mb-2">Reset Password</h2>
                <p className="text-gray-400 mb-8">
                    Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 glass border border-white/10 rounded-xl focus:border-purple-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 glass border border-white/10 rounded-xl focus:border-purple-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
```

#### **4.3 Create Email Verification Page**

**File:** `pages/VerifyEmail.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { db } from '../services/database';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                const userId = await db.verifyToken(token, 'email_verification');
                if (userId) {
                    await db.verifyEmail(userId);
                    setStatus('success');
                    setTimeout(() => navigate('/'), 3000);
                } else {
                    setStatus('error');
                }
            } catch (err) {
                setStatus('error');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
            <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <Loader className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-black mb-4">Verifying Email...</h2>
                        <p className="text-gray-400">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-4">Email Verified! 🎉</h2>
                        <p className="text-gray-400 mb-6">
                            Your email has been successfully verified. Redirecting to login...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-4">Verification Failed</h2>
                        <p className="text-gray-400 mb-6">
                            This verification link is invalid or has expired.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500"
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
```

#### **4.4 Update Auth.tsx**

Add "Forgot Password?" link:

```typescript
// In the login form, after password field:
<div className="flex justify-end">
    <Link 
        to="/forgot-password" 
        className="text-sm text-purple-400 hover:text-purple-300 font-bold"
    >
        Forgot Password?
    </Link>
</div>
```

#### **4.5 Update App.tsx Routes**

```typescript
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/verify-email" element={<VerifyEmail />} />
```

---

### **Phase 5: Dependencies**

#### **5.1 Install Resend**

```bash
npm install resend
```

#### **5.2 Update package.json**

```json
{
  "dependencies": {
    "resend": "^3.0.0"
  }
}
```

---

## 📝 SQL Scripts to Run

### **Script 1: Create verification_tokens table**
```sql
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP NULL
);

CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);
```

### **Script 2: Add email_verified to users**
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;
```

---

## ✅ Testing Checklist

### **Email Verification:**
- [ ] Sign up → Receive verification email
- [ ] Click link → Email verified
- [ ] Try expired link → Error message
- [ ] Try used link → Error message

### **Password Reset:**
- [ ] Request reset → Receive email
- [ ] Click link → Reset password page
- [ ] Enter new password → Success
- [ ] Try expired link → Error
- [ ] Try invalid email → No error (security)

---

## 🚀 Deployment Steps

1. **Set up Resend account**
2. **Add environment variables to Vercel**
3. **Run SQL scripts in Supabase**
4. **Deploy code**
5. **Test email delivery**
6. **Monitor email logs**

---

## 💰 Cost Estimate

**Free Tier (Resend):**
- 3,000 emails/month
- 100 emails/day
- Perfect for beta

**If you exceed:**
- $20/month for 50,000 emails
- Very affordable

---

## ⏱️ Time Estimate

- **Phase 1 (Email Setup):** 1 hour
- **Phase 2 (Database):** 30 minutes
- **Phase 3 (Backend):** 2 hours
- **Phase 4 (Frontend):** 3 hours
- **Phase 5 (Testing):** 1.5 hours

**Total:** 6-8 hours

---

## 🎯 Summary

**What You Need:**
1. ✅ Resend account (free)
2. ✅ 2 new database tables
3. ✅ Email service (100 lines)
4. ✅ Token management (150 lines)
5. ✅ 3 new pages (300 lines)
6. ✅ Update Auth page (10 lines)

**Result:**
- ✅ Professional email verification
- ✅ Secure password reset
- ✅ Beautiful email templates
- ✅ No breaking changes
- ✅ Free for beta usage

**Ready to implement?** 🚀
