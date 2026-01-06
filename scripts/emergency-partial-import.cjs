/**
 * EMERGENCY: Partial Import Without Ahmed
 * 
 * ⚠️ WARNING: This will create an INCOMPLETE import!
 * Only use this if you absolutely cannot wait for Ahmed.
 * 
 * This script will:
 * 1. Remove all matches where Ahmed is a player
 * 2. Remove Ahmed from all league participants
 * 3. Mark leagues as incomplete
 * 4. Generate partial import file
 * 
 * YOU WILL LOSE:
 * - 345 matches (42% of data)
 * - Complete league data
 * - Accurate statistics
 */

const fs = require('fs');
const path = require('path');

console.log('⚠️  WARNING: PARTIAL IMPORT MODE\n');
console.log('This will create an INCOMPLETE import without Ahmed!');
console.log('You will lose 42% of your match data.\n');

// Confirmation
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Are you SURE you want to proceed? (type YES): ', (answer) => {
    if (answer !== 'YES') {
        console.log('\n❌ Cancelled. Good choice! Wait for Ahmed instead.');
        readline.close();
        process.exit(0);
    }

    console.log('\n⚠️  Proceeding with partial import...\n');

    // File paths
    const INPUT_FILE = path.join(__dirname, '../leagues-phase1-formatted.json');
    const MAPPING_FILE = path.join(__dirname, '../user-mapping.json');
    const OUTPUT_FILE = path.join(__dirname, '../leagues-partial-import-NO-AHMED.json');

    // Read files
    const backup = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    const mappingData = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    const mapping = mappingData.mapping;

    // Statistics
    const stats = {
        originalMatches: backup.matches.length,
        originalLeagues: backup.leagues.length,
        removedMatches: 0,
        keptMatches: 0,
        modifiedLeagues: 0
    };

    // Filter out Ahmed's matches
    console.log('🗑️  Removing Ahmed\'s matches...');
    const filteredMatches = backup.matches.filter(match => {
        if (match.home_user_id === 'Ahmed' || match.away_user_id === 'Ahmed') {
            stats.removedMatches++;
            return false;
        }
        stats.keptMatches++;
        return true;
    });

    console.log(`   Removed: ${stats.removedMatches} matches`);
    console.log(`   Kept: ${stats.keptMatches} matches\n`);

    // Process leagues
    console.log('🔧 Removing Ahmed from leagues...');
    backup.leagues.forEach(league => {
        // Remove Ahmed from participants
        if (league.participant_ids && league.participant_ids.includes('Ahmed')) {
            league.participant_ids = league.participant_ids.filter(p => p !== 'Ahmed');
            stats.modifiedLeagues++;
        }

        // Mark as incomplete
        league._incomplete = true;
        league._missing_player = 'Ahmed';
        league._note = 'This league is incomplete - Ahmed not registered';
    });

    console.log(`   Modified: ${stats.modifiedLeagues} leagues\n`);

    // Map remaining user IDs
    console.log('🔧 Mapping user IDs...');
    filteredMatches.forEach(match => {
        match.home_user_id = mapping[match.home_user_id] || match.home_user_id;
        match.away_user_id = mapping[match.away_user_id] || match.away_user_id;
    });

    backup.leagues.forEach(league => {
        league.admin_id = mapping[league.admin_id] || league.admin_id;
        if (league.participant_ids) {
            league.participant_ids = league.participant_ids.map(p => mapping[p] || p);
        }
    });

    // Update backup
    backup.matches = filteredMatches;
    backup.userId = "sys-restored-partial";
    backup.version = "1.8.0-partial";
    backup.exportDate = new Date().toISOString();
    backup._warning = "INCOMPLETE DATA - Ahmed not included";

    // Save
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(backup, null, 2));

    console.log('💾 Saved partial import file\n');
    console.log('📊 PARTIAL IMPORT SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Original Matches:      ${stats.originalMatches}`);
    console.log(`Removed Matches:       ${stats.removedMatches} (${Math.round(stats.removedMatches / stats.originalMatches * 100)}%)`);
    console.log(`Kept Matches:          ${stats.keptMatches} (${Math.round(stats.keptMatches / stats.originalMatches * 100)}%)`);
    console.log(`Modified Leagues:      ${stats.modifiedLeagues}`);
    console.log('═'.repeat(50));
    console.log('\n⚠️  WARNING: This is INCOMPLETE data!');
    console.log('You will need to re-import when Ahmed registers.\n');
    console.log('File saved: leagues-partial-import-NO-AHMED.json\n');

    readline.close();
});
