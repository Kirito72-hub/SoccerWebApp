import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { db } from '../services/database';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        const verify = async () => {
            try {
                const userId = await db.verifyToken(token, 'email_verification');
                if (userId) {
                    await db.verifyEmail(userId);
                    setStatus('success');
                    setMessage('Your email has been successfully verified!');
                    setTimeout(() => navigate('/'), 3000);
                } else {
                    setStatus('error');
                    setMessage('This verification link is invalid or has expired.');
                }
            } catch (err) {
                console.error('Email verification error:', err);
                setStatus('error');
                setMessage('An error occurred during verification.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative glass rounded-3xl p-8 max-w-md w-full text-center border border-white/10">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black mb-4">Verifying Email... 📧</h2>
                        <p className="text-gray-400">
                            Please wait while we verify your email address.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-4">Email Verified! 🎉</h2>
                        <p className="text-gray-400 mb-6">
                            {message}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-purple-400">
                            <Loader className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Redirecting to login...</span>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-4">Verification Failed</h2>
                        <p className="text-gray-400 mb-6">
                            {message}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/')}
                                className="w-full px-6 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 transition-all hover:scale-105 active:scale-95"
                            >
                                Back to Login
                            </button>
                            <p className="text-sm text-gray-500">
                                Need a new verification link? Contact support.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
