
import React, { useState, useRef } from 'react';
import {
    User as UserIcon,
    Mail,
    Lock,
    Save,
    Eye,
    EyeOff,
    Calendar,
    Shield,
    CheckCircle,
    Camera,
    X,
    Upload
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';
import { db } from '../services/database';
import bcrypt from 'bcryptjs';

interface ProfileProps {
    user: User;
}

// Custom Anime Soccer Themed Avatars
const AVATAR_OPTIONS = [
    // Original 5
    '/avatars/anime_striker.png',
    '/avatars/anime_midfielder.png',
    '/avatars/anime_defender.png',
    '/avatars/anime_keeper.png',
    '/avatars/anime_winger.png',
    // New Additions
    '/avatars/anime_captain.png',
    '/avatars/anime_strategist.png',
    '/avatars/anime_wild.png',
    '/avatars/anime_princess.png',
    '/avatars/anime_rookie.png',
    // Newest Additions
    '/avatars/anime_veteran.png',
    '/avatars/anime_acrobat.png',
    '/avatars/anime_phantom.png',
    // Batch 1 & 2 (Generated)
    '/avatars/anime_coach.png',
    '/avatars/anime_analyst.png',
    '/avatars/anime_speedster.png',
    '/avatars/anime_wall.png',
    '/avatars/anime_prodigy.png',
    '/avatars/anime_twin_a.png',
    // External Anime Avatars (High Quality)
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4&eyes=happy&mouth=smile&top=shortHair&topColor=auburn',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&backgroundColor=ffdfbf&eyes=wink&mouth=smile&top=shortHair&topColor=blue',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=c0aede&eyes=default&mouth=serious&top=shortHair&topColor=black',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sora&backgroundColor=d1d4f9&eyes=happy&mouth=smile&top=longHair&topColor=platinum',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryu&backgroundColor=ffd5dc&eyes=default&mouth=smile&top=shortHair&topColor=red',
];

const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            // Verify current password
            const isValidPassword = db.isOnline()
                ? await bcrypt.compare(formData.currentPassword, user.password)
                : formData.currentPassword === user.password;

            if (!isValidPassword) {
                setError('Current password is incorrect');
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
                if (db.isOnline()) {
                    await db.updateUser(user.id, updates);
                    // Update localStorage session as well
                    const updatedUser = { ...user, ...updates };
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

    const handleAvatarSave = async (avatarUrl: string) => {
        try {
            setError('');
            setSuccess('');

            // Update avatar in database
            if (db.isOnline()) {
                await db.updateUser(user.id, { avatar: avatarUrl });
                // Update localStorage session as well
                const updatedUser = { ...user, avatar: avatarUrl };
                storage.setCurrentUser(updatedUser);
            } else {
                storage.updateUserProfile(user.id, { avatar: avatarUrl });
            }

            setSelectedAvatar(avatarUrl);
            setShowAvatarPicker(false);
            setSuccess('Avatar updated successfully!');

            // Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            console.error('Avatar update error:', err);
            setError(err.message || 'Failed to update avatar');
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Image size must be less than 2MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setUploadedImage(base64String);
            setSelectedAvatar(base64String);
        };
        reader.readAsDataURL(file);
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
                    {/* Clickable Avatar with Camera Icon */}
                    <div className="relative group cursor-pointer mb-4" onClick={() => setShowAvatarPicker(true)}>
                        <img
                            src={selectedAvatar || user.avatar || `https://picsum.photos/seed/${user.id}/200`}
                            alt={user.username}
                            className="w-32 h-32 rounded-full border-4 border-purple-600 shadow-lg shadow-purple-600/30 transition-all group-hover:border-purple-500 group-hover:scale-105"
                        />
                        {/* Camera Icon Indicator */}
                        <div className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full border-4 border-[#0f0f23] shadow-lg group-hover:bg-purple-500 transition-all">
                            <Camera className="w-4 h-4 text-white" />
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-xs font-bold">Change Avatar</p>
                        </div>
                    </div>
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

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="glass rounded-3xl border border-purple-500/30 p-6 lg:p-8 max-w-2xl w-full space-y-6 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-600/20 rounded-xl">
                                    <Camera className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-black">Choose Your Avatar</h3>
                                    <p className="text-xs lg:text-sm text-gray-400">Select a football player avatar</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAvatarPicker(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Upload Button */}
                        <div className="flex gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 px-4 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-sm transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Your Own Picture
                            </button>
                        </div>

                        {/* Avatar Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {/* Show uploaded image first if exists */}
                            {uploadedImage && (
                                <button
                                    onClick={() => setSelectedAvatar(uploadedImage)}
                                    className={`relative group rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 ${selectedAvatar === uploadedImage
                                        ? 'border-emerald-500 shadow-lg shadow-emerald-500/50'
                                        : 'border-white/10 hover:border-emerald-500/50'
                                        }`}
                                >
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded"
                                        className="w-full h-full object-cover aspect-square"
                                    />
                                    {selectedAvatar === uploadedImage && (
                                        <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                                            <CheckCircle className="w-8 h-8 text-white" />
                                        </div>
                                    )}
                                    <div className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                        YOUR PHOTO
                                    </div>
                                </button>
                            )}

                            {/* Preset avatars */}
                            {AVATAR_OPTIONS.map((avatarUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedAvatar(avatarUrl)}
                                    className={`relative group rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 ${selectedAvatar === avatarUrl
                                        ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                                        : 'border-white/10 hover:border-purple-500/50'
                                        }`}
                                >
                                    <img
                                        src={avatarUrl}
                                        alt={`Avatar ${index + 1}`}
                                        className="w-full h-full object-cover aspect-square"
                                    />
                                    {selectedAvatar === avatarUrl && (
                                        <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                                            <CheckCircle className="w-8 h-8 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowAvatarPicker(false)}
                                className="flex-1 px-4 py-3 glass border border-white/10 rounded-xl font-bold text-sm hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAvatarSave(selectedAvatar)}
                                disabled={!selectedAvatar}
                                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                Save Avatar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
