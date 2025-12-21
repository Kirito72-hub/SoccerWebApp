
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
  Bell
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Running Leagues', icon: Activity, path: '/leagues' },
    { name: 'Manage Leagues', icon: Trophy, path: '/manage' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0f0f23] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 glass border-r border-purple-900/30 flex flex-col h-full z-50`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight">RAKLA</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path 
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
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-96">
              <Search className="w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search matches or players..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-purple-400">Pro Manager</p>
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
    </div>
  );
};

export default Layout;
