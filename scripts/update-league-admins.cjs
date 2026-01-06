/**
 * Update League Admin IDs in Import File
 * 
 * This script updates all leagues in the import file to have Ahmed (superuser) as admin
 * This ensures the import works with the existing RLS policies
 */

const fs = require('fs');
const path = require('path');

// File paths
const INPUT_FILE = path.join(__dirname, '../leagues-final-import.json');
const OUTPUT_FILE = path.join(__dirname, '../leagues-final-import-updated.json');

// Ahmed's superuser ID
const AHMED_ID = '398ebadd-1c7f-4133-864b-445e9ad31959';

console.log('🔄 Updating league admin IDs...\n');

// Read the import file
const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

console.log(`📊 Total leagues: ${data.leagues.length}`);
console.log(`📊 Total matches: ${data.matches.length}\n`);

// Update all league admin_id to Ahmed
let updatedCount = 0;
data.leagues.forEach(league => {
    if (league.admin_id !== AHMED_ID) {
        league.admin_id = AHMED_ID;
        updatedCount++;
    }
});

console.log(`✅ Updated ${updatedCount} league admin IDs to Ahmed\n`);

// Save the updated file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

console.log(`💾 Saved updated file: ${OUTPUT_FILE}\n`);
console.log('📋 Summary:');
console.log(`   - All ${data.leagues.length} leagues now have Ahmed as admin`);
console.log(`   - All ${data.matches.length} matches ready to import`);
console.log(`   - File ready for import!\n`);

console.log('🎯 Next steps:');
console.log('1. Use leagues-final-import-updated.json for import');
console.log('2. Go to Rakla → Settings → Data Management');
console.log('3. Click "Import Data"');
console.log('4. Select leagues-final-import-updated.json');
console.log('5. Choose "Merge" mode');
console.log('6. Click "Import Data"');
console.log('\n✅ All 830 matches should import successfully!\n');
