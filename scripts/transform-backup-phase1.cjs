/**
 * Phase 1: League Backup Transformation Script
 * 
 * This script cleans and formats the backup file WITHOUT user ID mapping.
 * User ID mapping will be done in Phase 2 after users register.
 * 
 * Changes made:
 * 1. Convert "Unknown" scores to null
 * 2. Remove "standings" from leagues (calculated data)
 * 3. Validate data integrity
 * 4. Create user mapping template
 * 5. Generate formatted backup file
 */

// Use CommonJS require
const fs = require('fs');
const path = require('path');

// File paths
const INPUT_FILE = path.join(__dirname, '../leagues.json');
const OUTPUT_FILE = path.join(__dirname, '../leagues-phase1-formatted.json');
const MAPPING_TEMPLATE_FILE = path.join(__dirname, '../user-mapping-template.json');

console.log('🚀 Starting Phase 1 Transformation...\n');

// Read the backup file
console.log('📖 Reading backup file...');
const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
const backup = JSON.parse(rawData);

console.log(`✅ Loaded ${backup.matches.length} matches and ${backup.leagues.length} leagues\n`);

// Statistics
const stats = {
    matchesProcessed: 0,
    unknownScoresFixed: 0,
    leaguesProcessed: 0,
    standingsRemoved: 0,
    uniquePlayers: new Set(),
    uniqueLeagueIds: new Set(),
    errors: []
};

// Process matches
console.log('🔧 Processing matches...');
backup.matches.forEach((match, index) => {
    try {
        // Fix "Unknown" scores
        if (match.home_score === "Unknown") {
            match.home_score = null;
            stats.unknownScoresFixed++;
        }
        if (match.away_score === "Unknown") {
            match.away_score = null;
            stats.unknownScoresFixed++;
        }

        // Collect unique players
        stats.uniquePlayers.add(match.home_user_id);
        stats.uniquePlayers.add(match.away_user_id);

        // Collect unique league IDs
        stats.uniqueLeagueIds.add(match.league_id);

        // Validate match data
        if (!match.id || !match.league_id || !match.home_user_id || !match.away_user_id) {
            stats.errors.push(`Match ${index}: Missing required fields`);
        }

        stats.matchesProcessed++;
    } catch (error) {
        stats.errors.push(`Match ${index}: ${error.message}`);
    }
});

console.log(`✅ Processed ${stats.matchesProcessed} matches`);
console.log(`   - Fixed ${stats.unknownScoresFixed} "Unknown" scores`);
console.log(`   - Found ${stats.uniquePlayers.size} unique players`);
console.log(`   - Found ${stats.uniqueLeagueIds.size} unique league IDs\n`);

// Process leagues
console.log('🔧 Processing leagues...');
backup.leagues.forEach((league, index) => {
    try {
        // Remove standings (calculated data)
        if (league.standings) {
            delete league.standings;
            stats.standingsRemoved++;
        }

        // Collect admin as unique player
        stats.uniquePlayers.add(league.admin_id);

        // Collect participants as unique players
        if (league.participant_ids && Array.isArray(league.participant_ids)) {
            league.participant_ids.forEach(pid => stats.uniquePlayers.add(pid));
        }

        // Validate league data
        if (!league.id || !league.name || !league.admin_id) {
            stats.errors.push(`League ${index}: Missing required fields`);
        }

        stats.leaguesProcessed++;
    } catch (error) {
        stats.errors.push(`League ${index}: ${error.message}`);
    }
});

console.log(`✅ Processed ${stats.leaguesProcessed} leagues`);
console.log(`   - Removed ${stats.standingsRemoved} standings arrays\n`);

// Validate data integrity
console.log('🔍 Validating data integrity...');
const leagueIds = new Set(backup.leagues.map(l => l.id));
const orphanedMatches = backup.matches.filter(m => !leagueIds.has(m.league_id));

if (orphanedMatches.length > 0) {
    console.log(`⚠️  Warning: Found ${orphanedMatches.length} matches with non-existent league IDs`);
    stats.errors.push(`${orphanedMatches.length} orphaned matches found`);
} else {
    console.log('✅ All matches reference valid leagues');
}

// Create user mapping template
console.log('\n📝 Creating user mapping template...');
const playersList = Array.from(stats.uniquePlayers).sort();
const mappingTemplate = {
    _instructions: "Replace 'PENDING' with actual UUID from Supabase after users register",
    _query: "SELECT id, email, username, first_name, last_name FROM users ORDER BY email;",
    _totalPlayers: playersList.length,
    mapping: {}
};

playersList.forEach(player => {
    mappingTemplate.mapping[player] = "PENDING";
});

fs.writeFileSync(MAPPING_TEMPLATE_FILE, JSON.stringify(mappingTemplate, null, 2));
console.log(`✅ Created mapping template: ${MAPPING_TEMPLATE_FILE}`);
console.log(`   Players to map: ${playersList.join(', ')}\n`);

// Save formatted backup
console.log('💾 Saving formatted backup...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(backup, null, 2));
console.log(`✅ Saved formatted backup: ${OUTPUT_FILE}\n`);

// Print summary
console.log('📊 TRANSFORMATION SUMMARY');
console.log('═'.repeat(50));
console.log(`Matches Processed:     ${stats.matchesProcessed}`);
console.log(`Leagues Processed:     ${stats.leaguesProcessed}`);
console.log(`Unknown Scores Fixed:  ${stats.unknownScoresFixed}`);
console.log(`Standings Removed:     ${stats.standingsRemoved}`);
console.log(`Unique Players Found:  ${stats.uniquePlayers.size}`);
console.log(`Unique Leagues Found:  ${stats.uniqueLeagueIds.size}`);
console.log(`Errors:                ${stats.errors.length}`);
console.log('═'.repeat(50));

if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS FOUND:');
    stats.errors.forEach(error => console.log(`   - ${error}`));
}

console.log('\n✅ Phase 1 Complete!');
console.log('\n📋 NEXT STEPS:');
console.log('1. Review the formatted file: leagues-phase1-formatted.json');
console.log('2. Check the user mapping template: user-mapping-template.json');
console.log('3. Wait for users to register on Rakla');
console.log('4. Run Phase 2 script to map user IDs');
console.log('\n🎉 Done!\n');
