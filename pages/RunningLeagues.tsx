
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Table as TableIcon, 
  Calendar, 
  ChevronRight, 
  Search,
  Filter,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Info
} from 'lucide-react';
import { User, League, Match, TableRow } from '../types';
import { storage } from '../services/storage';

interface RunningLeaguesProps {
  user: User;
}

const RunningLeagues: React.FC<RunningLeaguesProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'matches'>('table');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const allLeagues = storage.getLeagues().filter(l => l.participantIds.includes(user.id) && l.status === 'running');
    setLeagues(allLeagues);
    if (allLeagues.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(allLeagues[0].id);
    }
    setMatches(storage.getMatches());
    setUsers(storage.getUsers());
  }, [user.id, selectedLeagueId]);

  const selectedLeague = leagues.find(l => l.id === selectedLeagueId);
  const leagueMatches = matches.filter(m => m.leagueId === selectedLeagueId);

  // Fixed the missing useMemo import
  const tableData = useMemo(() => {
    if (!selectedLeague) return [];
    
    const rows: Record<string, TableRow> = {};
    selectedLeague.participantIds.forEach(pid => {
      const u = users.find(user => user.id === pid);
      rows[pid] = {
        userId: pid,
        username: u?.username || 'Unknown',
        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0
      };
    });

    leagueMatches.filter(m => m.status === 'completed').forEach(m => {
      const home = rows[m.homeUserId];
      const away = rows[m.awayUserId];
      if (!home || !away) return;

      home.played++;
      away.played++;
      home.gf += m.homeScore!;
      home.ga += m.awayScore!;
      away.gf += m.awayScore!;
      away.ga += m.homeScore!;

      if (m.homeScore! > m.awayScore!) {
        home.won++; home.points += 3;
        away.lost++;
      } else if (m.homeScore! < m.awayScore!) {
        away.won++; away.points += 3;
        home.lost++;
      } else {
        home.drawn++; home.points += 1;
        away.drawn++; away.points += 1;
      }
    });

    Object.values(rows).forEach(r => {
      r.gd = r.gf - r.ga;
    });

    return Object.values(rows).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  }, [selectedLeague, leagueMatches, users]);

  if (leagues.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="p-6 glass rounded-full border border-purple-500/20 text-purple-400">
           <LayoutGrid className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black">NO ACTIVE LEAGUES</h2>
        <p className="text-gray-500">You aren't participating in any running leagues right now.</p>
        <button className="px-6 py-3 bg-purple-600 rounded-2xl font-bold shadow-lg shadow-purple-600/20 hover:scale-105 transition-transform">
          Create New League
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <select 
              className="text-2xl font-black bg-transparent border-none focus:ring-0 p-0 cursor-pointer text-white appearance-none pr-8"
              value={selectedLeagueId || ''}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
            >
              {leagues.map(l => <option key={l.id} value={l.id} className="bg-[#1a1a2e]">{l.name.toUpperCase()}</option>)}
            </select>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-black mt-1">
              {selectedLeague?.format.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'table' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <TableIcon className="w-4 h-4" /> Table
          </button>
          <button 
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'matches' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Calendar className="w-4 h-4" /> Matches
          </button>
        </div>
      </div>

      {activeTab === 'table' ? (
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Team / Player</th>
                  <th className="px-6 py-4">P</th>
                  <th className="px-6 py-4">W</th>
                  <th className="px-6 py-4">D</th>
                  <th className="px-6 py-4">L</th>
                  <th className="px-6 py-4">GF</th>
                  <th className="px-6 py-4">GA</th>
                  <th className="px-6 py-4">GD</th>
                  <th className="px-6 py-4 text-purple-400">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableData.map((row, i) => (
                  <tr key={row.userId} className={`group hover:bg-white/5 transition-colors ${row.userId === user.id ? 'bg-purple-600/5' : ''}`}>
                    <td className="px-6 py-5">
                       <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black ${i < 3 ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-500'}`}>
                         {i + 1}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img src={`https://picsum.photos/seed/${row.userId}/40`} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                        <span className={`font-bold ${row.userId === user.id ? 'text-purple-400' : ''}`}>{row.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-400">{row.played}</td>
                    <td className="px-6 py-5 font-medium text-emerald-500">{row.won}</td>
                    <td className="px-6 py-5 font-medium text-blue-400">{row.drawn}</td>
                    <td className="px-6 py-5 font-medium text-red-500">{row.lost}</td>
                    <td className="px-6 py-5 font-medium text-gray-400">{row.gf}</td>
                    <td className="px-6 py-5 font-medium text-gray-400">{row.ga}</td>
                    <td className="px-6 py-5 font-medium text-gray-400">{row.gd}</td>
                    <td className="px-6 py-5 font-black text-white">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 bg-white/5 px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Filter by player name..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
            </div>
            <button className="px-6 py-3 glass border border-white/5 rounded-2xl text-sm font-bold flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leagueMatches.sort((a,b) => a.date - b.date).map((m, i) => {
              const home = users.find(u => u.id === m.homeUserId);
              const away = users.find(u => u.id === m.awayUserId);
              return (
                <div key={m.id} className="glass p-6 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all flex items-center justify-between group">
                  <div className="flex-1 flex flex-col items-center gap-2 text-center">
                    <img src={`https://picsum.photos/seed/${home?.id}/40`} className="w-12 h-12 rounded-full border-2 border-white/5 group-hover:border-purple-500/30 transition-all" alt="" />
                    <p className="text-sm font-bold truncate w-24">{home?.username}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 px-8">
                     {m.status === 'completed' ? (
                       <div className="flex items-center gap-4">
                         <span className="text-3xl font-black">{m.homeScore}</span>
                         <span className="text-gray-600 font-black text-xl">:</span>
                         <span className="text-3xl font-black">{m.awayScore}</span>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center gap-1">
                         <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-gray-500 flex items-center gap-1">
                           <Clock className="w-3 h-3" /> Pending
                         </div>
                         <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Round {m.round}</p>
                       </div>
                     )}
                     <p className="text-[10px] text-gray-600 font-medium">{new Date(m.date).toLocaleDateString()}</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-2 text-center">
                    <img src={`https://picsum.photos/seed/${away?.id}/40`} className="w-12 h-12 rounded-full border-2 border-white/5 group-hover:border-purple-500/30 transition-all" alt="" />
                    <p className="text-sm font-bold truncate w-24">{away?.username}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RunningLeagues;
