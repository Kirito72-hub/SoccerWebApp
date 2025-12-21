
import React, { useState } from 'react';
import { Trophy, ChevronRight, Play } from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';

interface LandingProps {
  onLogin: (user: User) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);

  const mockUsers = storage.getUsers();

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-[#0f0f23]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-10 py-6 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <Trophy className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-black tracking-tighter text-white">RAKLA</span>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          <a href="#" className="text-sm font-medium hover:text-purple-400 transition-colors">Features</a>
          <a href="#" className="text-sm font-medium hover:text-purple-400 transition-colors">Pricing</a>
          <a href="#" className="text-sm font-medium hover:text-purple-400 transition-colors">Community</a>
        </nav>
        <button 
          onClick={() => setShowLogin(true)}
          className="bg-purple-600 hover:bg-purple-500 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20"
        >
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/20 text-purple-400 text-sm font-medium mb-8 animate-bounce">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          New: Knockout Tournaments Now Available
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
          DOMINATE YOUR<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600">
            FOOTBALL LEAGUE
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 mb-10 leading-relaxed font-medium">
          Create and manage football leagues with ease. Track stats, organize tournaments, and compete with friends in round-robin or knockout cup formats.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => onLogin(mockUsers[0])}
            className="group relative flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black text-lg transition-transform hover:scale-105 active:scale-95"
          >
            CREATE LEAGUE NOW
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center gap-3 glass border border-white/10 px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/5 transition-all">
            <Play className="w-5 h-5 fill-current" />
            WATCH DEMO
          </button>
        </div>

        {/* Floating Stats Visual */}
        <div className="mt-20 flex gap-4 overflow-hidden mask-fade opacity-50">
           {/* Mock icons/avatars to fill space */}
           {[1,2,3,4,5,6,7,8].map(i => (
             <div key={i} className="w-16 h-16 rounded-full glass border border-white/10 flex-shrink-0 animate-pulse"></div>
           ))}
        </div>
      </main>

      {/* Login Modal Simulation */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md rounded-3xl p-8 border border-purple-500/30">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Choose a Manager</h2>
              <button onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {mockUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => onLogin(user)}
                  className="w-full flex items-center gap-4 p-4 glass hover:bg-white/10 rounded-2xl border border-white/5 transition-all group text-left"
                >
                  <img src={user.avatar} alt="" className="w-12 h-12 rounded-full border border-purple-500" />
                  <div>
                    <p className="font-bold">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ChevronRight className="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Local X component for easy reference
const X = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default Landing;
