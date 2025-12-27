// ============================================
// FEATURE FLAGS CONFIGURATION
// ============================================
// Central place to enable/disable features

/**
 * Email Verification Feature Flag
 * 
 * Set to TRUE when:
 * - You have a custom domain (e.g., rakla.app)
 * - Domain is verified in Resend
 * - RESEND_FROM_EMAIL uses your custom domain
 * 
 * Set to FALSE when:
 * - Using Vercel subdomain (rakla.vercel.app)
 * - Using Resend testing domain (onboarding@resend.dev)
 * - Testing/development phase
 * 
 * Current: FALSE (disabled)
 * Reason: Using rakla.vercel.app subdomain
 */
export const REQUIRE_EMAIL_VERIFICATION = false;

/**
 * How to Re-Enable Email Verification:
 * 
 * 1. Get a custom domain (e.g., rakla.app)
 * 2. Add domain to Vercel
 * 3. Verify domain in Resend (add DNS records)
 * 4. Update RESEND_FROM_EMAIL to noreply@yourdomain.com
 * 5. Change REQUIRE_EMAIL_VERIFICATION to true
 * 6. Redeploy
 * 
 * All email verification code is already in place!
 * - Email sending: ✅ Working
 * - Verification pages: ✅ Created
 * - Token system: ✅ Implemented
 * - Just needs domain verification to send to all users
 */

// ============================================
// OTHER FEATURE FLAGS (Add as needed)
// ============================================

/**
 * Enable notification permission modal after signup
 */
export const ENABLE_NOTIFICATION_MODAL = true;

/**
 * Enable service worker (PWA features)
 */
export const ENABLE_SERVICE_WORKER = true;

/**
 * Enable analytics (when implemented)
 */
export const ENABLE_ANALYTICS = false;
