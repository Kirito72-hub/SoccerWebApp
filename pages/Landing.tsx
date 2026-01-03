import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, TrendingUp, Users, ArrowRight, Play } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-purple-600/20 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-emerald-600/10 blur-[100px] rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6 glass border-b border-white/5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">RAKLA</h1>
            <p className="text-[10px] md:text-xs text-purple-400 font-bold">Football Manager</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 text-xs md:text-sm"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass border border-purple-500/20 text-purple-400 text-xs md:text-sm font-medium mb-6 md:mb-8 animate-bounce">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          <span className="hidden sm:inline">New: Real-time Notifications & PWA Support</span>
          <span className="sm:hidden">PWA Support</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter mb-4 md:mb-6 leading-[0.9] max-w-5xl px-2">
          DOMINATE YOUR
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600 animate-gradient">
            FOOTBALL LEAGUE
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 mb-8 md:mb-12 leading-relaxed font-medium px-4">
          Create and manage football leagues with ease. Track stats, organize tournaments,
          and compete with friends in round-robin or knockout cup formats.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-12 md:mb-20 w-full max-w-md px-4 sm:px-0">
          <button
            onClick={() => navigate('/auth')}
            className="group relative flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 text-white px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-base lg:text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-600/50 w-full sm:w-auto whitespace-nowrap"
          >
            GET STARTED FREE
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center justify-center gap-2 md:gap-3 glass border border-white/10 px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-base lg:text-lg hover:bg-white/5 active:bg-white/10 transition-all w-full sm:w-auto whitespace-nowrap"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current flex-shrink-0" />
            VIEW DEMO
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl w-full px-4">
          {/* Feature 1 */}
          <div className="glass p-6 md:p-8 rounded-xl md:rounded-2xl border border-white/5 hover:border-purple-500/30 active:border-purple-500/50 transition-all group">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-600/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
              </div>
              <h3 className="font-black text-lg md:text-xl whitespace-nowrap">Create Leagues</h3>
            </div>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              Organize custom tournaments with round-robin or knockout formats
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass p-6 md:p-8 rounded-xl md:rounded-2xl border border-white/5 hover:border-purple-500/30 active:border-purple-500/50 transition-all group">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
              </div>
              <h3 className="font-black text-lg md:text-xl whitespace-nowrap">Track Performance</h3>
            </div>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              Monitor detailed stats, rankings, and player achievements in real-time
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass p-6 md:p-8 rounded-xl md:rounded-2xl border border-white/5 hover:border-purple-500/30 active:border-purple-500/50 transition-all group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-600/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
              </div>
              <h3 className="font-black text-lg md:text-xl whitespace-nowrap">Compete Together</h3>
            </div>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              Join leagues, challenge friends, and climb the leaderboards
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 md:mt-20 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl w-full px-4">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-1 md:mb-2">
              100+
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider">
              Active Users
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1 md:mb-2">
              50+
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider">
              Leagues
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-1 md:mb-2">
              500+
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider">
              Matches
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 md:py-8 px-4 md:px-6 text-center">
        <p className="text-gray-500 text-xs md:text-sm">
          © 2026 Rakla Football Manager. Built with ❤️ for football enthusiasts.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
