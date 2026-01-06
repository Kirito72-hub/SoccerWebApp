# Data Restore System - User Guide

## Overview

The **Data Restore System** allows you to restore league and match data from backup JSON files. This is useful for:
- Migrating data from another instance
- Restoring from backups
- Importing historical data

## Features

✅ **Comprehensive Validation** - Validates file structure, required fields, and data integrity  
✅ **Duplicate Detection** - Automatically skips existing leagues and matches  
✅ **Progress Tracking** - Real-time progress updates during restore  
✅ **Error Handling** - Detailed error messages for troubleshooting  
✅ **Batch Processing** - Efficient processing of large datasets  
✅ **Safe Operation** - Validation-first approach prevents data corruption  

---

## How to Use

### Step 1: Access the Restore Feature

1. Log in to your Rakla account
2. Navigate to **Settings** → **Data Management**
3. Click the **"Restore Data"** button

### Step 2: Select Backup File

1. Click **"Select Backup File"** or drag and drop a JSON file
2. The system will automatically validate the file
3. Review the validation results:
   - ✅ **Green** = File is valid and ready
   - ❌ **Red** = File has errors and cannot be restored
   - ⚠️ **Yellow** = Warnings (restore can proceed)

### Step 3: Review Validation Results

The validation screen shows:
- **Number of leagues** to be restored
- **Number of matches** to be restored
- **Errors** (if any) - must be fixed before restore
- **Warnings** (if any) - informational, restore can proceed

### Step 4: Start Restore

1. If validation passes, click **"Start Restore"**
2. Monitor the progress bar
3. Wait for completion (do not close the window)

### Step 5: Review Results

After completion, you'll see:
- Number of leagues imported
- Number of matches imported
- Number of duplicates skipped
- Any errors encountered
- Total duration

---

## File Format

### Required Structure

```json
{
  "version": "1.8.0",
  "exportDate": "2026-01-04T16:41:08.288Z",
  "userId": "sys-restored",
  "matches": [...],
  "leagues": [...],
  "stats": {}
}
```

### Match Format

```json
{
  "id": "uuid",
  "league_id": "uuid",
  "home_user_id": "uuid",
  "away_user_id": "uuid",
  "home_score": 2,
  "away_score": 1,
  "status": "completed",
  "date": "2026-01-04T10:01:01.405860Z",
  "round": 1,
  "created_at": "2026-01-04T10:01:01.407395Z"
}
```

### League Format

```json
{
  "id": "uuid",
  "name": "League Name",
  "admin_id": "uuid",
  "format": "round_robin_2legs",
  "status": "finished",
  "participant_ids": ["uuid1", "uuid2", "uuid3"],
  "created_at": "2026-01-04T10:01:01.422661Z",
  "finished_at": "2026-01-04T10:01:01.422661Z"
}
```

---

## Validation Rules

### File Validation
- ✅ Must be a `.json` file
- ✅ Maximum size: 50MB
- ✅ Must be valid JSON format
- ✅ Must have required fields: `version`, `exportDate`, `userId`

### Match Validation
- ✅ Must have: `id`, `league_id`, `home_user_id`, `away_user_id`
- ✅ Status must be: `scheduled` or `completed`
- ✅ Scores can be `null` for scheduled matches
- ⚠️ Duplicate IDs in file will show warning
- ⚠️ Existing matches in database will be skipped

### League Validation
- ✅ Must have: `id`, `name`, `admin_id`, `format`
- ✅ Format must be: `round_robin_1leg`, `round_robin_2legs`, or `cup`
- ✅ Status must be: `running` or `finished`
- ⚠️ Duplicate IDs in file will show warning
- ⚠️ Existing leagues in database will be skipped

---

## Common Issues & Solutions

### Issue: "Invalid JSON format"
**Solution:** Ensure your file is valid JSON. Use a JSON validator online.

### Issue: "Missing required fields"
**Solution:** Check that your file has `version`, `exportDate`, and `userId` fields.

### Issue: "Match missing required fields"
**Solution:** Each match must have `id`, `league_id`, `home_user_id`, and `away_user_id`.

### Issue: "File size exceeds 50MB limit"
**Solution:** Split your backup into smaller files or compress the data.

### Issue: "All items skipped"
**Solution:** The data already exists in the database. This is normal for re-imports.

### Issue: "Invalid user IDs"
**Solution:** Ensure all user IDs in the backup exist in your database.

---

## Best Practices

### Before Restore
1. ✅ **Backup current data** - Export your current data first
2. ✅ **Validate file** - Always review validation results
3. ✅ **Check user IDs** - Ensure referenced users exist
4. ✅ **Test with small file** - Try a small subset first

### During Restore
1. ✅ **Don't close window** - Wait for completion
2. ✅ **Monitor progress** - Watch for errors
3. ✅ **Stable connection** - Ensure good internet connection

### After Restore
1. ✅ **Verify data** - Check that leagues and matches appear correctly
2. ✅ **Review errors** - Address any errors reported
3. ✅ **Check statistics** - Ensure user stats are updated

---

## Performance

### Processing Speed
- **Leagues:** ~10 per second
- **Matches:** ~50 per second
- **Large files:** Processed in batches for efficiency

### Estimated Times
- **100 items:** ~5 seconds
- **500 items:** ~20 seconds
- **1000 items:** ~40 seconds
- **5000 items:** ~3 minutes

---

## Technical Details

### Duplicate Handling
- Duplicates are detected by comparing `id` fields
- Existing items in database are automatically skipped
- No data is overwritten

### Batch Processing
- Leagues: Processed in batches of 10
- Matches: Processed in batches of 50
- Progress updates after each batch

### Error Recovery
- Errors on individual items don't stop the entire restore
- Failed items are skipped and reported
- Successful items are still imported

---

## Security

### Data Validation
- All data is validated before import
- SQL injection protection via parameterized queries
- Type checking for all fields

### Access Control
- Only authenticated users can restore data
- User must have appropriate permissions
- All operations are logged

---

## Support

### Need Help?
- Check the validation messages for specific issues
- Review the error log in the results
- Contact support with the error details

### Reporting Issues
Include:
1. File size and structure
2. Validation errors/warnings
3. Browser console errors
4. Number of items being restored

---

**Last Updated:** 2026-01-06  
**Version:** 1.0.0  
**Compatible with:** Rakla v1.7.0-beta and above
