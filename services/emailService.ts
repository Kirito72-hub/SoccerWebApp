// Email service that calls Vercel serverless API routes
// This prevents client-side Resend initialization issues

export const emailService = {
    /**
     * Send email verification link to new users
     */
    async sendVerificationEmail(email: string, token: string, username: string): Promise<void> {
        try {
            const response = await fetch('/api/send-verification-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token, username })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send verification email');
            }

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
        try {
            const response = await fetch('/api/send-reset-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token, username })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send password reset email');
            }

            console.log('✅ Password reset email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw error;
        }
    }
};
