
import { LeagueFormat, Match } from '../types';

export function generateFixtures(
  leagueId: string, 
  participantIds: string[], 
  format: LeagueFormat
): Omit<Match, 'id'>[] {
  const matches: Omit<Match, 'id'>[] = [];
  const n = participantIds.length;
  
  if (format === 'cup') {
    // Basic single elimination bracket generation (assuming power of 2 for simplicity)
    // In a real app, handle non-power-of-2 with byes
    for (let i = 0; i < n; i += 2) {
      if (participantIds[i+1]) {
        matches.push({
          leagueId,
          homeUserId: participantIds[i],
          awayUserId: participantIds[i + 1],
          status: 'pending',
          date: Date.now(),
          round: 1
        });
      }
    }
    return matches;
  }

  // Round Robin - Circle Method
  const players = [...participantIds];
  if (n % 2 !== 0) players.push('BYE');
  
  const numRounds = players.length - 1;
  const gamesPerRound = players.length / 2;

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < gamesPerRound; i++) {
      const home = players[i];
      const away = players[players.length - 1 - i];
      
      if (home !== 'BYE' && away !== 'BYE') {
        matches.push({
          leagueId,
          homeUserId: home,
          awayUserId: away,
          status: 'pending',
          date: Date.now() + (round * 86400000), // Incremental days
          round: round + 1
        });
      }
    }
    // Rotate players except first
    players.splice(1, 0, players.pop()!);
  }

  if (format === 'round_robin_2legs') {
    const secondLegs = matches.map(m => ({
      ...m,
      homeUserId: m.awayUserId,
      awayUserId: m.homeUserId,
      round: (m.round || 0) + numRounds
    }));
    return [...matches, ...secondLegs];
  }

  return matches;
}
