import { supabase } from './supabase';

/**
 * Data Backup Service
 * Exports leagues and matches to a JSON file matching the template format
 */

interface Standing {
    userId: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
}

interface Match {
    id: string;
    league_id: string;
    home_user_id: string;
    away_user_id: string;
    home_score: number;
    away_score: number;
    status: string;
    date: string;
    round: number;
    created_at: string;
}

interface League {
    id: string;
    name: string;
    admin_id: string;
    format: string;
    status: string;
    participant_ids: string[];
    created_at: string;
    finished_at?: string;
    standings?: Standing[];
    winner?: string;
}

export interface BackupData {
    version: string;
    exportDate: string;
    userId: string;
    matches: Match[];
    leagues: League[];
}

class DataBackupService {
    /**
     * Calculate standings from matches for a league
     */
    private calculateStandings(matches: any[], participantIds: string[]): Standing[] {
        const standings: Map<string, Standing> = new Map();

        // Initialize standings for all participants
        participantIds.forEach(userId => {
            standings.set(userId, {
                userId,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                gf: 0,
                ga: 0,
                gd: 0,
                points: 0
            });
        });

        // Calculate stats from matches
        matches.forEach(match => {
            if (match.status !== 'completed') return;

            const homeStats = standings.get(match.home_user_id);
            const awayStats = standings.get(match.away_user_id);

            if (!homeStats || !awayStats) return;

            // Update matches played
            homeStats.played++;
            awayStats.played++;

            // Update goals
            homeStats.gf += match.home_score;
            homeStats.ga += match.away_score;
            awayStats.gf += match.away_score;
            awayStats.ga += match.home_score;

            // Determine result
            if (match.home_score > match.away_score) {
                // Home win
                homeStats.won++;
                homeStats.points += 3;
                awayStats.lost++;
            } else if (match.home_score < match.away_score) {
                // Away win
                awayStats.won++;
                awayStats.points += 3;
                homeStats.lost++;
            } else {
                // Draw
                homeStats.drawn++;
                awayStats.drawn++;
                homeStats.points += 1;
                awayStats.points += 1;
            }

            // Update goal difference
            homeStats.gd = homeStats.gf - homeStats.ga;
            awayStats.gd = awayStats.gf - awayStats.ga;
        });

        // Convert to array and sort
        const standingsArray = Array.from(standings.values());
        standingsArray.sort((a, b) => {
            // Sort by points (descending)
            if (b.points !== a.points) return b.points - a.points;
            // Then by goal difference (descending)
            if (b.gd !== a.gd) return b.gd - a.gd;
            // Then by goals for (descending)
            return b.gf - a.gf;
        });

        return standingsArray;
    }

    /**
     * Calculate round number for matches
     */
    private calculateRounds(matches: any[], format: string): Match[] {
        // Group matches by league
        const matchesByLeague = new Map<string, any[]>();
        matches.forEach(match => {
            if (!matchesByLeague.has(match.league_id)) {
                matchesByLeague.set(match.league_id, []);
            }
            matchesByLeague.get(match.league_id)!.push(match);
        });

        // Calculate rounds for each league
        const result: Match[] = [];
        matchesByLeague.forEach((leagueMatches, leagueId) => {
            // Sort by created_at
            leagueMatches.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            // Assign round numbers
            leagueMatches.forEach((match, index) => {
                // For round-robin, calculate based on number of participants
                // Simple approach: increment round every N matches
                const round = Math.floor(index / 2) + 1; // 2 matches per round
                result.push({
                    ...match,
                    round
                });
            });
        });

        return result;
    }

    /**
     * Export all leagues and matches for the current user
     */
    async exportData(userId: string): Promise<BackupData> {
        try {
            // Get app version from package.json
            const version = '1.8.2-beta';

            // Fetch all leagues where user is admin
            const { data: leagues, error: leaguesError } = await supabase
                .from('leagues')
                .select('*')
                .eq('admin_id', userId);

            if (leaguesError) throw leaguesError;

            // Get all league IDs
            const leagueIds = leagues?.map(l => l.id) || [];

            // Fetch all matches for these leagues
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .in('league_id', leagueIds);

            if (matchesError) throw matchesError;

            // Calculate rounds for matches
            const matches = this.calculateRounds(matchesData || [], 'round_robin_2legs');

            // Process leagues
            const processedLeagues: League[] = (leagues || []).map(league => {
                const leagueMatches = matches.filter(m => m.league_id === league.id);
                
                // Base league data
                const leagueData: League = {
                    id: league.id,
                    name: league.name,
                    admin_id: league.admin_id,
                    format: league.format,
                    status: league.status,
                    participant_ids: league.participant_ids || [],
                    created_at: league.created_at
                };

                // Add finished_at, standings, and winner for finished leagues
                if (league.status === 'finished') {
                    leagueData.finished_at = league.finished_at || league.created_at;
                    
                    // Calculate standings
                    const standings = this.calculateStandings(
                        leagueMatches,
                        league.participant_ids || []
                    );
                    leagueData.standings = standings;

                    // Determine winner (top of standings)
                    if (standings.length > 0) {
                        leagueData.winner = standings[0].userId;
                    }
                }

                return leagueData;
            });

            // Create backup data in template format
            const backupData: BackupData = {
                version,
                exportDate: new Date().toISOString(),
                userId: userId,
                matches,  // Matches first
                leagues: processedLeagues  // Leagues second
            };

            return backupData;
        } catch (error: any) {
            console.error('Error exporting data:', error);
            throw new Error(`Failed to export data: ${error.message}`);
        }
    }

    /**
     * Download backup data as JSON file
     */
    downloadBackup(backupData: BackupData, filename?: string) {
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `rakla-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Export and download in one step
     */
    async exportAndDownload(userId: string): Promise<void> {
        const backupData = await this.exportData(userId);
        this.downloadBackup(backupData);
    }
}

export const dataBackupService = new DataBackupService();
