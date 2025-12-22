
import React, { useState } from 'react';
import {
    User as UserIcon,
    Mail,
    Lock,
    Save,
    Eye,
    EyeOff,
    Calendar,
    Shield,
    CheckCircle
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';
import { db } from '../services/database';
import bcrypt from 'bcryptjs';

interface ProfileProps {
    user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSave = async () => {
        setError('');
        setSuccess('');

        // Validate current password if changing password
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                setError('Current password is required to change password');
                return;
            }

            // Verify current password by attempting login
            try {
                const isOnline = await db.isOnline();

                if (isOnline) {
                    // Verify password using database login
                    const verifiedUser = await db.login(user.email, formData.currentPassword);
                    if (!verifiedUser) {
                        setError('Current password is incorrect');
                        return;
                    }
                } else {
                    // For offline mode, compare directly (shouldn't happen in production)
                    if (formData.currentPassword !== user.password) {
                        setError('Current password is incorrect');
                        return;
                    }
                }
            } catch (err) {
                setError('Failed to verify current password');
                return;
            }

            if (formData.newPassword.length < 6) {
                setError('New password must be at least 6 characters');
                return;
            }

            if (formData.newPassword !== formData.confirmPassword) {
                setError('New passwords do not match');
                return;
            }
        }

        try {
            const updates: { email?: string; password?: string } = {};

            if (formData.email !== user.email) {
                updates.email = formData.email;
            }

            if (formData.newPassword) {
                updates.password = formData.newPassword;
            }

            if (Object.keys(updates).length > 0) {
                // Use Supabase if configured, otherwise localStorage
                const isOnline = await db.isOnline();

                if (isOnline) {
                    await db.updateUser(user.id, updates);
                    // Update localStorage session as well
                    const updatedUser = { ...user, ...updates };
                    // If password was changed, we need to hash it for localStorage
                    if (updates.password) {
                        updatedUser.password = await bcrypt.hash(updates.password, 10);
                    }
                    storage.setCurrentUser(updatedUser);
                } else {
                    storage.updateUserProfile(user.id, updates);
                }

                setSuccess('Profile updated successfully!');
                setEditing(false);
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });

                // Reload page to reflect changes
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setError('No changes to save');
            }
        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to update profile');
        }
    };

    const getRoleBadgeColor = () => {
        switch (user.role) {
            case 'superuser':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'pro_manager':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            case 'normal_user':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        }
    };

    const getRoleLabel = () => {
        switch (user.role) {
            case 'superuser':
                return 'Superuser';
            case 'pro_manager':
                return 'Pro Manager';
            case 'normal_user':
                return 'Normal User';
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight">PROFILE</h1>
                <p className="text-gray-500 font-medium">Manage your account information</p>
            </div>

            {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-bold flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle className="w-5 h-5" />
                    {success}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold animate-in fade-in duration-300">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="glass rounded-3xl border border-white/5 p-8 flex flex-col items-center text-center">
                    <img
                        src={user.avatar || `https://picsum.photos/seed/${user.id}/200`}
                        alt={user.username}
                        className="w-32 h-32 rounded-full border-4 border-purple-600 shadow-lg shadow-purple-600/30 mb-4"
                    />
                    <h2 className="text-2xl font-black mb-1">{user.username}</h2>
                    <p className="text-gray-500 text-sm mb-4">{user.firstName} {user.lastName}</p>

                    <div className={`px-4 py-2 rounded-xl border ${getRoleBadgeColor()} flex items-center gap-2 mb-6`}>
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-black">{getRoleLabel()}</span>
                    </div>

                    <div className="w-full space-y-3 text-left">
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400">Born: {new Date(user.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400">{user.email}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Form */}
                <div className="md:col-span-2 glass rounded-3xl border border-white/5 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black">Account Settings</h3>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm transition-all"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!editing}
                                    className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {editing && (
                            <>
                                {/* Current Password */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        Current Password (required to change password)
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            placeholder="Enter current password"
                                            className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold"
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

                                {/* New Password */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        New Password (optional)
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            placeholder="Enter new password"
                                            className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Confirm new password"
                                            className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
                                    >
                                        <Save className="w-5 h-5" />
                                        SAVE CHANGES
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setFormData({
                                                email: user.email,
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                            setError('');
                                            setSuccess('');
                                        }}
                                        className="px-6 py-3 glass border border-white/10 rounded-2xl font-black text-sm hover:bg-white/5 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            </>
                        )}

                        {!editing && (
                            <div className="p-4 glass bg-white/5 rounded-xl border border-white/10">
                                <p className="text-sm text-gray-400">
                                    Click "Edit Profile" to update your email address or change your password.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
