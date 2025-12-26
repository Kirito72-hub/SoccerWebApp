import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
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
            console.error('Password reset error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
                <div className="glass rounded-3xl p-8 max-w-md w-full text-center border border-white/10">
                    <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-4">Check Your Email! 📧</h2>
                    <p className="text-gray-400 mb-6">
                        If an account exists for <span className="text-purple-400 font-bold">{email}</span>,
                        you'll receive password reset instructions shortly.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        The link will expire in 1 hour for security.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative glass rounded-3xl p-8 max-w-md w-full border border-white/10">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                <div className="mb-8">
                    <h2 className="text-3xl font-black mb-2">Forgot Password? 🔐</h2>
                    <p className="text-gray-400">
                        No worries! Enter your email and we'll send you reset instructions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 glass border border-white/10 rounded-xl focus:border-purple-500 outline-none transition-colors"
                                placeholder="your@email.com"
                                required
                                disabled={loading}
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
                        className="w-full py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        Remember your password?{' '}
                        <Link to="/" className="text-purple-400 hover:text-purple-300 font-bold">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
