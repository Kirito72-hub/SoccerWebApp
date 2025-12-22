
import React, { useState } from 'react';
import {
    Mail,
    Lock,
    User,
    Calendar,
    Eye,
    EyeOff,
    Trophy,
    Sparkles,
    ArrowRight,
    UserPlus,
    LogIn
} from 'lucide-react';
import { User as UserType } from '../types';
import { db } from '../services/database';
import { storage } from '../services/storage';

interface AuthProps {
    onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Login form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup form state
    const [signupData, setSignupData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: ''
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check if Supabase is configured
            if (db.isOnline()) {
                // Use Supabase
                const user = await db.login(loginEmail, loginPassword);

                if (user) {
                    storage.setCurrentUser(user); // Also save to localStorage for session
                    onLogin(user);
                } else {
                    setError('Invalid email or password');
                }
            } else {
                // Fallback to localStorage
                const user = storage.login(loginEmail, loginPassword);

                if (user) {
                    onLogin(user);
                } else {
                    setError('Invalid email or password');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!signupData.firstName || !signupData.lastName || !signupData.username ||
            !signupData.email || !signupData.password || !signupData.dateOfBirth) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        if (signupData.password !== signupData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (signupData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // Check if Supabase is configured
            if (db.isOnline()) {
                // Use Supabase
                const newUser = await db.register({
                    firstName: signupData.firstName,
                    lastName: signupData.lastName,
                    username: signupData.username,
                    email: signupData.email,
                    password: signupData.password,
                    dateOfBirth: signupData.dateOfBirth
                });

                storage.setCurrentUser(newUser); // Also save to localStorage for session
                onLogin(newUser);
            } else {
                // Fallback to localStorage
                const newUser = storage.register({
                    firstName: signupData.firstName,
                    lastName: signupData.lastName,
                    username: signupData.username,
                    email: signupData.email,
                    password: signupData.password,
                    dateOfBirth: signupData.dateOfBirth
                });

                onLogin(newUser);
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'An error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="hidden md:block space-y-8 animate-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight">RAKLA</h1>
                            <p className="text-purple-400 font-bold">Football Manager</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 glass p-6 rounded-2xl border border-white/5">
                            <div className="p-3 bg-emerald-600/20 rounded-xl">
                                <Sparkles className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg mb-1">Create Leagues</h3>
                                <p className="text-gray-400 text-sm">Organize custom tournaments with your friends</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 glass p-6 rounded-2xl border border-white/5">
                            <div className="p-3 bg-blue-600/20 rounded-xl">
                                <Trophy className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg mb-1">Track Performance</h3>
                                <p className="text-gray-400 text-sm">Monitor stats, rankings, and achievements</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 glass p-6 rounded-2xl border border-white/5">
                            <div className="p-3 bg-purple-600/20 rounded-xl">
                                <UserPlus className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg mb-1">Compete Together</h3>
                                <p className="text-gray-400 text-sm">Join leagues and challenge other players</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Forms */}
                <div className="glass rounded-3xl border border-purple-500/30 p-8 md:p-10 shadow-2xl animate-in slide-in-from-right duration-700">
                    {/* Toggle Tabs */}
                    <div className="flex gap-2 mb-8 p-1 glass bg-white/5 rounded-2xl">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${isLogin
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <LogIn className="w-4 h-4 inline mr-2" />
                            LOGIN
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${!isLogin
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <UserPlus className="w-4 h-4 inline mr-2" />
                            SIGN UP
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    {isLogin ? (
                        /* Login Form */
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'LOGGING IN...' : 'LOGIN'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    ) : (
                        /* Signup Form */
                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={signupData.firstName}
                                            onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                                            placeholder="John"
                                            className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={signupData.lastName}
                                            onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                                            placeholder="Doe"
                                            className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Nickname
                                </label>
                                <div className="relative">
                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={signupData.username}
                                        onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                                        placeholder="JohnTheChampion"
                                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={signupData.email}
                                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                        placeholder="your@email.com"
                                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Date of Birth
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="date"
                                        value={signupData.dateOfBirth}
                                        onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
                                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={signupData.password}
                                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={signupData.confirmPassword}
                                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                By signing up, you agree to start as a Normal User. A Superuser can upgrade your role later.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
