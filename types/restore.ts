/**
 * Data Restore Types
 * Type definitions for the data restore system
 */

export interface RestoreData {
    version: string;
    exportDate: string;
    userId: string;
    matches?: RestoreMatch[];
    leagues?: RestoreLeague[];
    stats?: Record<string, any>;
}

export interface RestoreMatch {
    id: string;
    league_id: string;
    home_user_id: string;
    away_user_id: string;
    home_score: number | null;
    away_score: number | null;
    status: 'scheduled' | 'completed';
    date: string;
    round: number;
    created_at: string;
}

export interface RestoreLeague {
    id: string;
    name: string;
    admin_id: string;
    format: 'round_robin_1leg' | 'round_robin_2legs' | 'cup';
    status: 'running' | 'finished';
    participant_ids: string[];
    created_at: string;
    finished_at?: string;
}

export interface RestoreValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    stats: {
        matchesCount: number;
        leaguesCount: number;
        uniqueUsers: Set<string>;
        duplicateMatches: string[];
        duplicateLeagues: string[];
    };
}

export interface RestoreProgress {
    phase: 'validating' | 'restoring_leagues' | 'restoring_matches' | 'complete' | 'error';
    current: number;
    total: number;
    message: string;
    errors: string[];
}

export interface RestoreResult {
    success: boolean;
    imported: {
        leagues: number;
        matches: number;
    };
    skipped: {
        leagues: number;
        matches: number;
    };
    errors: string[];
    duration: number;
}

export interface RestoreOptions {
    skipDuplicates: boolean;
    validateOnly: boolean;
    preserveIds: boolean;
}
