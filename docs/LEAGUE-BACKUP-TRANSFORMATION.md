# League Backup Transformation Analysis

**Date**: January 4, 2026  
**Source File**: `leagues.json`  
**Target System**: Rakla Football Manager (Supabase)

---

## 📊 **Backup File Analysis**

### **Data Summary:**
- **Total Matches**: 830
- **Total Leagues**: 48
- **Unique Players**: 8
  - Abdulrahman
  - Adib
  - Ahmed
  - Modar
  - Mustaf (likely typo of Mustafa)
  - Mustafa
  - Noor
  - Yaman

### **File Structure:**
```json
{
  "version": "1.8.0",
  "exportDate": "2026-01-04T10:01:01.401921Z",
  "userId": "sys-restored",
  "matches": [ ... 830 matches ... ],
  "leagues": [ ... 48 leagues ... ]
}
```

---

## 🔍 **Issues Detected**

### **1. User IDs are Names (Not UUIDs)** ❌
**Current Format:**
```json
"home_user_id": "Ahmed",
"away_user_id": "Noor"
```

**Required Format:**
```json
"home_user_id": "uuid-here",
"away_user_id": "uuid-here"
```

**Impact**: All 830 matches and 48 leagues need user ID mapping

---

### **2. Match Scores Have "Unknown" Values** ⚠️
**Issue:**
```json
"home_score": "Unknown",
"away_score": "Unknown",
"status": "scheduled"
```

**Fix**: Convert "Unknown" to `null` for scheduled matches

---

### **3. League Structure Differences** ⚠️
**Backup Has:**
- `standings` array (calculated data)
- `admin_id` as name string
- `participant_ids` as name strings

**Rakla Needs:**
- No `standings` (will be calculated)
- `admin_id` as UUID
- `participant_ids` as UUID array

---

### **4. Timestamp Format** ✅
**Current**: ISO 8601 format (correct)
```json
"created_at": "2026-01-04T10:01:01.407395Z"
```

**Status**: No changes needed

---

### **5. Match/League IDs** ⚠️
**Issue**: IDs from backup won't exist in Supabase

**Options**:
1. **Keep original IDs** - May cause conflicts
2. **Generate new UUIDs** - Breaks relationships
3. **Try to insert with original IDs** - Let Supabase handle conflicts

**Recommendation**: Keep original IDs and let Supabase's conflict detection handle duplicates

---

## 🎯 **Transformation Strategy**

### **Phase 1: Format Cleanup (Do Now)**
✅ **Can be done before users register**

1. **Fix "Unknown" scores**
   - Convert `"Unknown"` → `null`
   - Keep `status: "scheduled"` for incomplete matches

2. **Remove `standings` from leagues**
   - This is calculated data, not stored

3. **Validate data integrity**
   - Check all league IDs in matches exist in leagues array
   - Verify all rounds are sequential

4. **Create user mapping template**
   - List all unique player names
   - Prepare placeholder for UUID mapping

---

### **Phase 2: User ID Mapping (After Registration)**
⏳ **Wait for users to register**

1. **Get current users from Supabase**
   ```sql
   SELECT id, email, username, first_name, last_name
   FROM users
   ORDER BY email;
   ```

2. **Create mapping file**
   ```json
   {
     "Ahmed": "uuid-1",
     "Noor": "uuid-2",
     ...
   }
   ```

3. **Apply mapping to all data**
   - Replace all `home_user_id` / `away_user_id` in matches
   - Replace all `admin_id` in leagues
   - Replace all `participant_ids` in leagues

---

## 📝 **User Stats Calculation**

### **How Rakla Calculates Stats:**

Based on the database schema, user stats are stored in `user_stats` table:

```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY,
  matches_played INTEGER DEFAULT 0,
  leagues_participated INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  championships_won INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Automatic Calculation:**
✅ **Stats are calculated automatically when:**
1. A match is completed
2. A league finishes
3. Match scores are updated

### **What Happens on Import:**
When you import matches and leagues:
1. ✅ Matches are inserted into database
2. ✅ Triggers/functions update `user_stats` automatically
3. ✅ No manual calculation needed

**Conclusion**: You don't need to import user stats - they will be recalculated automatically! 🎉

---

## 🚀 **Recommended Approach**

### **Step 1: Clean the Backup (Now)**
Run transformation script to:
- Fix "Unknown" scores → `null`
- Remove `standings` arrays
- Validate data integrity
- Create formatted file ready for Phase 2

### **Step 2: Wait for User Registration**
- Users register on Rakla
- You collect their UUIDs from Supabase

### **Step 3: Map User IDs**
- Create mapping file (name → UUID)
- Run mapping script
- Generate final import file

### **Step 4: Import Data**
- Use Rakla's Import Data feature
- Select "Merge" mode (safer)
- Import leagues and matches
- Stats calculate automatically

---

## ⚠️ **Important Considerations**

### **1. Duplicate Detection**
The import service checks for duplicates by ID:
- If match/league ID exists → **Skip**
- If match/league ID is new → **Import**

**Strategy**: Keep original IDs to avoid re-importing same data

### **2. Data Integrity**
- All matches reference league IDs
- All user IDs must exist in database
- Scheduled matches can have `null` scores

### **3. Import Order**
1. **First**: Ensure all users are registered
2. **Second**: Import leagues
3. **Third**: Import matches
4. **Automatic**: Stats calculate

---

## 📋 **Next Steps**

1. ✅ Review this analysis
2. ✅ Confirm player name → user mapping strategy
3. ✅ Run Phase 1 transformation script
4. ⏳ Wait for users to register
5. ⏳ Run Phase 2 mapping script
6. ⏳ Import data using Rakla's Import feature

---

**Questions?**
- Need clarification on any step?
- Want to see the transformation scripts?
- Ready to proceed with Phase 1?
