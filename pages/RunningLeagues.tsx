
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
  Info,
  X,
  Save,
  GitBranch
} from 'lucide-react';
import { User, League, Match, TableRow } from '../types';
import { dataService } from '../services/dataService';
import { getAvatarByUserId } from '../utils/avatarUtils';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { usePageVisibility } from '../hooks/usePageVisibility';

interface RunningLeaguesProps {
  user: User;
}

const RunningLeagues: React.FC<RunningLeaguesProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'matches' | 'bracket'>('matches');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const isVisible = usePageVisibility();

  // Modal state for editing match results
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Reload data when app becomes visible (important for mobile)
  useEffect(() => {
    if (isVisible && !loading) {
      console.log('[RunningLeagues] App became visible, reloading data...');
      loadData();
    }
  }, [isVisible]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allLeagues, allMatches, allUsers] = await Promise.all([
        dataService.getLeagues(),
        dataService.getMatches(),
        dataService.getUsers()
      ]);

      const userLeagues = allLeagues.filter(
        l => l.participantIds.includes(user.id) && l.status === 'running'
      );

      setLeagues(userLeagues);
      if (userLeagues.length > 0 && !selectedLeagueId) {
        setSelectedLeagueId(userLeagues[0].id);
      }
      setMatches(allMatches);
      setUsers(allUsers);
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

      // Only add if user is a participant and league is running
      if (league.status === 'running' && league.participantIds.includes(user.id)) {
        setLeagues(prev => [...prev, league]);
      }
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

  // Realtime subscription for matches
  useRealtimeSubscription({
    table: 'matches',
    event: '*',
    enabled: dataService.isOnline() && !loading,
    onUpdate: (updatedMatch) => {
      setMatches(prev =>
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
        })
      );
    }
  });

  const selectedLeague = leagues.find(l => l.id === selectedLeagueId);
  const leagueMatches = matches.filter(m => m.leagueId === selectedLeagueId);

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

  const handleMatchClick = (match: Match) => {
    if (user.role === 'normal_user') return;

    setEditingMatch(match);
    if (match.status === 'completed') {
      setHomeScore(match.homeScore || 0);
      setAwayScore(match.awayScore || 0);
    } else {
      setHomeScore(0);
      setAwayScore(0);
    }
  };

  const handleSaveResult = async () => {
    if (!editingMatch || !selectedLeague) return;

    try {
      setSaving(true);

      // Update match
      await dataService.updateMatch(editingMatch.id, {
        homeScore,
        awayScore,
        status: 'completed'
      });

      // Add activity log
      const homeUser = users.find(u => u.id === editingMatch.homeUserId);
      const awayUser = users.find(u => u.id === editingMatch.awayUserId);
      if (homeUser && awayUser) {
        await dataService.createActivityLog({
          type: 'match_result',
          userId: user.id,
          username: user.username,
          description: `Added result: ${homeUser.username} ${homeScore} - ${awayScore} ${awayUser.username}`,
          metadata: {
            leagueId: selectedLeagueId!,
            leagueName: selectedLeague.name,
            matchId: editingMatch.id,
            score: `${homeScore} - ${awayScore}`
          }
        });
      }

      // For cup format, check if we need to generate next round
      if (selectedLeague?.format === 'cup') {
        const allMatches = await dataService.getMatches();
        const leagueMatches = allMatches.filter(m => m.leagueId === selectedLeagueId);
        const currentRound = editingMatch.round || 1;

        const currentRoundMatches = leagueMatches.filter(m => m.round === currentRound);
        const allCompleted = currentRoundMatches.every(m => m.status === 'completed');

        if (allCompleted && currentRoundMatches.length > 1) {
          const nextRoundExists = leagueMatches.some(m => m.round === currentRound + 1);

          if (!nextRoundExists) {
            const winners: string[] = [];
            currentRoundMatches.forEach(m => {
              if (m.homeScore! > m.awayScore!) {
                winners.push(m.homeUserId);
              } else if (m.awayScore! > m.homeScore!) {
                winners.push(m.awayUserId);
              } else {
                winners.push(m.homeUserId);
              }
            });

            // Create next round matches
            for (let i = 0; i < winners.length; i += 2) {
              if (winners[i + 1]) {
                await dataService.createMatch({
                  leagueId: selectedLeagueId!,
                  homeUserId: winners[i],
                  awayUserId: winners[i + 1],
                  status: 'pending',
                  date: Date.now() + 86400000,
                  round: currentRound + 1
                });
              }
            }
          }
        }
      }

      // Reload matches
      await loadData();
      setEditingMatch(null);
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setEditingMatch(null);
    setHomeScore(0);
    setAwayScore(0);
  };

  const areAllMatchesCompleted = (leagueId: string) => {
    const leagueMatches = matches.filter(m => m.leagueId === leagueId);
    return leagueMatches.length > 0 && leagueMatches.every(m => m.status === 'completed');
  };

  const handleFinishLeague = async () => {
    if (!selectedLeague) return;

    try {
      setSaving(true);
      const leagueId = selectedLeague.id;

      // Determine champion and standings
      const champion = tableData.length > 0 ? tableData[0].userId : null;
      const standings = tableData.map(row => ({
        userId: row.userId,
        username: row.username,
        points: row.points,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        gf: row.gf,
        ga: row.ga,
        gd: row.gd
      }));

      // Update league status to finished with winner and standings
      await dataService.updateLeague(leagueId, {
        status: 'finished',
        finishedAt: Date.now(),
        winner: champion,
        standings: standings
      });

      // Calculate stats from matches
      const leagueMatches = matches.filter(m => m.leagueId === leagueId);
      const statsUpdates: Record<string, { played: number; goalsScored: number; goalsConceded: number }> = {};

      // Initialize stats for ALL participants (even if they didn't play)
      selectedLeague.participantIds.forEach(participantId => {
        statsUpdates[participantId] = { played: 0, goalsScored: 0, goalsConceded: 0 };
      });

      // Update stats from completed matches
      leagueMatches.forEach(match => {
        if (match.status === 'completed') {
          // Ensure users exist in statsUpdates (they should from initialization above)
          if (!statsUpdates[match.homeUserId]) {
            statsUpdates[match.homeUserId] = { played: 0, goalsScored: 0, goalsConceded: 0 };
          }
          if (!statsUpdates[match.awayUserId]) {
            statsUpdates[match.awayUserId] = { played: 0, goalsScored: 0, goalsConceded: 0 };
          }

          statsUpdates[match.homeUserId].played++;
          statsUpdates[match.homeUserId].goalsScored += match.homeScore || 0;
          statsUpdates[match.homeUserId].goalsConceded += match.awayScore || 0;

          statsUpdates[match.awayUserId].played++;
          statsUpdates[match.awayUserId].goalsScored += match.awayScore || 0;
          statsUpdates[match.awayUserId].goalsConceded += match.homeScore || 0;
        }
      });

      // Update each user's stats
      for (const [userId, stats] of Object.entries(statsUpdates)) {
        const currentStats = await dataService.getUserStats(userId);
        const isChampion = userId === champion;

        await dataService.updateUserStats(userId, {
          matchesPlayed: (currentStats?.matchesPlayed || 0) + stats.played,
          leaguesParticipated: (currentStats?.leaguesParticipated || 0) + 1,
          goalsScored: (currentStats?.goalsScored || 0) + stats.goalsScored,
          goalsConceded: (currentStats?.goalsConceded || 0) + stats.goalsConceded,
          championshipsWon: (currentStats?.championshipsWon || 0) + (isChampion ? 1 : 0),
          updatedAt: Date.now()
        });
      }

      // Add activity log
      await dataService.createActivityLog({
        type: 'league_finished',
        userId: user.id,
        username: user.username,
        description: `Finished league "${selectedLeague.name}"`,
        metadata: {
          leagueId: selectedLeague.id,
          leagueName: selectedLeague.name,
          champion: champion,
          championName: users.find(u => u.id === champion)?.username
        }
      });

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error finishing league:', error);
    } finally {
      setSaving(false);
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

  if (leagues.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="p-6 glass rounded-full border border-purple-500/20 text-purple-400">
          <LayoutGrid className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black">NO ACTIVE LEAGUES</h2>
        <p className="text-gray-500">You aren't participating in any running leagues right now.</p>
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

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'matches' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Calendar className="w-4 h-4" /> Matches
            </button>
            {selectedLeague?.format === 'cup' ? (
              <button
                onClick={() => setActiveTab('bracket')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'bracket' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <GitBranch className="w-4 h-4" /> Bracket
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'table' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <TableIcon className="w-4 h-4" /> Table
              </button>
            )}
          </div>

          {(user.role === 'superuser' || user.role === 'pro_manager') && (
            <button
              onClick={handleFinishLeague}
              disabled={!selectedLeagueId || !areAllMatchesCompleted(selectedLeagueId) || saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${selectedLeagueId && areAllMatchesCompleted(selectedLeagueId) && !saving
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving ? 'FINISHING...' : 'FINISH LEAGUE'}
            </button>
          )}
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
                        <img src={getAvatarByUserId(row.userId, users)} className="w-8 h-8 rounded-full border border-white/10" alt="" />
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
      ) : activeTab === 'bracket' ? (
        <div className="glass rounded-3xl border border-white/5 p-8 overflow-x-auto">
          <div className="min-w-max">
            {(() => {
              const rounds: Record<number, Match[]> = {};
              leagueMatches.forEach(m => {
                const round = m.round || 1;
                if (!rounds[round]) rounds[round] = [];
                rounds[round].push(m);
              });

              const sortedRounds = Object.keys(rounds).map(Number).sort((a, b) => a - b);
              const maxRound = Math.max(...sortedRounds);

              const getRoundName = (round: number, maxRound: number) => {
                const roundsFromEnd = maxRound - round;
                if (roundsFromEnd === 0) return 'FINAL';
                if (roundsFromEnd === 1) return 'SEMI-FINALS';
                if (roundsFromEnd === 2) return 'QUARTER-FINALS';
                return `ROUND ${round}`;
              };

              return (
                <div className="flex gap-12 items-start">
                  {sortedRounds.map((roundNum, roundIndex) => (
                    <div key={roundNum} className="flex flex-col gap-6">
                      <div className="text-center mb-4">
                        <div className="inline-block px-6 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full">
                          <h3 className="text-sm font-black text-purple-400 uppercase tracking-wider">
                            {getRoundName(roundNum, maxRound)}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-col gap-8 relative">
                        {rounds[roundNum].map((m, matchIndex) => {
                          const home = users.find(u => u.id === m.homeUserId);
                          const away = users.find(u => u.id === m.awayUserId);
                          const isCompleted = m.status === 'completed';
                          const homeWon = isCompleted && m.homeScore! > m.awayScore!;
                          const awayWon = isCompleted && m.awayScore! > m.homeScore!;

                          return (
                            <div key={m.id} className="relative">
                              {roundIndex < sortedRounds.length - 1 && (
                                <div className="absolute left-full top-1/2 w-12 h-0.5 bg-purple-500/20 z-0" style={{ transform: 'translateY(-50%)' }}></div>
                              )}

                              <div
                                onClick={() => handleMatchClick(m)}
                                className="glass rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer hover:scale-105 w-64 relative z-10"
                              >
                                <div className={`flex items-center justify-between p-4 border-b border-white/5 ${homeWon ? 'bg-purple-600/10' : ''}`}>
                                  <div className="flex items-center gap-3 flex-1">
                                    <img
                                      src={getAvatarByUserId(home?.id || '', users)}
                                      className="w-8 h-8 rounded-full border border-white/10"
                                      alt=""
                                    />
                                    <span className={`font-bold text-sm truncate ${homeWon ? 'text-purple-400' : ''}`}>
                                      {home?.username}
                                    </span>
                                  </div>
                                  <span className={`text-xl font-black ml-2 ${homeWon ? 'text-purple-400' : 'text-gray-400'}`}>
                                    {isCompleted ? m.homeScore : '-'}
                                  </span>
                                </div>

                                <div className={`flex items-center justify-between p-4 ${awayWon ? 'bg-purple-600/10' : ''}`}>
                                  <div className="flex items-center gap-3 flex-1">
                                    <img
                                      src={getAvatarByUserId(away?.id || '', users)}
                                      className="w-8 h-8 rounded-full border border-white/10"
                                      alt=""
                                    />
                                    <span className={`font-bold text-sm truncate ${awayWon ? 'text-purple-400' : ''}`}>
                                      {away?.username}
                                    </span>
                                  </div>
                                  <span className={`text-xl font-black ml-2 ${awayWon ? 'text-purple-400' : 'text-gray-400'}`}>
                                    {isCompleted ? m.awayScore : '-'}
                                  </span>
                                </div>

                                {!isCompleted && (
                                  <div className="absolute -top-2 -right-2 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                                    <span className="text-[9px] font-black text-orange-400 uppercase">Pending</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {(() => {
                    const finalRoundMatches = rounds[maxRound] || [];
                    const isTrueFinal = finalRoundMatches.length === 1;
                    const finalMatch = finalRoundMatches[0];
                    const isCompleted = finalMatch?.status === 'completed';

                    return isTrueFinal && isCompleted && (
                      <div className="flex flex-col items-center justify-center gap-4 ml-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50 animate-pulse">
                          <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Champion</p>
                          {(() => {
                            const winnerId = finalMatch.homeScore! > finalMatch.awayScore! ? finalMatch.homeUserId : finalMatch.awayUserId;
                            const winner = users.find(u => u.id === winnerId);
                            return (
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  src={getAvatarByUserId(winner?.id || '', users)}
                                  className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-lg"
                                  alt=""
                                />
                                <p className="font-black text-yellow-400">{winner?.username}</p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leagueMatches.sort((a, b) => a.date - b.date).map((m, i) => {
              const home = users.find(u => u.id === m.homeUserId);
              const away = users.find(u => u.id === m.awayUserId);
              return (
                <div
                  key={m.id}
                  onClick={() => handleMatchClick(m)}
                  className="glass p-6 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all flex items-center justify-between group cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex-1 flex flex-col items-center gap-2 text-center">
                    <img src={getAvatarByUserId(home?.id || '', users)} className="w-12 h-12 rounded-full border-2 border-white/5 group-hover:border-purple-500/30 transition-all" alt="" />
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
                    <img src={getAvatarByUserId(away?.id || '', users)} className="w-12 h-12 rounded-full border-2 border-white/5 group-hover:border-purple-500/30 transition-all" alt="" />
                    <p className="text-sm font-bold truncate w-24">{away?.username}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for editing match results */}
      {editingMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl border border-purple-500/30 p-8 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">Edit Match Result</h3>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3">
                  <img
                    src={getAvatarByUserId(editingMatch.homeUserId, users)}
                    className="w-12 h-12 rounded-full border-2 border-purple-500/30"
                    alt=""
                  />
                  <span className="font-bold text-sm">
                    {users.find(u => u.id === editingMatch.homeUserId)?.username}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="w-20 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-black focus:border-purple-500/50 focus:ring-0 transition-colors"
                />
              </div>

              <div className="flex items-center justify-center">
                <div className="px-4 py-2 bg-white/5 rounded-full text-xs font-black text-gray-500">VS</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3">
                  <img
                    src={getAvatarByUserId(editingMatch.awayUserId, users)}
                    className="w-12 h-12 rounded-full border-2 border-purple-500/30"
                    alt=""
                  />
                  <span className="font-bold text-sm">
                    {users.find(u => u.id === editingMatch.awayUserId)?.username}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="w-20 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-black focus:border-purple-500/50 focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResult}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Result
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunningLeagues;
