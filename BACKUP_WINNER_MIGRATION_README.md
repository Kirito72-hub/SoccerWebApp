# Backup Winner Migration Tool

## Purpose
This tool adds the `winner` and `standings` fields to finished leagues in your backup file. This is necessary for restoring backups after the database migration that added these columns.

## What It Does
1. Reads your backup JSON file
2. For each **finished** league:
   - Calculates standings from match results
   - Determines the champion (1st place)
   - Adds `winner` field (champion's user ID)
   - Adds `standings` array with full table
3. Saves the updated backup to a new file

## How to Use

### Basic Usage
```bash
python add_winner_to_backup.py <input_file> [output_file]
```

### Example
```bash
python add_winner_to_backup.py "Backups\rakla_export_398ebadd-1c7f-4133-864b-445e9ad31959_2026-01-04T21-22-35.json" "Backups\rakla_export_FINAL.json"
```

### Verify Results
```bash
python verify_winners.py
```

## Output
The script will:
- ✅ Show progress for each league processed
- ✅ Display champion and points for each finished league
- ✅ Create a new backup file with `winner` and `standings` fields
- ✅ Leave running leagues with `winner: null`

## Example Output
```
Reading backup file: Backups\rakla_export_...
Processing 48 leagues with 1200 matches...
✓ League 'Premier League' - Champion: abc123... (45 pts)
✓ League 'Champions Cup' - Champion: def456... (38 pts)
...
✅ Done! Updated 48 finished leagues
📄 Output file: Backups\rakla_export_FINAL.json
```

## Important Notes
- ⚠️ The script calculates standings from **completed matches only**
- ⚠️ Running leagues will have `winner: null`
- ⚠️ The original backup file is **not modified**
- ✅ Safe to run multiple times
- ✅ Works with any number of leagues

## Standings Calculation
The script calculates standings using:
1. **Points** (3 for win, 1 for draw, 0 for loss)
2. **Goal Difference** (goals for - goals against)
3. **Goals For** (total goals scored)

Champion = Player with highest points (tiebreaker: GD, then GF)

## Files Created
- `rakla_export_FINAL.json` - Updated backup with winners
- `add_winner_to_backup.py` - Main migration script
- `verify_winners.py` - Verification script

## Next Steps
1. Run the script on your backup file
2. Verify the results
3. Use the FINAL backup file for restoration
