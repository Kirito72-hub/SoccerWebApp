
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Trophy,
    Trash2,
    Target,
    Clock,
    User as UserIcon,
    Filter,
    Search
} from 'lucide-react';
import { User, ActivityLog as ActivityLogType } from '../types';
import { dataService } from '../services/dataService';

interface ActivityLogProps {
    user: User;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ user }) => {
    // AUTHORIZATION CHECK: Only superusers can view activity logs
    if (user.role !== 'superuser') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4">
                    <div className="text-6xl">🚫</div>
                    <h1 className="text-3xl font-black text-red-400">ACCESS DENIED</h1>
                    <p className="text-gray-400">You don't have permission to view activity logs.</p>
                    <p className="text-sm text-gray-500">Required role: Superuser</p>
                </div>
            </div>
        );
    }

    const [logs, setLogs] = useState<ActivityLogType[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<ActivityLogType[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                setLoading(true);
                const allLogs = await dataService.getActivityLogs();
                setLogs(allLogs);
                setFilteredLogs(allLogs);
            } catch (error) {
                console.error('Error loading activity logs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLogs();
    }, []);

    useEffect(() => {
        if (filterType === 'all') {
            setFilteredLogs(logs);
        } else {
            setFilteredLogs(logs.filter(log => log.type === filterType));
        }
    }, [filterType, logs]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'league_created':
                return <Trophy className="w-5 h-5 text-emerald-400" />;
            case 'league_deleted':
                return <Trash2 className="w-5 h-5 text-red-400" />;
            case 'match_result':
                return <Target className="w-5 h-5 text-purple-400" />;
            case 'league_started':
                return <Clock className="w-5 h-5 text-blue-400" />;
            case 'league_finished':
                return <Trophy className="w-5 h-5 text-yellow-400" />;
            default:
                return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'league_created':
                return 'border-emerald-500/30 bg-emerald-500/5';
            case 'league_deleted':
                return 'border-red-500/30 bg-red-500/5';
            case 'match_result':
                return 'border-purple-500/30 bg-purple-500/5';
            case 'league_started':
                return 'border-blue-500/30 bg-blue-500/5';
            case 'league_finished':
                return 'border-yellow-500/30 bg-yellow-500/5';
            default:
                return 'border-white/5 bg-white/5';
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading activity logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">ACTIVITY LOG</h1>
                    <p className="text-gray-500 font-medium">Track all activities and movements in the app</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="glass bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm font-bold focus:border-purple-600 outline-none transition-all"
                    >
                        <option value="all" className="bg-[#1a1a2e]">All Activities</option>
                        <option value="league_created" className="bg-[#1a1a2e]">League Created</option>
                        <option value="league_deleted" className="bg-[#1a1a2e]">League Deleted</option>
                        <option value="match_result" className="bg-[#1a1a2e]">Match Results</option>
                        <option value="league_started" className="bg-[#1a1a2e]">League Started</option>
                        <option value="league_finished" className="bg-[#1a1a2e]">League Finished</option>
                    </select>
                </div>
            </div>

            {filteredLogs.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                    <div className="p-6 glass rounded-full border border-purple-500/20 text-purple-400">
                        <FileText className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black">NO ACTIVITIES YET</h2>
                    <p className="text-gray-500">Activity logs will appear here as actions are performed.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            className={`glass rounded-2xl border p-5 transition-all hover:scale-[1.01] ${getActivityColor(log.type)}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 glass rounded-xl border border-white/10 flex-shrink-0">
                                    {getActivityIcon(log.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex-1">
                                            <p className="font-bold text-white mb-1">{log.description}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <UserIcon className="w-3 h-3" />
                                                    <span className="font-medium">{log.username}</span>
                                                </div>
                                                {log.metadata?.leagueName && (
                                                    <div className="flex items-center gap-1">
                                                        <Trophy className="w-3 h-3" />
                                                        <span className="font-medium">{log.metadata.leagueName}</span>
                                                    </div>
                                                )}
                                                {log.metadata?.score && (
                                                    <div className="px-2 py-0.5 bg-white/5 rounded-md">
                                                        <span className="font-black">{log.metadata.score}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                                            <Clock className="w-3 h-3" />
                                            <span className="font-medium">{formatTimestamp(log.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityLog;
