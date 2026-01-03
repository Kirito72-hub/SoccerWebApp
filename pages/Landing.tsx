import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, TrendingUp, Users, ArrowRight, Play } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/10 blur-[100px] rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">RAKLA</h1>
            <p className="text-xs text-purple-400 font-bold">Football Manager</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="bg-purple-600 hover:bg-purple-500 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 text-sm"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/20 text-purple-400 text-sm font-medium mb-8 animate-bounce">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          New: Real-time Notifications & PWA Support
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9] max-w-5xl">
          DOMINATE YOUR
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600 animate-gradient">
            FOOTBALL LEAGUE
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-12 leading-relaxed font-medium">
          Create and manage football leagues with ease. Track stats, organize tournaments,
          and compete with friends in round-robin or knockout cup formats.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button
            onClick={() => navigate('/auth')}
            className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-600/50"
          >
            GET STARTED FREE
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center justify-center gap-3 glass border border-white/10 px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/5 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            VIEW DEMO
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {/* Feature 1 */}
          <div className="glass p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group">
            <div className="w-14 h-14 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="font-black text-xl mb-2">Create Leagues</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Organize custom tournaments with round-robin or knockout formats
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group">
            <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="font-black text-xl mb-2">Track Performance</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Monitor detailed stats, rankings, and player achievements in real-time
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group">
            <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="font-black text-xl mb-2">Compete Together</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Join leagues, challenge friends, and climb the leaderboards
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl w-full">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
              100+
            </div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">
              Active Users
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
              50+
            </div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">
              Leagues Created
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-2">
              500+
            </div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">
              Matches Played
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 Rakla Football Manager. Built with ❤️ for football enthusiasts.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
