
import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Search,
    Filter,
    Calendar,
    Users,
    CheckCircle,
    LayoutGrid
} from 'lucide-react';
import { User, League, LeagueFormat } from '../types';
import { dataService } from '../services/dataService';

interface FinishedLeaguesLogProps {
    user: User;
}

const FinishedLeaguesLog: React.FC<FinishedLeaguesLogProps> = ({ user }) => {
    const [finishedLeagues, setFinishedLeagues] = useState<League[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFormats, setSelectedFormats] = useState<LeagueFormat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFinishedLeagues = async () => {
            try {
                setLoading(true);
                const allLeagues = await dataService.getLeagues();
                const finished = allLeagues.filter(l => l.status === 'finished');
                setFinishedLeagues(finished);
            } catch (error) {
                console.error('Error loading finished leagues:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFinishedLeagues();
    }, []);

    const toggleFormat = (format: LeagueFormat) => {
        setSelectedFormats(prev =>
            prev.includes(format)
                ? prev.filter(f => f !== format)
                : [...prev, format]
        );
    };

    const filteredLeagues = finishedLeagues.filter(league => {
        const matchesSearch = league.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(league.format);
        return matchesSearch && matchesFormat;
    });

    const getFormatLabel = (format: LeagueFormat) => {
        switch (format) {
            case 'round_robin_1leg': return '1 Leg RR';
            case 'round_robin_2legs': return '2 Legs RR';
            case 'cup': return 'Cup Tournament';
            default: return format;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading finished leagues...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">LEAGUES LOG</h1>
                    <p className="text-gray-500 font-medium">Archive of all completed tournaments</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search finished leagues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 p-1 glass bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
                    {[
                        { id: 'round_robin_1leg', label: '1 Leg RR' },
                        { id: 'round_robin_2legs', label: '2 Legs RR' },
                        { id: 'cup', label: 'Cups' }
                    ].map((format) => (
                        <button
                            key={format.id}
                            onClick={() => toggleFormat(format.id as LeagueFormat)}
                            className={`px-4 py-3 rounded-xl text-xs font-black tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${selectedFormats.includes(format.id as LeagueFormat)
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {selectedFormats.includes(format.id as LeagueFormat) && <CheckCircle className="w-3 h-3" />}
                            {format.label}
                        </button>
                    ))}
                </div>
            </div>

            {filteredLeagues.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                    <div className="p-6 glass rounded-full border border-purple-500/20 text-purple-400">
                        <Trophy className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black">NO FINISHED LEAGUES</h2>
                    <p className="text-gray-500">
                        {finishedLeagues.length === 0
                            ? "No leagues have been completed yet."
                            : "No leagues match your search filters."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeagues.map((league) => (
                        <div key={league.id} className="glass rounded-3xl border border-white/5 flex flex-col overflow-hidden hover:border-purple-500/30 transition-all group">
                            <div className="p-6 bg-gradient-to-br from-purple-600/10 to-transparent border-b border-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-600/20">
                                        <Trophy className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="px-3 py-1 glass rounded-lg border border-white/10 text-[10px] font-black uppercase text-gray-400">
                                        Finished
                                    </div>
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-1">{league.name}</h3>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{getFormatLabel(league.format)}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    <span className="font-bold">Ended: {league.finishedAt ? new Date(league.finishedAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    <span className="font-bold">{league.participantIds.length} Participants</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FinishedLeaguesLog;
