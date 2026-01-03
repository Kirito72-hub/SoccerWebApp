import React, { useState, useEffect } from 'react';
import { X, Bell, Volume2, VolumeX, Mail, Smartphone, Moon, RotateCcw, Save } from 'lucide-react';
import { notificationPreferences } from '../services/notificationPreferences';
import { NotificationPreferences as PreferencesType } from '../types/notifications';

interface NotificationPreferencesProps {
    userId: string;
    onClose: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
    userId,
    onClose
}) => {
    const [preferences, setPreferences] = useState<PreferencesType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, [userId]);

    const loadPreferences = async () => {
        setLoading(true);
        const prefs = await notificationPreferences.getPreferences(userId);
        setPreferences(prefs);
        setLoading(false);
    };

    const handleToggle = (field: keyof PreferencesType, value: boolean) => {
        if (!preferences) return;
        setPreferences({ ...preferences, [field]: value });
        setHasChanges(true);
    };

    const handleTimeChange = (field: 'do_not_disturb_start' | 'do_not_disturb_end', value: string) => {
        if (!preferences) return;
        setPreferences({ ...preferences, [field]: value });
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!preferences) return;
        setSaving(true);

        const success = await notificationPreferences.updatePreferences(userId, {
            match_notifications: preferences.match_notifications,
            league_notifications: preferences.league_notifications,
            social_notifications: preferences.social_notifications,
            achievement_notifications: preferences.achievement_notifications,
            announcement_notifications: preferences.announcement_notifications,
            alert_notifications: preferences.alert_notifications,
            sound_enabled: preferences.sound_enabled,
            email_notifications: preferences.email_notifications,
            push_notifications: preferences.push_notifications,
            do_not_disturb_enabled: preferences.do_not_disturb_enabled,
            do_not_disturb_start: preferences.do_not_disturb_start,
            do_not_disturb_end: preferences.do_not_disturb_end
        });

        if (success) {
            setHasChanges(false);
        }

        setSaving(false);
    };

    const handleReset = async () => {
        if (!confirm('Reset all preferences to defaults?')) return;

        setSaving(true);
        const success = await notificationPreferences.resetToDefaults(userId);
        if (success) {
            await loadPreferences();
            setHasChanges(false);
        }
        setSaving(false);
    };

    if (loading || !preferences) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="glass rounded-3xl border border-purple-500/30 p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-sm text-gray-400 mt-4">Loading preferences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
            <div className="glass rounded-3xl border border-purple-500/30 w-full max-w-2xl my-8 animate-in slide-in-from-top duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600/20 rounded-xl">
                            <Bell className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">Notification Preferences</h2>
                            <p className="text-xs text-gray-500">Customize your notification settings</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Notification Types */}
                    <div>
                        <h3 className="font-black text-sm mb-3 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-purple-400" />
                            Notification Types
                        </h3>
                        <div className="space-y-2">
                            {[
                                { key: 'match_notifications' as const, label: 'Match Results', desc: 'Get notified about match outcomes' },
                                { key: 'league_notifications' as const, label: 'League Updates', desc: 'League creation, completion, and standings' },
                                { key: 'social_notifications' as const, label: 'Social', desc: 'Friend requests and mentions' },
                                { key: 'achievement_notifications' as const, label: 'Achievements', desc: 'Milestones and unlocks' },
                                { key: 'announcement_notifications' as const, label: 'Announcements', desc: 'App updates and news' },
                                { key: 'alert_notifications' as const, label: 'Alerts', desc: 'Important warnings and alerts' }
                            ].map((item) => (
                                <label key={item.key} className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences[item.key]}
                                        onChange={(e) => handleToggle(item.key, e.target.checked)}
                                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Methods */}
                    <div>
                        <h3 className="font-black text-sm mb-3 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-purple-400" />
                            Delivery Methods
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    {preferences.sound_enabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                                    <div>
                                        <p className="font-bold text-sm">Sound Notifications</p>
                                        <p className="text-xs text-gray-500">Play sound when notifications arrive</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.sound_enabled}
                                    onChange={(e) => handleToggle('sound_enabled', e.target.checked)}
                                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-purple-400" />
                                    <div>
                                        <p className="font-bold text-sm">Email Notifications</p>
                                        <p className="text-xs text-gray-500">Receive notifications via email</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.email_notifications}
                                    onChange={(e) => handleToggle('email_notifications', e.target.checked)}
                                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-4 h-4 text-purple-400" />
                                    <div>
                                        <p className="font-bold text-sm">Push Notifications</p>
                                        <p className="text-xs text-gray-500">Browser push notifications</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.push_notifications}
                                    onChange={(e) => handleToggle('push_notifications', e.target.checked)}
                                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Do Not Disturb */}
                    <div>
                        <h3 className="font-black text-sm mb-3 flex items-center gap-2">
                            <Moon className="w-4 h-4 text-purple-400" />
                            Do Not Disturb
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                <div>
                                    <p className="font-bold text-sm">Enable Do Not Disturb</p>
                                    <p className="text-xs text-gray-500">Silence notifications during specific hours</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={preferences.do_not_disturb_enabled}
                                    onChange={(e) => handleToggle('do_not_disturb_enabled', e.target.checked)}
                                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                />
                            </label>

                            {preferences.do_not_disturb_enabled && (
                                <div className="grid grid-cols-2 gap-3 p-3 glass rounded-lg">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            value={preferences.do_not_disturb_start}
                                            onChange={(e) => handleTimeChange('do_not_disturb_start', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            value={preferences.do_not_disturb_end}
                                            onChange={(e) => handleTimeChange('do_not_disturb_end', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
                    <button
                        onClick={handleReset}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset to Defaults
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-sm text-white transition-all"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreferences;
