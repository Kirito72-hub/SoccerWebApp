
import React, { useState, useEffect } from 'react';
import {
    Shield,
    Search,
    Users,
    Crown,
    UserCog,
    User as UserIcon,
    CheckCircle,
    Trash2,
    AlertTriangle,
    UserX,
    Wifi,
    Bell,
    Send
} from 'lucide-react';
import { User, UserRole } from '../types';
import { dataService } from '../services/dataService';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { sendAppUpdateNotification, sendSystemAnnouncement } from '../services/newsUtils';

interface SettingsProps {
    user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [deletedCount, setDeletedCount] = useState(0);
    const [realtimeConnected, setRealtimeConnected] = useState(false);
    const [flashUserId, setFlashUserId] = useState<string | null>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<'users' | 'announcements'>('users');

    // Announcement state
    const [announcementType, setAnnouncementType] = useState<'appUpdate' | 'announcement'>('announcement');
    const [announcementMessage, setAnnouncementMessage] = useState('');
    const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
    const [announcementSuccess, setAnnouncementSuccess] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                const users = await dataService.getUsers();
                setAllUsers(users);
            } catch (error) {
                console.error('Error loading users:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
        setRealtimeConnected(true);
    }, []);

    // Realtime subscription for user changes
    useRealtimeSubscription({
        table: 'users',
        event: '*',
        enabled: dataService.isOnline() && !loading,
        onUpdate: (updatedUser) => {
            setAllUsers(prev =>
                prev.map(u => {
                    if (u.id === updatedUser.id) {
                        // Flash effect for updated user
                        setFlashUserId(updatedUser.id);
                        setTimeout(() => setFlashUserId(null), 1500);

                        return {
                            id: updatedUser.id,
                            email: updatedUser.email,
                            password: updatedUser.password,
                            username: updatedUser.username,
                            firstName: updatedUser.first_name,
                            lastName: updatedUser.last_name,
                            dateOfBirth: updatedUser.date_of_birth,
                            role: updatedUser.role,
                            avatar: updatedUser.avatar
                        };
                    }
                    return u;
                })
            );
        },
        onDelete: (deletedUser) => {
            setAllUsers(prev => prev.filter(u => u.id !== deletedUser.id));
            // Remove from selected if it was selected
            setSelectedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(deletedUser.id);
                return newSet;
            });
        },
        onInsert: (newUser) => {
            const user: User = {
                id: newUser.id,
                email: newUser.email,
                password: newUser.password,
                username: newUser.username,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                dateOfBirth: newUser.date_of_birth,
                role: newUser.role,
                avatar: newUser.avatar
            };
            setAllUsers(prev => [...prev, user]);
            // Flash effect for new user
            setFlashUserId(user.id);
            setTimeout(() => setFlashUserId(null), 1500);
        }
    });

    const filteredUsers = searchQuery.trim()
        ? allUsers.filter(u =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allUsers;

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            await dataService.updateUserRole(userId, newRole);
            const users = await dataService.getUsers();
            setAllUsers(users);
            setUpdatingUserId(userId);
            setTimeout(() => setUpdatingUserId(null), 2000);
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleResetDatabase = async () => {
        try {
            setResetting(true);
            await dataService.resetDatabase(true); // Preserve superusers

            // Reload users
            const users = await dataService.getUsers();
            setAllUsers(users);

            setShowResetConfirm(false);
            alert('Database reset successfully! All data except superuser accounts has been deleted.');
        } catch (error) {
            console.error('Error resetting database:', error);
            alert('Failed to reset database: ' + (error as Error).message);
        } finally {
            setResetting(false);
        }
    };

    const handleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedUsers.size === selectableUsers.length) {
            setSelectedUsers(new Set());
        } else {
            const allSelectableIds = selectableUsers.map(u => u.id);
            setSelectedUsers(new Set(allSelectableIds));
        }
    };

    const handleDeleteSelected = async () => {
        try {
            setDeleting(true);
            const count = selectedUsers.size;

            // Delete each selected user
            for (const userId of selectedUsers) {
                await dataService.deleteUser(userId);
            }

            // Reload users
            const users = await dataService.getUsers();
            setAllUsers(users);
            setSelectedUsers(new Set());
            setShowDeleteConfirm(false);

            // Show success message
            setDeletedCount(count);
            setShowSuccessMessage(true);

            // Auto-hide after 3 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
        } catch (error) {
            console.error('Error deleting users:', error);
            alert('Failed to delete users: ' + (error as Error).message);
        } finally {
            setDeleting(false);
        }
    };

    const handleSendAnnouncement = async () => {
        if (!announcementMessage.trim()) {
            alert('Please enter a message');
            return;
        }

        try {
            setSendingAnnouncement(true);

            if (announcementType === 'appUpdate') {
                await sendAppUpdateNotification(announcementMessage);
            } else {
                await sendSystemAnnouncement(announcementMessage);
            }

            // Show success
            setAnnouncementSuccess(true);
            setAnnouncementMessage('');

            // Auto-hide after 3 seconds
            setTimeout(() => {
                setAnnouncementSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error sending announcement:', error);
            alert('Failed to send announcement: ' + (error as Error).message);
        } finally {
            setSendingAnnouncement(false);
        }
    };

    // Users that can be selected (not superusers, not current user)
    const selectableUsers = filteredUsers.filter(u => u.role !== 'superuser' && u.id !== user.id);
    const allSelectableSelected = selectableUsers.length > 0 && selectedUsers.size === selectableUsers.length;

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'superuser':
                return <Crown className="w-4 h-4 text-yellow-400" />;
            case 'pro_manager':
                return <UserCog className="w-4 h-4 text-purple-400" />;
            case 'normal_user':
                return <UserIcon className="w-4 h-4 text-blue-400" />;
        }
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'superuser':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'pro_manager':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            case 'normal_user':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case 'superuser':
                return 'Superuser';
            case 'pro_manager':
                return 'Pro Manager';
            case 'normal_user':
                return 'Normal User';
        }
    };

    // Only superusers can access this page
    if (user.role !== 'superuser') {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="p-6 glass rounded-full border border-red-500/20 text-red-400">
                    <Shield className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black">ACCESS DENIED</h2>
                <p className="text-gray-500">Only superusers can access this section.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">SETTINGS</h1>
                        {realtimeConnected && dataService.isOnline() && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
                                <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm lg:text-base text-gray-500 font-medium">Manage user roles and permissions</p>
                </div>

                {/* Reset Database Button */}
                <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-400 font-bold text-sm transition-all hover:scale-105"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset Database</span>
                    <span className="sm:hidden">Reset DB</span>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 glass rounded-2xl border border-white/5 w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'users'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('announcements')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'announcements'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Bell className="w-4 h-4" />
                    Announcements
                </button>
            </div>

            {/* User Management Tab */}
            {activeTab === 'users' && (
                <>
                    {/* User Role Management Panel */}
                    <div className="glass rounded-2xl lg:rounded-3xl border border-white/5 p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-4 lg:mb-6">
                            <div className="p-2 lg:p-3 bg-purple-600/20 rounded-xl">
                                <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg lg:text-xl font-black">User Authority Management</h2>
                                <p className="text-xs lg:text-sm text-gray-500">Control user roles and permissions</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-4 lg:mb-6">
                            <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full glass bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl pl-10 lg:pl-12 pr-4 lg:pr-6 py-3 lg:py-4 text-sm lg:text-base text-white focus:border-purple-600 outline-none transition-all font-bold"
                            />
                        </div>

                        {/* Role Legend */}
                        <div className="flex flex-wrap gap-4 mb-6 p-4 glass bg-white/5 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs font-bold text-gray-400">Superuser: Full Access</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserCog className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-gray-400">Pro Manager: Create/Manage Leagues</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-gray-400">Normal User: View Only</span>
                            </div>
                        </div>

                        {/* Bulk Actions Bar */}
                        {selectableUsers.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-3 lg:p-4 glass bg-white/5 rounded-xl lg:rounded-2xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={allSelectableSelected}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-900 cursor-pointer"
                                    />
                                    <span className="text-sm font-bold text-gray-400">
                                        {selectedUsers.size > 0
                                            ? `${selectedUsers.size} user(s) selected`
                                            : 'Select all'}
                                    </span>
                                </div>

                                {selectedUsers.size > 0 && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg lg:rounded-xl text-red-400 font-bold text-sm transition-all hover:scale-105"
                                    >
                                        <UserX className="w-4 h-4" />
                                        <span>Delete Selected ({selectedUsers.size})</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Users List */}
                        <div className="space-y-3">
                            {filteredUsers.map((u) => (
                                <div
                                    key={u.id}
                                    className={`glass rounded-xl lg:rounded-2xl border p-3 sm:p-4 lg:p-5 hover:border-purple-500/30 transition-all ${flashUserId === u.id
                                        ? 'border-emerald-500/50 bg-emerald-500/10 animate-pulse'
                                        : 'border-white/5'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            {/* Checkbox for selectable users */}
                                            {u.role !== 'superuser' && u.id !== user.id && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.has(u.id)}
                                                    onChange={() => handleSelectUser(u.id)}
                                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-900 cursor-pointer flex-shrink-0"
                                                />
                                            )}

                                            <img
                                                src={u.avatar || `/avatars/anime_striker.png`}
                                                alt={u.username}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-purple-500/30 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="font-bold text-sm sm:text-base truncate">{u.username}</p>
                                                    {u.id === user.id && (
                                                        <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-[10px] font-black rounded-md flex-shrink-0">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate">{u.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                                            {/* Current Role Badge */}
                                            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border ${getRoleBadgeColor(u.role)} flex-shrink-0`}>
                                                {getRoleIcon(u.role)}
                                                <span className="text-[10px] sm:text-xs font-black whitespace-nowrap">{getRoleLabel(u.role)}</span>
                                            </div>

                                            {/* Role Change Dropdown */}
                                            {u.id !== user.id && (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                                    className="glass bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold focus:border-purple-600 outline-none transition-all cursor-pointer flex-shrink-0"
                                                >
                                                    <option value="superuser" className="bg-[#1a1a2e]">Superuser</option>
                                                    <option value="pro_manager" className="bg-[#1a1a2e]">Pro Manager</option>
                                                    <option value="normal_user" className="bg-[#1a1a2e]">Normal User</option>
                                                </select>
                                            )}

                                            {updatingUserId === u.id && (
                                                <div className="flex items-center gap-1.5 text-emerald-400 animate-in fade-in duration-300">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-xs font-bold hidden sm:inline">Updated!</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500">No users found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reset Database Confirmation Modal */}
                    {showResetConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                            <div className="glass rounded-3xl border border-red-500/30 p-6 lg:p-8 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-600/20 rounded-xl">
                                        <AlertTriangle className="w-8 h-8 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-black text-red-400">Reset Database?</h3>
                                        <p className="text-xs lg:text-sm text-gray-400">This action cannot be undone</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm lg:text-base">
                                    <p className="text-gray-300">
                                        This will <strong className="text-red-400">permanently delete</strong>:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-400 ml-2">
                                        <li>All leagues and matches</li>
                                        <li>All activity logs</li>
                                        <li>All user accounts (except superusers)</li>
                                        <li>All user statistics</li>
                                    </ul>
                                    <p className="text-emerald-400 font-bold mt-4">
                                        ✓ Superuser accounts will be preserved
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowResetConfirm(false)}
                                        disabled={resetting}
                                        className="flex-1 px-4 py-3 glass border border-white/10 rounded-xl font-bold text-sm hover:bg-white/5 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleResetDatabase}
                                        disabled={resetting}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {resetting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Resetting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Reset Database
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Users Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                            <div className="glass rounded-3xl border border-red-500/30 p-6 lg:p-8 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-600/20 rounded-xl">
                                        <UserX className="w-8 h-8 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-black text-red-400">Delete Users?</h3>
                                        <p className="text-xs lg:text-sm text-gray-400">This action cannot be undone</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm lg:text-base">
                                    <p className="text-gray-300">
                                        You are about to <strong className="text-red-400">permanently delete</strong>:
                                    </p>
                                    <div className="p-3 glass bg-red-600/10 rounded-xl border border-red-500/20">
                                        <p className="font-bold text-red-400 text-lg">{selectedUsers.size} user account(s)</p>
                                    </div>
                                    <p className="text-gray-400 text-xs">
                                        All associated data including stats and activity will be removed.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 glass border border-white/10 rounded-xl font-bold text-sm hover:bg-white/5 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteSelected}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <UserX className="w-4 h-4" />
                                                Delete {selectedUsers.size} User(s)
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message Modal */}
                    {showSuccessMessage && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                            <div className="glass rounded-2xl lg:rounded-3xl border border-emerald-500/30 p-6 lg:p-8 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-300 shadow-2xl shadow-emerald-500/20">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    {/* Success Icon */}
                                    <div className="p-4 bg-emerald-600/20 rounded-full">
                                        <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-emerald-400" />
                                    </div>

                                    {/* Success Message */}
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-black text-emerald-400 mb-2">
                                            Successfully Deleted!
                                        </h3>
                                        <p className="text-sm lg:text-base text-gray-300">
                                            <span className="font-bold text-emerald-400">{deletedCount}</span> user{deletedCount !== 1 ? 's' : ''} {deletedCount !== 1 ? 'have' : 'has'} been removed
                                        </p>
                                    </div>

                                    {/* Auto-dismiss indicator */}
                                    <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full w-full"></div>
                                    </div>
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={() => setShowSuccessMessage(false)}
                                    className="w-full px-4 py-2.5 glass border border-emerald-500/30 rounded-xl font-bold text-sm text-emerald-400 hover:bg-emerald-600/10 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
                <div className="glass rounded-2xl lg:rounded-3xl border border-white/5 p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-600/20 rounded-xl">
                            <Bell className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">Send Announcement</h2>
                            <p className="text-sm text-gray-500">Broadcast notifications to all users</p>
                        </div>
                    </div>

                    {/* Announcement Type Selection */}
                    <div className="mb-6">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">
                            Notification Type
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAnnouncementType('announcement')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${announcementType === 'announcement'
                                        ? 'border-purple-500 bg-purple-600/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <Bell className={`w-6 h-6 mx-auto mb-2 ${announcementType === 'announcement' ? 'text-purple-400' : 'text-gray-500'
                                    }`} />
                                <div className="text-sm font-bold">System Announcement</div>
                                <div className="text-xs text-gray-500 mt-1">General updates & news</div>
                            </button>
                            <button
                                onClick={() => setAnnouncementType('appUpdate')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${announcementType === 'appUpdate'
                                        ? 'border-emerald-500 bg-emerald-600/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${announcementType === 'appUpdate' ? 'text-emerald-400' : 'text-gray-500'
                                    }`} />
                                <div className="text-sm font-bold">App Update</div>
                                <div className="text-xs text-gray-500 mt-1">New features & versions</div>
                            </button>
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="mb-6">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">
                            Message
                        </label>
                        <textarea
                            value={announcementMessage}
                            onChange={(e) => setAnnouncementMessage(e.target.value)}
                            placeholder={
                                announcementType === 'appUpdate'
                                    ? 'e.g., v1.3.0 is here! Check out PWA features! 🎉'
                                    : 'e.g., Tournament finals this Sunday! 🏆'
                            }
                            rows={4}
                            className="w-full glass bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                                {announcementMessage.length} characters
                            </p>
                            <p className="text-xs text-gray-500">
                                Will be sent to all users with notifications enabled
                            </p>
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSendAnnouncement}
                        disabled={sendingAnnouncement || !announcementMessage.trim()}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
                    >
                        {sendingAnnouncement ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                SEND TO ALL USERS
                            </>
                        )}
                    </button>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl">
                        <p className="text-xs text-blue-300">
                            <strong>Note:</strong> This will send a push notification to all users who have "{
                                announcementType === 'appUpdate' ? 'App Updates' : 'News'
                            }" notifications enabled in their Profile settings.
                        </p>
                    </div>

                    {/* Success Message Modal */}
                    {announcementSuccess && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                            <div className="glass rounded-3xl border border-emerald-500/30 p-8 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-emerald-400 mb-2">Announcement Sent!</h3>
                                    <p className="text-gray-400">
                                        Your {announcementType === 'appUpdate' ? 'app update' : 'announcement'} notification has been broadcast to all users.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setAnnouncementSuccess(false)}
                                    className="w-full px-4 py-3 glass border border-emerald-500/30 rounded-xl font-bold text-sm text-emerald-400 hover:bg-emerald-600/10 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Settings;
