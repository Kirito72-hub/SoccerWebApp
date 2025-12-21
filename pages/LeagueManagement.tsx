
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Users, 
  CheckCircle, 
  PlusCircle, 
  X,
  Trophy,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { User, League, Match, LeagueFormat } from '../types';
import { storage } from '../services/storage';
import { generateFixtures } from '../services/fixtures';

interface LeagueManagementProps {
  user: User;
}

const LeagueManagement: React.FC<LeagueManagementProps> = ({ user }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Form State
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newFormat, setNewFormat] = useState<LeagueFormat>('round_robin_1leg');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([user.id]);
  
  const [scoreHome, setScoreHome] = useState<number>(0);
  const [scoreAway, setScoreAway] = useState<number>(0);

  useEffect(() => {
    setLeagues(storage.getLeagues().filter(l => l.adminId === user.id));
    setAllUsers(storage.getUsers());
  }, [user.id]);

  const handleCreateLeague = () => {
    if (!newLeagueName || selectedParticipants.length < 2) return;
    
    const newLeague: League = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLeagueName,
      adminId: user.id,
      format: newFormat,
      status: 'running',
      participantIds: selectedParticipants,
      createdAt: Date.now()
    };

    const fixtures = generateFixtures(newLeague.id, selectedParticipants, newFormat);
    const matches: Match[] = fixtures.map(f => ({
      ...f,
      id: Math.random().toString(36).substr(2, 9),
    }));

    const currentLeagues = storage.getLeagues();
    const currentMatches = storage.getMatches();

    storage.saveLeagues([...currentLeagues, newLeague]);
    storage.saveMatches([...currentMatches, ...matches]);

    setLeagues([...leagues, newLeague]);
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewLeagueName('');
    setNewFormat('round_robin_1leg');
    setSelectedParticipants([user.id]);
  };

  const handleSaveResult = () => {
    if (!selectedMatch) return;

    const allMatches = storage.getMatches();
    const updatedMatches = allMatches.map(m => 
      m.id === selectedMatch.id 
      ? { ...m, homeScore: scoreHome, awayScore: scoreAway, status: 'completed' as const } 
      : m
    );

    storage.saveMatches(updatedMatches);
    setShowResultModal(false);
    setSelectedMatch(null);
  };

  const handleDeleteLeague = (id: string) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      const currentLeagues = storage.getLeagues().filter(l => l.id !== id);
      const currentMatches = storage.getMatches().filter(m => m.leagueId !== id);
      storage.saveLeagues(currentLeagues);
      storage.saveMatches(currentMatches);
      setLeagues(leagues.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">MANAGEMENT</h1>
          <p className="text-gray-500 font-medium">Create and oversee your custom leagues</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> CREATE LEAGUE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map(l => (
          <div key={l.id} className="glass rounded-3xl border border-white/5 flex flex-col h-full hover:border-purple-500/30 transition-all overflow-hidden group">
            <div className="p-6 bg-gradient-to-br from-purple-600/10 to-transparent border-b border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-600/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteLeague(l.id)} className="p-2 glass border border-white/5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 glass border border-white/5 rounded-lg text-gray-400 hover:bg-white/10 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black tracking-tight mb-1">{l.name.toUpperCase()}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{l.format.replace(/_/g, ' ')}</p>
            </div>
            
            <div className="p-6 flex-1 space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-gray-400">
                   <Users className="w-4 h-4" />
                   <span className="text-sm font-bold">{l.participantIds.length} Participants</span>
                 </div>
                 <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${l.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                   {l.status}
                 </span>
               </div>

               <div className="space-y-3">
                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Upcoming Action</p>
                 {storage.getMatches().filter(m => m.leagueId === l.id && m.status === 'pending').slice(0, 3).map(m => {
                   const h = allUsers.find(u => u.id === m.homeUserId);
                   const a = allUsers.find(u => u.id === m.awayUserId);
                   return (
                     <div key={m.id} className="flex items-center justify-between p-3 glass border border-white/5 rounded-xl group/match hover:border-purple-500/30 transition-all">
                       <span className="text-xs font-bold truncate w-20">{h?.username} vs {a?.username}</span>
                       <button 
                        onClick={() => { setSelectedMatch(m); setShowResultModal(true); }}
                        className="text-[10px] font-black text-purple-400 hover:text-purple-300 flex items-center gap-1"
                       >
                         ADD RESULT <ChevronRight className="w-3 h-3" />
                       </button>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-2xl rounded-3xl p-8 border border-purple-500/30 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tight">NEW LEAGUE</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">League Name</label>
                <input 
                  type="text" 
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                  placeholder="The Champions Invitational"
                  className="w-full glass bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-600 outline-none transition-all font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Format</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'round_robin_1leg', label: '1 Leg RR' },
                    { id: 'round_robin_2legs', label: '2 Legs RR' },
                    { id: 'cup', label: 'Cup Style' }
                  ].map(f => (
                    <button 
                      key={f.id}
                      onClick={() => setNewFormat(f.id as LeagueFormat)}
                      className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${newFormat === f.id ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' : 'glass border-white/5 text-gray-400 hover:bg-white/5'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Participants</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {allUsers.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => {
                        if (u.id === user.id) return;
                        setSelectedParticipants(prev => prev.includes(u.id) ? prev.filter(pid => pid !== u.id) : [...prev, u.id]);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedParticipants.includes(u.id) ? 'bg-purple-600/20 border-purple-500/50 text-purple-200' : 'glass border-white/5 text-gray-500'}`}
                    >
                      <img src={u.avatar} className="w-8 h-8 rounded-full" />
                      <span className="text-xs font-bold">{u.username}</span>
                      {selectedParticipants.includes(u.id) && <CheckCircle className="ml-auto w-4 h-4 text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleCreateLeague}
                disabled={!newLeagueName || selectedParticipants.length < 2}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-purple-600/20 transition-all"
              >
                LAUNCH LEAGUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && selectedMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg rounded-3xl p-8 border border-purple-500/30 animate-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tight">ADD RESULT</h2>
                <button onClick={() => setShowResultModal(false)} className="text-gray-400">
                  <X className="w-6 h-6" />
                </button>
             </div>

             <div className="flex items-center justify-between mb-10">
                <div className="flex-1 flex flex-col items-center gap-4">
                  <img src={`https://picsum.photos/seed/${selectedMatch.homeUserId}/80`} className="w-20 h-20 rounded-full border-2 border-purple-600" />
                  <p className="font-black text-center">{allUsers.find(u => u.id === selectedMatch.homeUserId)?.username}</p>
                </div>
                <div className="flex items-center gap-4">
                   <input 
                    type="number" 
                    value={scoreHome}
                    onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
                    className="w-16 h-16 glass text-center text-2xl font-black rounded-2xl border-purple-500/30 outline-none focus:border-purple-500"
                   />
                   <span className="text-2xl font-black text-gray-600">:</span>
                   <input 
                    type="number" 
                    value={scoreAway}
                    onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
                    className="w-16 h-16 glass text-center text-2xl font-black rounded-2xl border-purple-500/30 outline-none focus:border-purple-500"
                   />
                </div>
                <div className="flex-1 flex flex-col items-center gap-4">
                  <img src={`https://picsum.photos/seed/${selectedMatch.awayUserId}/80`} className="w-20 h-20 rounded-full border-2 border-purple-600" />
                  <p className="font-black text-center">{allUsers.find(u => u.id === selectedMatch.awayUserId)?.username}</p>
                </div>
             </div>

             <button 
              onClick={handleSaveResult}
              className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-emerald-600/20 transition-all"
             >
               SAVE FINAL SCORE
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueManagement;
