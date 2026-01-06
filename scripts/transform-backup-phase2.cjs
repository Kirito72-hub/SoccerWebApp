/**
 * Phase 2: User ID Mapping Script
 * 
 * This script maps player names to actual UUIDs from Supabase.
 * Run this AFTER all users have registered on Rakla.
 * 
 * Prerequisites:
 * 1. Phase 1 must be completed
 * 2. All users must be registered in Supabase
 * 3. user-mapping.json must be filled with actual UUIDs
 * 
 * Changes made:
 * 1. Replace all home_user_id/away_user_id in matches
 * 2. Replace all admin_id in leagues
 * 3. Replace all participant_ids in leagues
 * 4. Generate final import-ready file
 */

const fs = require('fs');
const path = require('path');

// File paths
const INPUT_FILE = path.join(__dirname, '../leagues-phase1-formatted.json');
const MAPPING_FILE = path.join(__dirname, '../user-mapping.json');
const OUTPUT_FILE = path.join(__dirname, '../leagues-final-import.json');

console.log('🚀 Starting Phase 2: User ID Mapping...\n');

// Read files
console.log('📖 Reading files...');
const backup = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
const mappingData = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
const mapping = mappingData.mapping;

console.log(`✅ Loaded ${backup.matches.length} matches and ${backup.leagues.length} leagues`);
console.log(`✅ Loaded mapping for ${Object.keys(mapping).length} players\n`);

// Validate mapping
console.log('🔍 Validating mapping...');
const pendingMappings = Object.entries(mapping).filter(([name, uuid]) => uuid === "PENDING");
if (pendingMappings.length > 0) {
    console.error('❌ ERROR: Some players are not mapped yet!');
    console.error('   Please update user-mapping.json with actual UUIDs:');
    pendingMappings.forEach(([name]) => console.error(`   - ${name}: PENDING`));
    process.exit(1);
}

// Validate UUIDs format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const invalidUUIDs = Object.entries(mapping).filter(([name, uuid]) => !uuidRegex.test(uuid));
if (invalidUUIDs.length > 0) {
    console.error('❌ ERROR: Some UUIDs are invalid!');
    invalidUUIDs.forEach(([name, uuid]) => console.error(`   - ${name}: ${uuid}`));
    process.exit(1);
}

console.log('✅ All mappings are valid\n');

// Statistics
const stats = {
    matchesProcessed: 0,
    leaguesProcessed: 0,
    userIdsMapped: 0,
    unmappedPlayers: new Set(),
    errors: []
};

// Helper function to map user ID
function mapUserId(name, context) {
    if (!name) {
        stats.errors.push(`${context}: Empty user name`);
        return null;
    }

    const uuid = mapping[name];
    if (!uuid) {
        stats.unmappedPlayers.add(name);
        stats.errors.push(`${context}: No mapping found for "${name}"`);
        return name; // Keep original if no mapping
    }

    stats.userIdsMapped++;
    return uuid;
}

// Process matches
console.log('🔧 Mapping user IDs in matches...');
backup.matches.forEach((match, index) => {
    try {
        match.home_user_id = mapUserId(match.home_user_id, `Match ${index} (home)`);
        match.away_user_id = mapUserId(match.away_user_id, `Match ${index} (away)`);
        stats.matchesProcessed++;
    } catch (error) {
        stats.errors.push(`Match ${index}: ${error.message}`);
    }
});

console.log(`✅ Processed ${stats.matchesProcessed} matches\n`);

// Process leagues
console.log('🔧 Mapping user IDs in leagues...');
backup.leagues.forEach((league, index) => {
    try {
        // Map admin ID
        league.admin_id = mapUserId(league.admin_id, `League ${index} (admin)`);

        // Map participant IDs
        if (league.participant_ids && Array.isArray(league.participant_ids)) {
            league.participant_ids = league.participant_ids.map((name, pIndex) =>
                mapUserId(name, `League ${index} participant ${pIndex}`)
            );
        }

        stats.leaguesProcessed++;
    } catch (error) {
        stats.errors.push(`League ${index}: ${error.message}`);
    }
});

console.log(`✅ Processed ${stats.leaguesProcessed} leagues\n`);

// Update metadata
backup.userId = "sys-restored"; // Keep as system restore
backup.version = "1.8.0";
backup.exportDate = new Date().toISOString();

// Save final file
console.log('💾 Saving final import file...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(backup, null, 2));
console.log(`✅ Saved import-ready file: ${OUTPUT_FILE}\n`);

// Print summary
console.log('📊 MAPPING SUMMARY');
console.log('═'.repeat(50));
console.log(`Matches Processed:     ${stats.matchesProcessed}`);
console.log(`Leagues Processed:     ${stats.leaguesProcessed}`);
console.log(`User IDs Mapped:       ${stats.userIdsMapped}`);
console.log(`Unmapped Players:      ${stats.unmappedPlayers.size}`);
console.log(`Errors:                ${stats.errors.length}`);
console.log('═'.repeat(50));

if (stats.unmappedPlayers.size > 0) {
    console.log('\n⚠️  UNMAPPED PLAYERS:');
    Array.from(stats.unmappedPlayers).forEach(name => console.log(`   - ${name}`));
}

if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    stats.errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
    if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
}

if (stats.errors.length === 0 && stats.unmappedPlayers.size === 0) {
    console.log('\n✅ Phase 2 Complete! No errors found.');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Review the final file: leagues-final-import.json');
    console.log('2. Go to Rakla → Settings → Data Management');
    console.log('3. Click "Import Data"');
    console.log('4. Select leagues-final-import.json');
    console.log('5. Choose "Merge" mode (recommended)');
    console.log('6. Click "Import Data"');
    console.log('7. User stats will be calculated automatically!');
    console.log('\n🎉 Ready to import!\n');
} else {
    console.log('\n❌ Please fix the errors above before importing.\n');
    process.exit(1);
}
