
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Activity,
  Search,
  Bell,
  FileText,
  Target,
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react';
import { User, UserStats } from '../types';
import { storage } from '../services/storage';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedUserForStats, setSelectedUserForStats] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['superuser', 'pro_manager', 'normal_user'] },
    { name: 'Running Leagues', icon: Activity, path: '/leagues', roles: ['superuser', 'pro_manager', 'normal_user'] },
    { name: 'Manage Leagues', icon: Trophy, path: '/manage', roles: ['superuser', 'pro_manager'] },
    { name: 'Profile', icon: UserIcon, path: '/profile', roles: ['superuser', 'pro_manager', 'normal_user'] },
    { name: 'Activity Log', icon: FileText, path: '/log', roles: ['superuser'] },
    { name: 'Leagues Log', icon: Trophy, path: '/leagues-log', roles: ['superuser'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['superuser'] },
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  // Filter users based on search query
  const allUsers = storage.getUsers();
  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(u =>
      u.id !== user.id && // Exclude current user
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const handleUserClick = (selectedUser: User) => {
    setSelectedUserForStats(selectedUser);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const getUserStats = (userId: string): UserStats => {
    const stats = storage.getStats().find(s => s.userId === userId);
    return stats || {
      userId,
      matchesPlayed: 0,
      leaguesParticipated: 0,
      goalsScored: 0,
      goalsConceded: 0,
      championshipsWon: 0,
      updatedAt: Date.now()
    };
  };

  const calculateWinRate = (userId: string): number => {
    const allMatches = storage.getMatches().filter(m => m.status === 'completed');
    const userMatches = allMatches.filter(m => m.homeUserId === userId || m.awayUserId === userId);

    if (userMatches.length === 0) return 0;

    const wins = userMatches.filter(m => {
      const isHome = m.homeUserId === userId;
      return isHome ? (m.homeScore! > m.awayScore!) : (m.awayScore! > m.homeScore!);
    }).length;

    return Math.round((wins / userMatches.length) * 100);
  };

  return (
    <div className="flex h-screen bg-[#0f0f23] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } transition-all duration-300 glass border-r border-purple-900/30 flex flex-col h-full z-50`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight">RAKLA</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'hover:bg-white/5 text-gray-400'
                }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={() => {
              onLogout();
              navigate('/');
            }}
            className="flex items-center gap-4 w-full p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 glass border-b border-purple-900/20 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-96 relative">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search for players..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-gray-600 outline-none"
              />

              {/* Search Results Dropdown */}
              {showSearchResults && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleUserClick(u)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-purple-600/20 transition-all text-left"
                    >
                      <img
                        src={u.avatar || `https://picsum.photos/seed/${u.id}/100`}
                        alt={u.username}
                        className="w-10 h-10 rounded-full border-2 border-purple-500/30"
                      />
                      <div>
                        <p className="font-bold text-sm">{u.username}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-purple-400">
                  {user.role === 'superuser' ? 'Superuser' : user.role === 'pro_manager' ? 'Pro Manager' : 'Normal User'}
                </p>
              </div>
              <img
                src={user.avatar || `https://picsum.photos/seed/${user.id}/100`}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-purple-600 p-0.5"
              />
            </div>
            <button className="relative p-2 hover:bg-white/5 rounded-lg text-gray-400">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>

      {/* User Stats Modal */}
      {selectedUserForStats && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="glass w-full max-w-2xl rounded-3xl p-8 border border-purple-500/30 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUserForStats.avatar || `https://picsum.photos/seed/${selectedUserForStats.id}/100`}
                  alt={selectedUserForStats.username}
                  className="w-20 h-20 rounded-full border-4 border-purple-600 shadow-lg shadow-purple-600/30"
                />
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedUserForStats.username}</h2>
                  <p className="text-gray-400 font-medium">{selectedUserForStats.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForStats(null)}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stats Grid */}
            {(() => {
              const stats = getUserStats(selectedUserForStats.id);
              const winRate = calculateWinRate(selectedUserForStats.id);
              const goalDifference = stats.goalsScored - stats.goalsConceded;

              return (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Matches</p>
                    <h3 className="text-3xl font-black">{stats.matchesPlayed}</h3>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Trophy className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Leagues</p>
                    <h3 className="text-3xl font-black">{stats.leaguesParticipated}</h3>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-emerald-500/10 rounded-xl">
                        <Target className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Goals</p>
                    <h3 className="text-3xl font-black">{stats.goalsScored}</h3>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-red-500/10 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-red-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Conceded</p>
                    <h3 className="text-3xl font-black">{stats.goalsConceded}</h3>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Zap className="w-5 h-5 text-indigo-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Win Rate</p>
                    <h3 className="text-3xl font-black">{winRate}%</h3>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-yellow-500/10 rounded-xl">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Trophies</p>
                    <h3 className="text-3xl font-black">{stats.championshipsWon}</h3>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all col-span-2 md:col-span-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-cyan-500/10 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Goal Difference</p>
                    <h3 className={`text-3xl font-black ${goalDifference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {goalDifference >= 0 ? '+' : ''}{goalDifference}
                    </h3>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
