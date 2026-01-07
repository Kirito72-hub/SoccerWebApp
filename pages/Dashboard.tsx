
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { usePageVisibility } from '../hooks/usePageVisibility';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isVisible = usePageVisibility();

  const loadData = async () => {
    try {
      setLoading(true);
      const [userStats, matches, allUsers, allLeagues] = await Promise.all([
        dataService.getUserStats(user.id),
        dataService.getMatches(),
        dataService.getUsers(),
        dataService.getLeagues()
      ]);

      setStats(userStats);
      setAllMatches(matches.filter(m => m.status === 'completed'));
      setUsers(allUsers);
      setLeagues(allLeagues);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Reload data when app becomes visible (important for mobile)
  useEffect(() => {
    if (isVisible && !loading) {
      console.log('[Dashboard] App became visible, reloading data...');
      loadData();
    }
  }, [isVisible]);

  // Realtime subscription for matches
  useRealtimeSubscription({
    table: 'matches',
    event: '*',
    enabled: dataService.isOnline() && !loading,
    onInsert: (newMatch) => {
      const match: Match = {
        id: newMatch.id,
        leagueId: newMatch.league_id,
        homeUserId: newMatch.home_user_id,
        awayUserId: newMatch.away_user_id,
        homeScore: newMatch.home_score,
        awayScore: newMatch.away_score,
        status: newMatch.status,
        date: new Date(newMatch.date).getTime(),
        round: newMatch.round
      };
      if (match.status === 'completed') {
        setAllMatches(prev => [...prev, match]);
      }
    },
    onUpdate: (updatedMatch) => {
      setAllMatches(prev =>
        prev.map(m => {
          if (m.id === updatedMatch.id) {
            return {
              ...m,
              homeScore: updatedMatch.home_score,
              awayScore: updatedMatch.away_score,
              status: updatedMatch.status
            };
          }
          return m;
        }).filter(m => m.status === 'completed')
      );
    },
    onDelete: (deletedMatch) => {
      setAllMatches(prev => prev.filter(m => m.id !== deletedMatch.id));
    }
  });

  // Realtime subscription for leagues
  useRealtimeSubscription({
    table: 'leagues',
    event: '*',
    enabled: dataService.isOnline() && !loading,
    onInsert: (newLeague) => {
      const league = {
        id: newLeague.id,
        name: newLeague.name,
        adminId: newLeague.admin_id,
        format: newLeague.format,
        status: newLeague.status,
        participantIds: newLeague.participant_ids || [],
        createdAt: new Date(newLeague.created_at).getTime(),
        finishedAt: newLeague.finished_at ? new Date(newLeague.finished_at).getTime() : undefined,
        winner: newLeague.winner || null,
        standings: newLeague.standings || undefined
      };
      setLeagues(prev => [...prev, league]);
    },
    onUpdate: (updatedLeague) => {
      setLeagues(prev =>
        prev.map(l => {
          if (l.id === updatedLeague.id) {
            return {
              ...l,
              name: updatedLeague.name,
              status: updatedLeague.status,
              participantIds: updatedLeague.participant_ids || l.participantIds,
              finishedAt: updatedLeague.finished_at ? new Date(updatedLeague.finished_at).getTime() : undefined,
              winner: updatedLeague.winner || null,
              standings: updatedLeague.standings || undefined
            };
          }
          return l;
        })
      );
    },
    onDelete: (deletedLeague) => {
      setLeagues(prev => prev.filter(l => l.id !== deletedLeague.id));
    }
  });

  const userMatches = allMatches.filter(m => m.homeUserId === user.id || m.awayUserId === user.id);

  // Calculate all stats from matches
  const totalMatches = userMatches.length;
  const goalsScored = userMatches.reduce((sum, m) => {
    const isHome = m.homeUserId === user.id;
    return sum + (isHome ? (m.homeScore || 0) : (m.awayScore || 0));
  }, 0);
  const goalsConceded = userMatches.reduce((sum, m) => {
    const isHome = m.homeUserId === user.id;
    return sum + (isHome ? (m.awayScore || 0) : (m.homeScore || 0));
  }, 0);
  const wins = userMatches.filter(m => {
    const isHome = m.homeUserId === user.id;
    return isHome ? (m.homeScore! > m.awayScore!) : (m.awayScore! > m.homeScore!);
  }).length;
  const winRate = totalMatches ? Math.round((wins / totalMatches) * 100) : 0;

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

  // Calculate leagues joined (where user is in participant_ids)
  const leaguesJoined = leagues.filter(league =>
    league.participantIds?.includes(user.id)
  ).length;

  // Calculate championships (finished leagues/cups where user won 1st place)
  const championships = leagues.filter(league => {
    // Only finished leagues/cups
    if (league.status !== 'finished') return false;

    // For knockout/cup format - check winner field
    if (league.format?.includes('knockout') || league.format?.includes('cup')) {
      return league.winner === user.id;
    }

    // For round-robin (league) format - check standings for 1st place
    if (!league.standings || league.standings.length === 0) return false;
    return league.standings[0].userId === user.id;
  }).length;

  const statCards = [
    { title: 'Total Matches', value: totalMatches, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Leagues Joined', value: leaguesJoined, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Goals Scored', value: goalsScored, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Goals Taken', value: goalsConceded, icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'Championships', value: championships, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Win Rate', value: `${winRate}%`, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { title: 'Favorite Opponent', value: favOpp, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'Toughest Rival', value: toughOpp, icon: Star, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  // Calculate performance from real match data (last 7 days)
  const chartData = useMemo(() => {
    const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentMatches = userMatches.filter(m => m.date >= last7Days && m.status === 'completed');

    // Initialize last 7 days with day names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const last7DaysData = [];

    // Create array for last 7 days (oldest to newest)
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      const date = Date.now() - (i * 24 * 60 * 60 * 1000);
      last7DaysData.push({
        name: days[dayIndex],
        goals: 0,
        date: date,
        dayOfWeek: dayIndex
      });
    }

    // Add goals from actual matches
    recentMatches.forEach(match => {
      const matchDate = new Date(match.date);
      const matchDay = matchDate.getDay();

      // Find the corresponding day in our last 7 days
      const dayData = last7DaysData.find(d => {
        const dDate = new Date(d.date);
        return dDate.toDateString() === matchDate.toDateString();
      });

      if (dayData) {
        const isHome = match.homeUserId === user.id;
        const userGoals = isHome ? (match.homeScore || 0) : (match.awayScore || 0);
        dayData.goals += userGoals;
      }
    });

    // Return only name and goals for the chart
    return last7DaysData.map(({ name, goals }) => ({ name, goals }));
  }, [userMatches, user.id]);

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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-3 lg:gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">DASHBOARD</h1>
          <p className="text-sm lg:text-base text-gray-500 font-medium">Welcome back, <span className="text-purple-400">@{user.username.split(' ')[0].toLowerCase()}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 lg:px-4 py-2 glass border border-white/5 rounded-xl text-xs lg:text-sm font-bold flex items-center gap-2 hover:bg-white/10">
            <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" /> Export Stats
          </button>
          <button
            onClick={() => navigate('/manage')}
            className="px-3 lg:px-4 py-2 bg-purple-600 rounded-xl text-xs lg:text-sm font-bold shadow-lg shadow-purple-600/20 hover:scale-105 transition-transform"
          >
            New League
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="glass p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 lg:w-24 lg:h-24 ${card.bg} rounded-full blur-3xl -mr-8 lg:-mr-12 -mt-8 lg:-mt-12 group-hover:w-20 group-hover:h-20 lg:group-hover:w-32 lg:group-hover:h-32 transition-all`}></div>
            <div className="flex items-start justify-between mb-3 lg:mb-4 relative z-10">
              <div className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon className="w-4 h-4 lg:w-6 lg:h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] lg:text-sm font-bold mb-1 relative z-10">{card.title.toUpperCase()}</p>
            <h3 className="text-xl lg:text-3xl font-black tracking-tight relative z-10 truncate">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 glass p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-8 gap-3">
            <h3 className="font-bold text-base lg:text-lg flex items-center gap-2">
              <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              Performance Trend
            </h3>
            <select className="glass border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none w-full sm:w-auto focus:border-purple-500/50 transition-colors cursor-pointer [&>option]:bg-[#1a1a2e] [&>option]:text-white">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Area type="monotone" dataKey="goals" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorGoals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/5">
          <h3 className="font-bold text-base lg:text-lg mb-4 lg:mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
            Quick Activity
          </h3>
          <div className="space-y-4 lg:space-y-6">
            {userMatches.slice(0, 4).map((match, i) => {
              const opponent = users.find(u => u.id === (match.homeUserId === user.id ? match.awayUserId : match.homeUserId));
              const won = match.homeUserId === user.id ? (match.homeScore! > match.awayScore!) : (match.awayScore! > match.homeScore!);
              return (
                <div key={i} className="flex items-center gap-3 lg:gap-4 group">
                  <div className={`w-1.5 lg:w-2 h-8 lg:h-10 rounded-full ${won ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-bold truncate">vs {opponent?.username}</p>
                    <p className="text-[10px] lg:text-xs text-gray-500">{new Date(match.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs lg:text-sm font-black text-purple-400">{match.homeScore} - {match.awayScore}</p>
                    <p className="text-[8px] lg:text-[10px] text-gray-600 uppercase font-black">{won ? 'Victory' : 'Defeat'}</p>
                  </div>
                </div>
              )
            })}
            {userMatches.length === 0 && (
              <div className="text-center py-8 lg:py-10">
                <p className="text-gray-500 text-xs lg:text-sm">No recent matches found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
