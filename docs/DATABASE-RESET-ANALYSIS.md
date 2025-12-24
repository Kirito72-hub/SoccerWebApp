# Database Reset Function Analysis

## Current Implementation

### Location
- **Function:** `database.ts` → `resetDatabase(preserveSuperusers: boolean = true)`
- **Called from:** `Settings.tsx` → `handleResetDatabase()`
- **Button:** Settings page → "Reset Database" button (superuser only)

---

## What Currently Gets Reset

### ✅ **Currently Deleted:**

1. **Activity Logs** (`activity_logs` table)
   - All activity history
   - Match results logs
   - League creation/finish logs
   - User actions

2. **Matches** (`matches` table)
   - All match records
   - Match scores
   - Match status (pending/completed)
   - All rounds (for cup format)

3. **Leagues** (`leagues` table)
   - All league records
   - League participants
   - League status (running/finished)
   - League formats (round-robin/cup)

4. **User Stats** (`user_stats` table)
   - All user statistics
   - Matches played
   - Goals scored/conceded
   - Championships won
   - Leagues participated
   - **Note:** Superuser stats are reset to 0 (not deleted)

5. **Users** (`users` table)
   - All non-superuser accounts
   - **Preserved:** Superuser accounts (when `preserveSuperusers = true`)

---

## ❌ What's NOT Currently Reset

### **Missing Tables:**

1. **Notifications** (`notifications` table)
   - ❌ NOT deleted
   - Old notifications remain in database
   - Can clutter notification center
   - **Should be added:** Clear all notifications on reset

---

## 🎯 Suggested Improvements

### **1. Add Notifications Reset**

**Current Issue:**
- Notifications table is never cleared
- Old notifications persist after database reset
- Can confuse users with outdated notifications

**Suggested Fix:**
```typescript
// Add this line in resetDatabase() function
await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
```

**Where to add:** After line 481 (after activity_logs deletion)

---

### **2. Add Granular Reset Options**

**Current:** All-or-nothing reset (everything except superusers)

**Suggested:** Add options for partial resets:

```typescript
interface ResetOptions {
    preserveSuperusers?: boolean;
    resetNotifications?: boolean;
    resetActivityLogs?: boolean;
    resetMatches?: boolean;
    resetLeagues?: boolean;
    resetUserStats?: boolean;
    resetUsers?: boolean;
}

async resetDatabase(options: ResetOptions = {
    preserveSuperusers: true,
    resetNotifications: true,
    resetActivityLogs: true,
    resetMatches: true,
    resetLeagues: true,
    resetUserStats: true,
    resetUsers: true
}): Promise<void>
```

**Benefits:**
- Reset only specific data
- Keep historical data if needed
- More flexible for testing
- Safer for production use

---

### **3. Add Reset Presets**

**Suggested Presets:**

```typescript
// Preset 1: Soft Reset (keep users and their stats)
async softReset(): Promise<void> {
    await this.resetDatabase({
        preserveSuperusers: true,
        resetNotifications: true,
        resetActivityLogs: true,
        resetMatches: true,
        resetLeagues: true,
        resetUserStats: false,  // Keep stats
        resetUsers: false       // Keep all users
    });
}

// Preset 2: Season Reset (new season, keep users)
async seasonReset(): Promise<void> {
    await this.resetDatabase({
        preserveSuperusers: true,
        resetNotifications: true,
        resetActivityLogs: false,  // Keep history
        resetMatches: true,
        resetLeagues: true,
        resetUserStats: true,      // Reset stats for new season
        resetUsers: false          // Keep all users
    });
}

// Preset 3: Hard Reset (everything except superusers)
async hardReset(): Promise<void> {
    await this.resetDatabase({
        preserveSuperusers: true,
        resetNotifications: true,
        resetActivityLogs: true,
        resetMatches: true,
        resetLeagues: true,
        resetUserStats: true,
        resetUsers: true
    });
}

// Preset 4: Nuclear Reset (EVERYTHING including superusers)
async nuclearReset(): Promise<void> {
    await this.resetDatabase({
        preserveSuperusers: false,  // Delete superusers too!
        resetNotifications: true,
        resetActivityLogs: true,
        resetMatches: true,
        resetLeagues: true,
        resetUserStats: true,
        resetUsers: true
    });
}
```

---

### **4. Add Reset Statistics**

**Return information about what was deleted:**

```typescript
interface ResetStats {
    notificationsDeleted: number;
    activityLogsDeleted: number;
    matchesDeleted: number;
    leaguesDeleted: number;
    userStatsReset: number;
    usersDeleted: number;
    superusersPreserved: number;
}

async resetDatabase(options: ResetOptions): Promise<ResetStats>
```

**Benefits:**
- User knows exactly what was deleted
- Better feedback in UI
- Audit trail for resets

---

### **5. Add Safety Confirmations**

**In Settings.tsx:**

```typescript
const handleResetDatabase = async () => {
    // First confirmation
    const confirm1 = window.confirm(
        'Are you sure you want to reset the database? This will delete:\n' +
        '- All matches\n' +
        '- All leagues\n' +
        '- All notifications\n' +
        '- All activity logs\n' +
        '- All user stats\n' +
        '- All non-superuser accounts\n\n' +
        'This action CANNOT be undone!'
    );
    
    if (!confirm1) return;
    
    // Second confirmation (type to confirm)
    const confirm2 = window.prompt(
        'Type "RESET DATABASE" to confirm:'
    );
    
    if (confirm2 !== 'RESET DATABASE') {
        alert('Reset cancelled.');
        return;
    }
    
    // Proceed with reset...
};
```

---

## 📊 Summary

### **Immediate Fix Needed:**
✅ Add notifications table to reset function

### **Nice to Have:**
- Granular reset options
- Reset presets (soft/season/hard/nuclear)
- Reset statistics feedback
- Enhanced safety confirmations

### **Current Reset Order (Important!):**
```
1. activity_logs    (no foreign keys)
2. matches          (references leagues, users)
3. leagues          (references users)
4. user_stats       (references users)
5. notifications    ← MISSING! Should be added
6. users            (last, has foreign keys from other tables)
```

**Order matters due to foreign key constraints!**

---

## 🔧 Recommended Implementation Priority

1. **Priority 1 (Critical):** Add notifications reset
2. **Priority 2 (High):** Add reset statistics feedback
3. **Priority 3 (Medium):** Add safety confirmations
4. **Priority 4 (Low):** Add granular options and presets

---

**Would you like me to implement any of these improvements?**
