
import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Target,
  ShieldCheck,
  Activity,
  Star,
  Zap,
  Flame,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User, UserStats, Match } from '../types';
import { dataService } from '../services/dataService';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [userStats, matches, allUsers] = await Promise.all([
          dataService.getUserStats(user.id),
          dataService.getMatches(),
          dataService.getUsers()
        ]);

        setStats(userStats);
        setAllMatches(matches.filter(m => m.status === 'completed'));
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const userMatches = allMatches.filter(m => m.homeUserId === user.id || m.awayUserId === user.id);

  const winRate = stats?.matchesPlayed ? Math.round(((userMatches.filter(m => {
    const isHome = m.homeUserId === user.id;
    return isHome ? (m.homeScore! > m.awayScore!) : (m.awayScore! > m.homeScore!);
  }).length) / stats.matchesPlayed) * 100) : 0;

  // Calculate Fav/Toughest Opponent
  const opponentsMap = new Map<string, { wins: number, losses: number }>();
  userMatches.forEach(m => {
    const oppId = m.homeUserId === user.id ? m.awayUserId : m.homeUserId;
    const isHome = m.homeUserId === user.id;
    const won = isHome ? (m.homeScore! > m.awayScore!) : (m.awayScore! > m.homeScore!);
    const lost = isHome ? (m.homeScore! < m.awayScore!) : (m.awayScore! < m.homeScore!);

    const entry = opponentsMap.get(oppId) || { wins: 0, losses: 0 };
    if (won) entry.wins++;
    if (lost) entry.losses++;
    opponentsMap.set(oppId, entry);
  });

  let favOpp = "None";
  let toughOpp = "None";
  let maxWins = 0;
  let maxLosses = 0;

  opponentsMap.forEach((val, key) => {
    if (val.wins > maxWins) { maxWins = val.wins; favOpp = users.find(u => u.id === key)?.username || "Unknown"; }
    if (val.losses > maxLosses) { maxLosses = val.losses; toughOpp = users.find(u => u.id === key)?.username || "Unknown"; }
  });

  const statCards = [
    { title: 'Total Matches', value: stats?.matchesPlayed || 0, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Leagues Joined', value: stats?.leaguesParticipated || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Goals Scored', value: stats?.goalsScored || 0, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Goals Taken', value: stats?.goalsConceded || 0, icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'Championships', value: stats?.championshipsWon || 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Win Rate', value: `${winRate}%`, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { title: 'Favorite Opponent', value: favOpp, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'Toughest Rival', value: toughOpp, icon: Star, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  // Dummy chart data
  const chartData = [
    { name: 'Mon', goals: 2 },
    { name: 'Tue', goals: 4 },
    { name: 'Wed', goals: 1 },
    { name: 'Thu', goals: 5 },
    { name: 'Fri', goals: 3 },
    { name: 'Sat', goals: 8 },
    { name: 'Sun', goals: 6 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">DASHBOARD</h1>
          <p className="text-gray-500 font-medium">Welcome back, <span className="text-purple-400">@{user.username.split(' ')[0].toLowerCase()}</span></p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 glass border border-white/5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10">
            <TrendingUp className="w-4 h-4" /> Export Stats
          </button>
          <button className="px-4 py-2 bg-purple-600 rounded-xl text-sm font-bold shadow-lg shadow-purple-600/20 hover:scale-105 transition-transform">
            New League
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full blur-3xl -mr-12 -mt-12 group-hover:w-32 group-hover:h-32 transition-all`}></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-bold mb-1 relative z-10">{card.title.toUpperCase()}</p>
            <h3 className="text-3xl font-black tracking-tight relative z-10">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Performance Trend
            </h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Area type="monotone" dataKey="goals" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGoals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Activity
          </h3>
          <div className="space-y-6">
            {userMatches.slice(0, 4).map((match, i) => {
              const opponent = users.find(u => u.id === (match.homeUserId === user.id ? match.awayUserId : match.homeUserId));
              const won = match.homeUserId === user.id ? (match.homeScore! > match.awayScore!) : (match.awayScore! > match.homeScore!);
              return (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`w-2 h-10 rounded-full ${won ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">vs {opponent?.username}</p>
                    <p className="text-xs text-gray-500">{new Date(match.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-purple-400">{match.homeScore} - {match.awayScore}</p>
                    <p className="text-[10px] text-gray-600 uppercase font-black">{won ? 'Victory' : 'Defeat'}</p>
                  </div>
                </div>
              )
            })}
            {userMatches.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">No recent matches found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
