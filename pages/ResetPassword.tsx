import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader } from 'lucide-react';
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
            setError('Invalid reset link');
        }
    }, [token]);

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
                setError('Invalid or expired reset link. Please request a new one.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Reset password error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
                <div className="glass rounded-3xl p-8 max-w-md w-full text-center border border-white/10">
                    <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-4">Password Reset! 🎉</h2>
                    <p className="text-gray-400 mb-6">
                        Your password has been successfully reset. Redirecting to login...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-purple-400">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Redirecting...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!token || error === 'Invalid reset link') {
        return (
            <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
                <div className="glass rounded-3xl p-8 max-w-md w-full text-center border border-white/10">
                    <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-4">Invalid Link</h2>
                    <p className="text-gray-400 mb-6">
                        This password reset link is invalid or missing.
                    </p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="px-6 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 transition-all"
                    >
                        Request New Link
                    </button>
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
                <div className="mb-8">
                    <h2 className="text-3xl font-black mb-2">Reset Password 🔐</h2>
                    <p className="text-gray-400">
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 glass border border-white/10 rounded-xl focus:border-purple-500 outline-none transition-colors"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 glass border border-white/10 rounded-xl focus:border-purple-500 outline-none transition-colors"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                minLength={6}
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
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
