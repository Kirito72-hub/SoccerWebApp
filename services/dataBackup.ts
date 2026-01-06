import { supabase } from './supabase';

/**
 * Data Backup Service
 * Exports leagues and matches to a JSON file
 */

export interface BackupData {
    version: string;
    exportDate: string;
    userId: string;
    leagues: any[];
    matches: any[];
}

class DataBackupService {
    /**
     * Export all leagues and matches for the current user
     */
    async exportData(userId: string): Promise<BackupData> {
        try {
            // Fetch all leagues where user is admin
            const { data: leagues, error: leaguesError } = await supabase
                .from('leagues')
                .select('*')
                .eq('admin_id', userId);

            if (leaguesError) throw leaguesError;

            // Get all league IDs
            const leagueIds = leagues?.map(l => l.id) || [];

            // Fetch all matches for these leagues
            const { data: matches, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .in('league_id', leagueIds);

            if (matchesError) throw matchesError;

            // Create backup data
            const backupData: BackupData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                userId: userId,
                leagues: leagues || [],
                matches: matches || []
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
