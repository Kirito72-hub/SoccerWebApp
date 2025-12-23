
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
  UserPlus,
  Wifi
} from 'lucide-react';
import { User, League, Match, LeagueFormat } from '../types';
import { dataService } from '../services/dataService';
import { generateFixtures } from '../services/fixtures';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { getAvatarByUserId } from '../utils/avatarUtils';

interface LeagueManagementProps {
  user: User;
}

const LeagueManagement: React.FC<LeagueManagementProps> = ({ user }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newFormat, setNewFormat] = useState<LeagueFormat>('round_robin_1leg');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([user.id]);

  const [scoreHome, setScoreHome] = useState<number>(0);
  const [scoreAway, setScoreAway] = useState<number>(0);
  const [leagueToDelete, setLeagueToDelete] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [flashLeagueId, setFlashLeagueId] = useState<string | null>(null);
  const [flashMatchId, setFlashMatchId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user.id, user.role]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allLeagues, users, matches] = await Promise.all([
        dataService.getLeagues(),
        dataService.getUsers(),
        dataService.getMatches()
      ]);

      const runningLeagues = allLeagues.filter(l => l.status === 'running');

      if (user.role === 'superuser' || user.role === 'pro_manager') {
        setLeagues(runningLeagues);
      } else {
        setLeagues(runningLeagues.filter(l => l.adminId === user.id));
      }

      setAllUsers(users);
      setAllMatches(matches);
      setRealtimeConnected(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription for leagues
  useRealtimeSubscription({
    table: 'leagues',
    event: '*',
    enabled: dataService.isOnline() && !loading,
    onInsert: (newLeague) => {
      const league: League = {
        id: newLeague.id,
        name: newLeague.name,
        adminId: newLeague.admin_id,
        format: newLeague.format,
        status: newLeague.status,
        participantIds: newLeague.participant_ids || [],
        createdAt: new Date(newLeague.created_at).getTime(),
        finishedAt: newLeague.finished_at ? new Date(newLeague.finished_at).getTime() : undefined
      };

      // Only add if user has permission to see it
      if (league.status === 'running') {
        const canSeeLeague =
          user.role === 'superuser' ||
          user.role === 'pro_manager' ||
          league.adminId === user.id ||
          league.participantIds.includes(user.id); // FIXED: Check if user is a participant!

        if (canSeeLeague) {
          setLeagues(prev => [...prev, league]);
          setFlashLeagueId(league.id);
          setTimeout(() => setFlashLeagueId(null), 2000);
        }
      }
    },
    onUpdate: (updatedLeague) => {
      setLeagues(prev =>
        prev.map(l => {
          if (l.id === updatedLeague.id) {
            setFlashLeagueId(updatedLeague.id);
            setTimeout(() => setFlashLeagueId(null), 2000);

            return {
              ...l,
              name: updatedLeague.name,
              status: updatedLeague.status,
              participantIds: updatedLeague.participant_ids || l.participantIds,
              finishedAt: updatedLeague.finished_at ? new Date(updatedLeague.finished_at).getTime() : undefined
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

  // Realtime subscription for matches
  useRealtimeSubscription({
    table: 'matches',
    event: '*',
    enabled: dataService.isOnline() && !loading,
    onUpdate: (updatedMatch) => {
      setAllMatches(prev =>
        prev.map(m => {
          if (m.id === updatedMatch.id) {
            setFlashMatchId(updatedMatch.id);
            setTimeout(() => setFlashMatchId(null), 2000);

            return {
              ...m,
              homeScore: updatedMatch.home_score,
              awayScore: updatedMatch.away_score,
              status: updatedMatch.status
            };
          }
          return m;
        })
      );
    }
  });

  const handleCreateLeague = async () => {
    if (!newLeagueName || selectedParticipants.length < 2) return;

    try {
      const newLeague = await dataService.createLeague({
        name: newLeagueName,
        adminId: user.id,
        format: newFormat,
        status: 'running',
        participantIds: selectedParticipants,
        createdAt: Date.now()
      });

      const fixtures = generateFixtures(newLeague.id, selectedParticipants, newFormat);

      // Create all matches for the league
      for (const fixture of fixtures) {
        await dataService.createMatch({
          ...fixture,
          leagueId: newLeague.id
        });
      }

      // Add activity log
      await dataService.createActivityLog({
        type: 'league_created',
        userId: user.id,
        username: user.username,
        description: `Created a new league "${newLeagueName}" with ${selectedParticipants.length} participants`,
        metadata: {
          leagueId: newLeague.id,
          leagueName: newLeagueName
        }
      });

      // Reload data
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating league:', error);
    }
  };

  const resetForm = () => {
    setNewLeagueName('');
    setNewFormat('round_robin_1leg');
    setSelectedParticipants([user.id]);
  };

  const handleSaveResult = async () => {
    if (!selectedMatch) return;

    try {
      await dataService.updateMatch(selectedMatch.id, {
        homeScore: scoreHome,
        awayScore: scoreAway,
        status: 'completed'
      });

      // Reload matches
      const matches = await dataService.getMatches();
      setAllMatches(matches);

      setShowResultModal(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const handleDeleteLeague = (id: string) => {
    setLeagueToDelete(id);
  };

  const confirmDelete = async () => {
    if (!leagueToDelete) return;

    try {
      const id = leagueToDelete;
      const leagueToDeleteObj = leagues.find(l => l.id === id);
      if (!leagueToDeleteObj) return;

      // Delete league (this will cascade delete matches due to foreign key)
      await dataService.deleteLeague(id);

      // Only log if deletion succeeded (no error thrown above)
      await dataService.createActivityLog({
        type: 'league_deleted',
        userId: user.id,
        username: user.username,
        description: `Deleted league "${leagueToDeleteObj.name}"`,
        timestamp: Date.now(),
        metadata: {
          leagueId: id,
          leagueName: leagueToDeleteObj.name
        }
      });

      // Reload data
      await loadData();
      setLeagueToDelete(null);
    } catch (error) {
      console.error('Error deleting league:', error);
      // Show error to user
      alert('Failed to delete league. You may not have permission to delete this league.');
      setLeagueToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leagues...</p>
        </div>
      </div>
    );
  }

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

      {leagues.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="p-6 glass rounded-full border border-purple-500/20 text-purple-400">
            <Trophy className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black">NO RUNNING LEAGUES</h2>
          <p className="text-gray-500">Create your first league to get started!</p>
        </div>
      ) : (
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{l.format.replace(/_/g, ' ')}</span>
                  <span className="text-gray-600">•</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${l.adminId === user.id ? 'text-purple-400' : 'text-blue-400'}`}>
                    Admin: {l.adminId === user.id ? 'YOU' : allUsers.find(u => u.id === l.adminId)?.username || 'Unknown'}
                  </span>
                </div>
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
                  {allMatches.filter(m => m.leagueId === l.id && m.status === 'pending').slice(0, 3).map(m => {
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
      )}

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

      {/* Delete Confirmation Modal */}
      {leagueToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md rounded-3xl p-8 border border-red-500/30 animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight mb-2">DELETE LEAGUE?</h2>
                <p className="text-gray-400 font-medium">
                  Are you sure you want to delete <span className="text-white font-bold">"{leagues.find(l => l.id === leagueToDelete)?.name}"</span>?
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setLeagueToDelete(null)}
                  className="flex-1 glass border-white/10 hover:bg-white/5 py-4 rounded-2xl font-black text-sm transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-2xl font-black text-sm shadow-xl shadow-red-600/20 transition-all"
                >
                  YES, DELETE IT
                </button>
              </div>
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
                <img src={getAvatarByUserId(selectedMatch.homeUserId, allUsers)} className="w-20 h-20 rounded-full border-2 border-purple-600" />
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
                <img src={getAvatarByUserId(selectedMatch.awayUserId, allUsers)} className="w-20 h-20 rounded-full border-2 border-purple-600" />
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
