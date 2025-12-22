

export type LeagueFormat = 'round_robin_1leg' | 'round_robin_2legs' | 'cup';
export type LeagueStatus = 'running' | 'finished';
export type MatchStatus = 'pending' | 'completed';
export type UserRole = 'superuser' | 'pro_manager' | 'normal_user';

export interface User {
  id: string;
  email: string;
  password: string;
  username: string; // nickname
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  avatar?: string;
  role: UserRole;
}

export interface League {
  id: string;
  name: string;
  adminId: string;
  format: LeagueFormat;
  status: LeagueStatus;
  participantIds: string[];
  createdAt: number;
  finishedAt?: number;
}

export interface Match {
  id: string;
  leagueId: string;
  homeUserId: string;
  awayUserId: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  date: number;
  round?: number;
}

export interface UserStats {
  userId: string;
  matchesPlayed: number;
  leaguesParticipated: number;
  goalsScored: number;
  goalsConceded: number;
  championshipsWon: number;
  updatedAt: number;
}

export interface TableRow {
  userId: string;
  username: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export type ActivityType = 'league_created' | 'league_deleted' | 'match_result' | 'league_started' | 'league_finished';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  userId: string;
  username: string;
  description: string;
  timestamp: number;
  metadata?: {
    leagueId?: string;
    leagueName?: string;
    matchId?: string;
    score?: string;
  };
}
