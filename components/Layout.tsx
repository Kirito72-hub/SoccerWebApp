
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Settings,
  User as UserIcon,
  Users,
  LogOut,
  Menu,
  X,
  Activity,
  Search,
  Bell,
  FileText,
  Target,
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react';
import { User, UserStats, Match } from '../types';
import { dataService } from '../services/dataService';
import { useNotificationSystem } from '../hooks/useNotificationSystem';
import { notificationStorage } from '../services/notificationStorage';
import { supabase } from '../services/supabase';
import NotificationCenter from './NotificationCenter';
import NotificationPermissionModal from './NotificationPermissionModal';
import NotificationPermissionManager from '../services/notificationPermissionManager';
import NotificationPreview from './NotificationPreview';
import NotificationPreferences from './NotificationPreferences';
import ToastNotification from './ToastNotification';
import { notificationSound } from '../services/notificationSound';
import { ToastNotificationData } from '../types/notifications';
import '../utils/notificationTest'; // Load diagnostic utility

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const UserStatsModal: React.FC<{ currentUser: User; selectedUser: User; onClose: () => void; allMatches: Match[]; allUsers: User[] }> = ({ currentUser, selectedUser, onClose, allMatches, allUsers }) => {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'compare'>('stats');

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const allLeagues = await dataService.getLeagues();
        setLeagues(allLeagues);
      } catch (error) {
        console.error('Error loading leagues:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLeagues();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="glass w-full max-w-4xl rounded-3xl p-8 border border-purple-500/30">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading stats...</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to calculate stats for a user
  const calculateUserStats = (user: User) => {
    const userMatches = allMatches.filter(m => m.homeUserId === user.id || m.awayUserId === user.id);
    const completedMatches = userMatches.filter(m => m.status === 'completed');

    const totalMatches = completedMatches.length;
    const goalsScored = completedMatches.reduce((sum, m) => {
      const isHome = m.homeUserId === user.id;
      return sum + (isHome ? (m.homeScore || 0) : (m.awayScore || 0));
    }, 0);
    const goalsConceded = completedMatches.reduce((sum, m) => {
      const isHome = m.homeUserId === user.id;
      return sum + (isHome ? (m.awayScore || 0) : (m.homeScore || 0));
    }, 0);
    const wins = completedMatches.filter(m => {
      const isHome = m.homeUserId === user.id;
      return isHome ? (m.homeScore! > m.awayScore!) : (m.awayScore! > m.homeScore!);
    }).length;
    const winRate = totalMatches ? Math.round((wins / totalMatches) * 100) : 0;

    // Calculate favorite and toughest opponent
    const opponentsMap = new Map<string, { wins: number, losses: number }>();
    completedMatches.forEach(m => {
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
    let maxWins = -1; // Initialize with -1 to handle cases where no wins/losses exist
    let maxLosses = -1;

    opponentsMap.forEach((val, key) => {
      if (val.wins > maxWins) {
        maxWins = val.wins;
        favOpp = allUsers.find(u => u.id === key)?.username || "Unknown";
      }
      if (val.losses > maxLosses) {
        maxLosses = val.losses;
        toughOpp = allUsers.find(u => u.id === key)?.username || "Unknown";
      }
    });

    const leaguesJoined = leagues.filter(league =>
      league.participantIds?.includes(user.id)
    ).length;

    const championships = leagues.filter(league => {
      if (league.status !== 'finished') return false;
      if (league.format?.includes('knockout') || league.format?.includes('cup')) {
        return league.winner === user.id;
      }
      if (!league.standings || league.standings.length === 0) return false;
      return league.standings[0].userId === user.id;
    }).length;

    return {
      totalMatches,
      goalsScored,
      goalsConceded,
      wins,
      winRate,
      favOpp,
      toughOpp,
      leaguesJoined,
      championships
    };
  };

  const selectedStats = calculateUserStats(selectedUser);
  const currentStats = calculateUserStats(currentUser);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="glass w-full max-w-4xl rounded-3xl p-6 sm:p-8 border border-purple-500/30 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src={selectedUser.avatar || `https://picsum.photos/seed/${selectedUser.id}/100`}
              alt={selectedUser.username}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-purple-600 shadow-lg shadow-purple-600/30"
            />
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{selectedUser.username}</h2>
              <p className="text-sm sm:text-base text-gray-400 font-medium">{selectedUser.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === 'stats'
              ? 'text-purple-400'
              : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Stats
            {activeTab === 'stats' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === 'compare'
              ? 'text-purple-400'
              : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Compare
            {activeTab === 'compare' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Total Matches</p>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedStats.totalMatches}</h3>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Leagues Joined</p>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedStats.leaguesJoined}</h3>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Goals Scored</p>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedStats.goalsScored}</h3>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Goals Taken</p>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedStats.goalsConceded}</h3>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Championships</p>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedStats.championships}</h3>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Win Rate</p>
              <h3 className="text-2xl sm:text-3xl font-black">{selectedStats.winRate}%</h3>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Activity className="w-4 h-4 text-orange-400" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Favorite Opponent</p>
              <h3 className="text-base sm:text-lg font-black truncate">{selectedStats.favOpp}</h3>
            </div>

            <div className="glass p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <Activity className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Toughest Rival</p>
              <h3 className="text-base sm:text-lg font-black truncate">{selectedStats.toughOpp}</h3>
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <img
                  src={currentUser.avatar || `https://picsum.photos/seed/${currentUser.id}/100`}
                  alt={currentUser.username}
                  className="w-16 h-16 rounded-full border-2 border-purple-600 mx-auto mb-2"
                />
                <p className="font-bold text-sm truncate">You</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-bold uppercase">VS</p>
              </div>
              <div className="text-center">
                <img
                  src={selectedUser.avatar || `https://picsum.photos/seed/${selectedUser.id}/100`}
                  alt={selectedUser.username}
                  className="w-16 h-16 rounded-full border-2 border-purple-600 mx-auto mb-2"
                />
                <p className="font-bold text-sm truncate">{selectedUser.username}</p>
              </div>
            </div>

            {/* Comparison Stats */}
            {[
              { label: 'Total Matches', key: 'totalMatches', icon: Activity, color: 'blue' },
              { label: 'Leagues Joined', key: 'leaguesJoined', icon: Users, color: 'purple' },
              { label: 'Goals Scored', key: 'goalsScored', icon: Target, color: 'emerald' },
              { label: 'Goals Conceded', key: 'goalsConceded', icon: ShieldCheck, color: 'red' },
              { label: 'Championships', key: 'championships', icon: Trophy, color: 'yellow' },
              { label: 'Win Rate', key: 'winRate', icon: Zap, color: 'indigo', suffix: '%' },
            ].map((stat) => {
              const currentValue = currentStats[stat.key as keyof typeof currentStats];
              const selectedValue = selectedStats[stat.key as keyof typeof selectedStats];
              const currentWins = currentValue > selectedValue;
              const tie = currentValue === selectedValue;

              return (
                <div key={stat.key} className="glass p-4 rounded-xl border border-white/5">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className={`text-center ${currentWins && !tie ? 'text-emerald-400' : tie ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p className="text-2xl font-black">{currentValue}{stat.suffix || ''}</p>
                    </div>
                    <div className="text-center">
                      <stat.icon className={`w-5 h-5 mx-auto mb-1 text-${stat.color}-400`} />
                      <p className="text-xs text-gray-500 font-bold uppercase">{stat.label}</p>
                    </div>
                    <div className={`text-center ${!currentWins && !tie ? 'text-emerald-400' : tie ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p className="text-2xl font-black">{selectedValue}{stat.suffix || ''}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  // Initialize Notification System
  useNotificationSystem(user);

  // Start sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedUserForStats, setSelectedUserForStats] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [toasts, setToasts] = useState<ToastNotificationData[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Update unread count with Realtime subscription
  useEffect(() => {
    const updateUnreadCount = async () => {
      const count = await notificationStorage.getUnreadCount(user.id);
      setUnreadCount(count);
      console.log('🔔 Unread count updated:', count);
    };

    const loadNotifications = async () => {
      const notifs = await notificationStorage.getNotifications(user.id);
      setNotifications(notifs);
    };

    updateUnreadCount();
    loadNotifications();

    // Subscribe to Realtime updates for notifications + Trigger System Notification
    const channel = supabase
      .channel('layout-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔔 Notification change detected:', payload.eventType);
          updateUnreadCount(); // Update count when notifications change
          loadNotifications(); // Reload notifications

          // If NEW notification received, trigger system notification + toast + sound
          if (payload.eventType === 'INSERT' && payload.new) {
            const newNotif = payload.new as any;
            console.log('📬 New notification received via Realtime:', newNotif.title);
            console.log('🔍 Notification permission:', Notification.permission);
            console.log('🔍 Service Worker controller:', navigator.serviceWorker.controller);

            // Show toast notification
            const toastData: ToastNotificationData = {
              id: newNotif.id,
              title: newNotif.title,
              message: newNotif.message,
              category: newNotif.category || 'system',
              priority: newNotif.priority || 'medium',
              action_url: newNotif.action_url,
              action_label: newNotif.action_label,
              duration: 5000
            };
            setToasts(prev => [...prev, toastData]);

            // Play notification sound
            await notificationSound.playNotification();

            // Trigger Service Worker notification
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              console.log('📤 Sending notification to Service Worker...');
              navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title: newNotif.title,
                options: {
                  body: newNotif.message,
                  icon: '/icons/pwa-192x192.png',
                  badge: '/icons/pwa-192x192.png',
                  tag: `notification-${newNotif.id}`,
                  data: {
                    url: window.location.origin,
                    type: newNotif.type
                  }
                }
              });
              console.log('✅ Notification message sent to Service Worker');
            } else {
              console.error('❌ Service Worker not available!');
              console.error('  - serviceWorker in navigator:', 'serviceWorker' in navigator);
              console.error('  - controller:', navigator.serviceWorker?.controller);
            }
          }
        }
      )
      .subscribe();

    // Also update every 10 seconds as fallback
    const interval = setInterval(updateUnreadCount, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user.id]);

  // Show notification permission modal on first load (PWA users only)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if running as PWA (standalone mode)
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true || // iOS
        document.referrer.includes('android-app://'); // Android

      // Only show for PWA users who haven't been asked before
      if (isPWA && !NotificationPermissionManager.hasRequestedBefore()) {
        console.log('📱 Showing notification permission modal (PWA user)...');
        setShowNotificationModal(true);
      } else if (!isPWA) {
        console.log('🌐 Skipping notification modal (not PWA)');
      }
    }, 2000); // Wait 2 seconds for UI to settle

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [users, matches] = await Promise.all([
        dataService.getUsers(),
        dataService.getMatches()
      ]);
      setAllUsers(users);
      setAllMatches(matches);
    } catch (error) {
      console.error('Error loading layout data:', error);
    }
  };

  const handleAcceptNotifications = async () => {
    setShowNotificationModal(false);
    try {
      await NotificationPermissionManager.initializePWA();
      console.log('✅ PWA initialized successfully');
    } catch (err) {
      console.error('Error initializing PWA:', err);
    }
  };

  const handleDeclineNotifications = () => {
    setShowNotificationModal(false);
    NotificationPermissionManager.markAsRequested();
    console.log('User declined notification permissions');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['superuser', 'pro_manager', 'normal_user'] },
    { name: 'Running Leagues', icon: Activity, path: '/leagues', roles: ['superuser', 'pro_manager', 'normal_user'] },
    { name: 'Manage Leagues', icon: Trophy, path: '/manage', roles: ['superuser', 'pro_manager'] },
    { name: 'Profile', icon: UserIcon, path: '/profile', roles: ['superuser', 'pro_manager', 'normal_user'] },
    { name: 'Activity Log', icon: FileText, path: '/log', roles: ['superuser'] },
    { name: 'Leagues Log', icon: Trophy, path: '/leagues-log', roles: ['superuser'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['superuser'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(u =>
      u.id !== user.id &&
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const handleUserClick = (selectedUser: User) => {
    setSelectedUserForStats(selectedUser);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <div className="flex h-screen bg-[#0f0f23] text-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 lg:w-${sidebarOpen ? '64' : '20'} transition-all duration-300 glass border-r border-purple-900/30 flex flex-col h-full z-50`}
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
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
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

      <main className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 glass border-b border-purple-900/20 z-40">
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Search - Now visible on all devices */}
            <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-white/10 w-full sm:w-48 md:w-64 lg:w-96 relative">
              <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm w-full placeholder-gray-600 outline-none"
              />

              {showSearchResults && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto z-50">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleUserClick(u)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-purple-600/20 transition-all text-left"
                    >
                      <img
                        src={u.avatar || `https://picsum.photos/seed/${u.id}/100`}
                        alt={u.username}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-purple-500/30 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-sm truncate">{u.username}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs lg:text-sm font-semibold truncate max-w-[100px] lg:max-w-none">{user.username}</p>
                <p className="text-[10px] lg:text-xs text-purple-400">
                  {user.role === 'superuser' ? 'Superuser' : user.role === 'pro_manager' ? 'Pro Manager' : 'Normal User'}
                </p>
              </div>
              <img
                src={user.avatar || `https://picsum.photos/seed/${user.id}/100`}
                alt="Avatar"
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-purple-600 p-0.5"
              />
            </div>
            <div className="relative"
              onMouseEnter={() => setShowPreview(true)}
              onMouseLeave={() => setShowPreview(false)}
            >
              <button
                onClick={() => setShowNotificationCenter(true)}
                className="relative p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />

                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse border-2 border-[#0f0f23]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Preview Dropdown */}
              <NotificationPreview
                notifications={notifications}
                onViewAll={() => {
                  setShowPreview(false);
                  setShowNotificationCenter(true);
                }}
                onMarkAsRead={async (id) => {
                  await notificationStorage.markAsRead(user.id, id);
                }}
                isOpen={showPreview}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>

      {selectedUserForStats && (
        <UserStatsModal
          currentUser={user}
          selectedUser={selectedUserForStats}
          onClose={() => setSelectedUserForStats(null)}
          allMatches={allMatches}
          allUsers={allUsers}
        />
      )}

      {showNotificationCenter && (
        <NotificationCenter
          userId={user.id}
          onClose={() => {
            setShowNotificationCenter(false);
            // Update unread count after closing
            notificationStorage.getUnreadCount(user.id).then(count => {
              setUnreadCount(count);
            });
          }}
        />
      )}

      {/* Notification Permission Modal */}
      {showNotificationModal && (
        <NotificationPermissionModal
          onAccept={handleAcceptNotifications}
          onDecline={handleDeclineNotifications}
        />
      )}

      {/* Notification Preferences Modal */}
      {showPreferences && (
        <NotificationPreferences
          userId={user.id}
          onClose={() => setShowPreferences(false)}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={(id) => {
              setToasts(prev => prev.filter(t => t.id !== id));
            }}
            onClick={() => {
              setShowNotificationCenter(true);
              setToasts(prev => prev.filter(t => t.id !== toast.id));
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Layout;
