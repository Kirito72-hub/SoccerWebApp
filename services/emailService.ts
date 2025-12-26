import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY || '');

// Get base URL for links
const getBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'https://rakla.vercel.app'; // Fallback for server-side
};

export const emailService = {
    /**
     * Send email verification link to new users
     */
    async sendVerificationEmail(email: string, token: string, username: string): Promise<void> {
        const verificationUrl = `${getBaseUrl()}/#/verify-email?token=${token}`;
        
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: 'Verify Your Email - Rakla Football Manager',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #ffffff; border-radius: 16px; overflow: hidden;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: white;">
                                🏆 Rakla
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                Football Manager
                            </p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 800; color: #ffffff;">
                                Welcome to Rakla! 🎉
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #9ca3af; font-size: 16px; line-height: 1.6;">
                                Hi <strong style="color: #a78bfa;">${username}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #9ca3af; font-size: 16px; line-height: 1.6;">
                                Thanks for signing up! Please verify your email address by clicking the button below:
                            </p>
                            
                            <!-- Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationUrl}" 
                                   style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; 
                                          text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;
                                          box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.4);">
                                    Verify Email Address
                                </a>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:<br/>
                                <a href="${verificationUrl}" style="color: #a78bfa; word-break: break-all;">
                                    ${verificationUrl}
                                </a>
                            </p>
                            
                            <div style="margin: 30px 0; padding: 16px; background: rgba(124, 58, 237, 0.1); border-left: 4px solid #7c3aed; border-radius: 8px;">
                                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                                    ⏰ This link expires in <strong style="color: #ffffff;">24 hours</strong>
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you didn't create an account, please ignore this email.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="padding: 30px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                                Rakla Football Manager
                            </p>
                            <p style="margin: 0; color: #4b5563; font-size: 12px;">
                                Your Ultimate Football League Manager
                            </p>
                        </div>
                    </div>
                `
            });
            
            console.log('✅ Verification email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw error;
        }
    },

    /**
     * Send password reset link to users
     */
    async sendPasswordResetEmail(email: string, token: string, username: string): Promise<void> {
        const resetUrl = `${getBaseUrl()}/#/reset-password?token=${token}`;
        
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: 'Reset Your Password - Rakla Football Manager',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #ffffff; border-radius: 16px; overflow: hidden;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: white;">
                                🔐 Rakla
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                Password Reset
                            </p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 800; color: #ffffff;">
                                Password Reset Request
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #9ca3af; font-size: 16px; line-height: 1.6;">
                                Hi <strong style="color: #a78bfa;">${username}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #9ca3af; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>
                            
                            <!-- Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" 
                                   style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; 
                                          text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;
                                          box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.4);">
                                    Reset Password
                                </a>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:<br/>
                                <a href="${resetUrl}" style="color: #a78bfa; word-break: break-all;">
                                    ${resetUrl}
                                </a>
                            </p>
                            
                            <div style="margin: 30px 0; padding: 16px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 8px;">
                                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                                    ⏰ This link expires in <strong style="color: #ffffff;">1 hour</strong>
                                </p>
                            </div>
                            
                            <div style="margin: 20px 0; padding: 16px; background: rgba(251, 191, 36, 0.1); border-left: 4px solid #fbbf24; border-radius: 8px;">
                                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                                    ⚠️ If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="padding: 30px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                                Rakla Football Manager
                            </p>
                            <p style="margin: 0; color: #4b5563; font-size: 12px;">
                                Your Ultimate Football League Manager
                            </p>
                        </div>
                    </div>
                `
            });
            
            console.log('✅ Password reset email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw error;
        }
    }
};
