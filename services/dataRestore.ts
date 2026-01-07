/**
 * Data Restore Service
 * Handles restoring league and match data from backup files
 * 
 * Features:
 * - Comprehensive validation
 * - Duplicate detection
 * - Progress tracking
 * - Error handling
 * - Batch processing for performance
 */

import { supabase } from './supabase';
import type {
    RestoreData,
    RestoreMatch,
    RestoreLeague,
    RestoreActivityLog,
    RestoreValidationResult,
    RestoreProgress,
    RestoreResult,
    RestoreOptions
} from '../types/restore';

class DataRestoreService {
    private progressCallback?: (progress: RestoreProgress) => void;

    /**
     * Set progress callback for UI updates
     */
    setProgressCallback(callback: (progress: RestoreProgress) => void) {
        this.progressCallback = callback;
    }

    /**
     * Update progress
     */
    private updateProgress(progress: RestoreProgress) {
        if (this.progressCallback) {
            this.progressCallback(progress);
        }
    }

    /**
     * Validate restore file
     */
    async validateFile(file: File): Promise<RestoreValidationResult> {
        const result: RestoreValidationResult = {
            valid: true,
            errors: [],
            warnings: [],
            stats: {
                matchesCount: 0,
                leaguesCount: 0,
                activityLogsCount: 0,
                uniqueUsers: new Set(),
                duplicateMatches: [],
                duplicateLeagues: []
            }
        };

        try {
            // Check file type
            if (!file.name.endsWith('.json')) {
                result.valid = false;
                result.errors.push('File must be a JSON file');
                return result;
            }

            // Check file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                result.valid = false;
                result.errors.push('File size exceeds 50MB limit');
                return result;
            }

            // Parse JSON
            const text = await file.text();
            let data: RestoreData;

            try {
                data = JSON.parse(text);
            } catch (e) {
                result.valid = false;
                result.errors.push('Invalid JSON format');
                return result;
            }

            // Validate structure
            if (!data.version || !data.exportDate || !data.userId) {
                result.valid = false;
                result.errors.push('Missing required fields: version, exportDate, or userId');
                return result;
            }

            // Validate matches
            if (data.matches) {
                result.stats.matchesCount = data.matches.length;

                const matchIds = new Set<string>();
                for (const match of data.matches) {
                    // Check required fields
                    if (!match.id || !match.league_id || !match.home_user_id || !match.away_user_id) {
                        result.errors.push(`Match missing required fields: ${match.id || 'unknown'}`);
                        result.valid = false;
                        continue;
                    }

                    // Check for duplicates in file
                    if (matchIds.has(match.id)) {
                        result.stats.duplicateMatches.push(match.id);
                        result.warnings.push(`Duplicate match ID in file: ${match.id}`);
                    }
                    matchIds.add(match.id);

                    // Collect unique users
                    result.stats.uniqueUsers.add(match.home_user_id);
                    result.stats.uniqueUsers.add(match.away_user_id);

                    // Validate status
                    if (!['scheduled', 'completed'].includes(match.status)) {
                        result.warnings.push(`Invalid match status: ${match.status} for match ${match.id}`);
                    }
                }
            }

            // Validate leagues
            if (data.leagues) {
                result.stats.leaguesCount = data.leagues.length;

                const leagueIds = new Set<string>();
                for (const league of data.leagues) {
                    // Check required fields
                    if (!league.id || !league.name || !league.admin_id || !league.format) {
                        result.errors.push(`League missing required fields: ${league.id || 'unknown'}`);
                        result.valid = false;
                        continue;
                    }

                    // Check for duplicates in file
                    if (leagueIds.has(league.id)) {
                        result.stats.duplicateLeagues.push(league.id);
                        result.warnings.push(`Duplicate league ID in file: ${league.id}`);
                    }
                    leagueIds.add(league.id);

                    // Collect admin as unique user
                    result.stats.uniqueUsers.add(league.admin_id);

                    // Collect participants
                    if (league.participant_ids) {
                        league.participant_ids.forEach(id => result.stats.uniqueUsers.add(id));
                    }


                    // Validate format (accept both singular and plural forms)
                    if (!['round_robin_1leg', 'round_robin_2leg', 'round_robin_2legs', 'cup'].includes(league.format)) {
                        result.warnings.push(`Invalid league format: ${league.format} for league ${league.id}`);
                    }

                    // Validate status
                    if (!['running', 'finished'].includes(league.status)) {
                        result.warnings.push(`Invalid league status: ${league.status} for league ${league.id}`);
                    }
                }
            }

            // Validate activity logs
            if (data.activityLogs) {
                result.stats.activityLogsCount = data.activityLogs.length;

                for (const log of data.activityLogs) {
                    // Check required fields
                    if (!log.id || !log.user_id || !log.action || !log.created_at) {
                        result.warnings.push(`Activity log missing required fields: ${JSON.stringify(log).substring(0, 100)}`);
                    }
                }
            }

            // Check if database has existing data
            await this.checkDuplicatesInDatabase(data, result);

        } catch (error: any) {
            result.valid = false;
            result.errors.push(`Validation error: ${error.message}`);
        }

        return result;
    }

    /**
     * Check for duplicates in database
     */
    private async checkDuplicatesInDatabase(
        data: RestoreData,
        result: RestoreValidationResult
    ): Promise<void> {
        try {
            // Check for duplicate matches
            if (data.matches && data.matches.length > 0) {
                const matchIds = data.matches.map(m => m.id);
                const { data: existingMatches } = await supabase
                    .from('matches')
                    .select('id')
                    .in('id', matchIds.slice(0, 100)); // Check first 100 for performance

                if (existingMatches && existingMatches.length > 0) {
                    result.warnings.push(
                        `${existingMatches.length} matches already exist in database (will be skipped)`
                    );
                }
            }

            // Check for duplicate leagues
            if (data.leagues && data.leagues.length > 0) {
                const leagueIds = data.leagues.map(l => l.id);
                const { data: existingLeagues } = await supabase
                    .from('leagues')
                    .select('id')
                    .in('id', leagueIds);

                if (existingLeagues && existingLeagues.length > 0) {
                    result.warnings.push(
                        `${existingLeagues.length} leagues already exist in database (will be skipped)`
                    );
                }
            }
        } catch (error) {
            // Non-critical error, just log it
            console.warn('Error checking database duplicates:', error);
        }
    }

    /**
     * Restore data from file
     */
    async restoreFromFile(
        file: File,
        options: RestoreOptions = {
            skipDuplicates: true,
            validateOnly: false,
            preserveIds: true
        }
    ): Promise<RestoreResult> {
        const startTime = Date.now();
        const result: RestoreResult = {
            success: false,
            imported: { leagues: 0, matches: 0, activityLogs: 0 },
            skipped: { leagues: 0, matches: 0, activityLogs: 0 },
            errors: [],
            duration: 0
        };

        try {
            // Phase 1: Validation
            this.updateProgress({
                phase: 'validating',
                current: 0,
                total: 100,
                message: 'Validating restore file...',
                errors: []
            });

            const validation = await this.validateFile(file);

            if (!validation.valid) {
                result.errors = validation.errors;
                this.updateProgress({
                    phase: 'error',
                    current: 0,
                    total: 100,
                    message: 'Validation failed',
                    errors: validation.errors
                });
                return result;
            }

            if (options.validateOnly) {
                result.success = true;
                result.duration = Date.now() - startTime;
                return result;
            }

            // Parse data
            const text = await file.text();
            const data: RestoreData = JSON.parse(text);

            const totalItems = (data.leagues?.length || 0) + (data.matches?.length || 0);
            let processedItems = 0;

            // Phase 2: Restore Leagues
            if (data.leagues && data.leagues.length > 0) {
                this.updateProgress({
                    phase: 'restoring_leagues',
                    current: 0,
                    total: totalItems,
                    message: `Restoring ${data.leagues.length} leagues...`,
                    errors: []
                });

                const leagueResult = await this.restoreLeagues(data.leagues, options);
                result.imported.leagues = leagueResult.imported;
                result.skipped.leagues = leagueResult.skipped;
                result.errors.push(...leagueResult.errors);

                processedItems += data.leagues.length;
            }

            // Phase 3: Restore Matches
            if (data.matches && data.matches.length > 0) {
                this.updateProgress({
                    phase: 'restoring_matches',
                    current: processedItems,
                    total: totalItems,
                    message: `Restoring ${data.matches.length} matches...`,
                    errors: result.errors
                });

                const matchResult = await this.restoreMatches(data.matches, options);
                result.imported.matches = matchResult.imported;
                result.skipped.matches = matchResult.skipped;
                result.errors.push(...matchResult.errors);

                processedItems += data.matches.length;
            }

            // Phase 4: Restore Activity Logs
            if (data.activityLogs && data.activityLogs.length > 0) {
                this.updateProgress({
                    phase: 'restoring_activity_logs',
                    current: processedItems,
                    total: totalItems,
                    message: `Restoring ${data.activityLogs.length} activity logs...`,
                    errors: result.errors
                });

                const activityLogResult = await this.restoreActivityLogs(data.activityLogs, options);
                result.imported.activityLogs = activityLogResult.imported;
                result.skipped.activityLogs = activityLogResult.skipped;
                result.errors.push(...activityLogResult.errors);
            }

            // Complete
            result.success = result.errors.length === 0 ||
                (result.imported.leagues > 0 || result.imported.matches > 0 || result.imported.activityLogs > 0);
            result.duration = Date.now() - startTime;

            this.updateProgress({
                phase: 'complete',
                current: totalItems,
                total: totalItems,
                message: `Restore complete! Imported ${result.imported.leagues} leagues, ${result.imported.matches} matches, and ${result.imported.activityLogs} activity logs`,
                errors: result.errors
            });

        } catch (error: any) {
            result.errors.push(`Restore failed: ${error.message}`);
            this.updateProgress({
                phase: 'error',
                current: 0,
                total: 100,
                message: 'Restore failed',
                errors: result.errors
            });
        }

        return result;
    }

    /**
     * Restore leagues
     */
    private async restoreLeagues(
        leagues: RestoreLeague[],
        options: RestoreOptions
    ): Promise<{ imported: number; skipped: number; errors: string[] }> {
        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        // Process in batches of 10 for better performance
        const batchSize = 10;
        for (let i = 0; i < leagues.length; i += batchSize) {
            const batch = leagues.slice(i, i + batchSize);


            for (const league of batch) {
                try {
                    // Insert league directly - let database handle duplicates
                    const { error } = await supabase
                        .from('leagues')
                        .insert({
                            id: options.preserveIds ? league.id : undefined,
                            name: league.name,
                            admin_id: league.admin_id,
                            format: league.format,
                            status: league.status,
                            participant_ids: league.participant_ids,
                            created_at: league.created_at,
                            finished_at: league.finished_at || null,
                            winner: (league as any).winner || null,
                            standings: (league as any).standings || null
                        });

                    if (error) {
                        // Check if it's a duplicate key error (code 23505)
                        if (error.code === '23505' && options.skipDuplicates) {
                            skipped++;
                        } else {
                            errors.push(`League ${league.id}: ${error.message}`);
                            skipped++;
                        }
                    } else {
                        imported++;
                    }
                } catch (error: any) {
                    errors.push(`League ${league.id}: ${error.message}`);
                    skipped++;
                }
            }
        }

        return { imported, skipped, errors };
    }

    /**
     * Restore matches
     */
    private async restoreMatches(
        matches: RestoreMatch[],
        options: RestoreOptions
    ): Promise<{ imported: number; skipped: number; errors: string[] }> {
        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        // Process in batches of 50 for better performance
        const batchSize = 50;
        for (let i = 0; i < matches.length; i += batchSize) {
            const batch = matches.slice(i, i + batchSize);


            for (const match of batch) {
                try {
                    // Insert match directly - let database handle duplicates
                    const { error } = await supabase
                        .from('matches')
                        .insert({
                            id: options.preserveIds ? match.id : undefined,
                            league_id: match.league_id,
                            home_user_id: match.home_user_id,
                            away_user_id: match.away_user_id,
                            home_score: match.home_score,
                            away_score: match.away_score,
                            status: match.status,
                            date: match.date,
                            round: match.round,
                            created_at: match.created_at
                        });

                    if (error) {
                        // Check if it's a duplicate key error (code 23505) or foreign key error (code 23503)
                        if (error.code === '23505' && options.skipDuplicates) {
                            skipped++;
                        } else if (error.code === '23503') {
                            // Foreign key violation - league doesn't exist
                            errors.push(`Match ${match.id}: League not found (${match.league_id})`);
                            skipped++;
                        } else {
                            errors.push(`Match ${match.id}: ${error.message}`);
                            skipped++;
                        }
                    } else {
                        imported++;
                    }
                } catch (error: any) {
                    errors.push(`Match ${match.id}: ${error.message}`);
                    skipped++;
                }
            }

            // Update progress every batch
            if (this.progressCallback) {
                this.updateProgress({
                    phase: 'restoring_matches',
                    current: Math.min(i + batchSize, matches.length),
                    total: matches.length,
                    message: `Restoring matches... ${Math.min(i + batchSize, matches.length)}/${matches.length}`,
                    errors: errors.slice(-5) // Show last 5 errors
                });
            }
        }

        return { imported, skipped, errors };
    }

    /**
     * Restore activity logs
     */
    private async restoreActivityLogs(
        activityLogs: RestoreActivityLog[],
        options: RestoreOptions
    ): Promise<{ imported: number; skipped: number; errors: string[] }> {
        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];
        const batchSize = 50;

        for (let i = 0; i < activityLogs.length; i += batchSize) {
            const batch = activityLogs.slice(i, i + batchSize);

            for (const log of batch) {
                try {
                    const { error } = await supabase
                        .from('activity_logs')
                        .insert({
                            id: options.preserveIds ? log.id : undefined,
                            user_id: log.user_id,
                            action: log.action,
                            details: log.details,
                            created_at: log.created_at
                        });

                    if (error) {
                        // Check if it's a duplicate key error
                        if (error.code === '23505' && options.skipDuplicates) {
                            skipped++;
                        } else if (error.code === '23503') {
                            // Foreign key violation - user doesn't exist
                            errors.push(`Activity log ${log.id}: User not found (${log.user_id})`);
                            skipped++;
                        } else {
                            errors.push(`Activity log ${log.id}: ${error.message}`);
                            skipped++;
                        }
                    } else {
                        imported++;
                    }
                } catch (error: any) {
                    errors.push(`Activity log ${log.id}: ${error.message}`);
                    skipped++;
                }
            }

            // Update progress every batch
            if (this.progressCallback) {
                this.updateProgress({
                    phase: 'restoring_activity_logs',
                    current: Math.min(i + batchSize, activityLogs.length),
                    total: activityLogs.length,
                    message: `Restoring activity logs... ${Math.min(i + batchSize, activityLogs.length)}/${activityLogs.length}`,
                    errors: errors.slice(-5) // Show last 5 errors
                });
            }
        }

        return { imported, skipped, errors };
    }
}

export const dataRestoreService = new DataRestoreService();
