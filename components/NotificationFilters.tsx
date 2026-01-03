import React from 'react';
import { Trophy, Users, Award, Megaphone, AlertTriangle, Bell } from 'lucide-react';
import { NotificationCategory } from '../types/notifications';

interface NotificationFiltersProps {
    activeFilter: NotificationCategory | 'all';
    onFilterChange: (filter: NotificationCategory | 'all') => void;
    counts: {
        all: number;
        match: number;
        league: number;
        social: number;
        achievement: number;
        announcement: number;
        alert: number;
    };
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
    activeFilter,
    onFilterChange,
    counts
}) => {
    const filters: Array<{
        id: NotificationCategory | 'all';
        label: string;
        icon: React.ReactNode;
        color: string;
    }> = [
            {
                id: 'all',
                label: 'All',
                icon: <Bell className="w-4 h-4" />,
                color: 'text-gray-400'
            },
            {
                id: 'match',
                label: 'Matches',
                icon: <Trophy className="w-4 h-4" />,
                color: 'text-emerald-400'
            },
            {
                id: 'league',
                label: 'Leagues',
                icon: <Users className="w-4 h-4" />,
                color: 'text-purple-400'
            },
            {
                id: 'social',
                label: 'Social',
                icon: <Users className="w-4 h-4" />,
                color: 'text-blue-400'
            },
            {
                id: 'achievement',
                label: 'Achievements',
                icon: <Award className="w-4 h-4" />,
                color: 'text-yellow-400'
            },
            {
                id: 'announcement',
                label: 'News',
                icon: <Megaphone className="w-4 h-4" />,
                color: 'text-indigo-400'
            },
            {
                id: 'alert',
                label: 'Alerts',
                icon: <AlertTriangle className="w-4 h-4" />,
                color: 'text-red-400'
            }
        ];

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {filters.map((filter) => {
                const isActive = activeFilter === filter.id;
                const count = counts[filter.id] || 0;

                return (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`
              flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs
              whitespace-nowrap transition-all flex-shrink-0
              ${isActive
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }
            `}
                    >
                        <span className={isActive ? 'text-white' : filter.color}>
                            {filter.icon}
                        </span>
                        <span>{filter.label}</span>
                        {count > 0 && (
                            <span
                                className={`
                  min-w-[18px] h-[18px] rounded-full flex items-center justify-center
                  text-[10px] font-black px-1
                  ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-purple-600/20 text-purple-400'
                                    }
                `}
                            >
                                {count > 99 ? '99+' : count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default NotificationFilters;
