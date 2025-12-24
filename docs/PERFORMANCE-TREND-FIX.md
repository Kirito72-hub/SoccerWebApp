# Performance Trend Analysis & Fix

## Current Status

### **PROBLEM: Performance Trend Uses Dummy Data!**

**Location:** `Dashboard.tsx` lines 93-102

```typescript
// Dummy chart data
const chartData = [
    { name: 'Mon', goals: 2 },
    { name: 'Tue', goals: 4 },
    { name: 'Wed', goals: 1 },
    { name: 'Thu', goals: 5 },
    { name: 'Fri', goals: 3 },
    { name: 'Sat', goals: 8 },
    { name: 'Sun', goals: 6 },
];
```

**Issues:**
- ❌ Not connected to real data
- ❌ Never updates
- ❌ Never resets (because it's hardcoded)
- ❌ Shows fake data to users

---

## Solution Options

### **Option 1: Calculate from Existing Match Data (RECOMMENDED)**

**Pros:**
- ✅ No new database table needed
- ✅ Uses existing match data
- ✅ Automatically resets when matches are deleted
- ✅ Real data, not dummy data

**Implementation:**
```typescript
// Calculate performance from recent matches
const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
const recentMatches = userMatches.filter(m => m.date >= last7Days);

// Group by day
const performanceByDay = {};
recentMatches.forEach(match => {
    const day = new Date(match.date).toLocaleDateString('en-US', { weekday: 'short' });
    const isHome = match.homeUserId === user.id;
    const userGoals = isHome ? match.homeScore : match.awayScore;
    
    if (!performanceByDay[day]) {
        performanceByDay[day] = { goals: 0, matches: 0 };
    }
    performanceByDay[day].goals += userGoals || 0;
    performanceByDay[day].matches++;
});

// Convert to chart data
const chartData = Object.entries(performanceByDay).map(([name, data]) => ({
    name,
    goals: data.goals,
    avgGoals: (data.goals / data.matches).toFixed(1)
}));
```

---

### **Option 2: Create Performance History Table**

**Pros:**
- ✅ More detailed tracking
- ✅ Can track additional metrics
- ✅ Historical data preserved

**Cons:**
- ❌ Requires new database table
- ❌ Needs migration
- ❌ More complex

**Database Schema:**
```sql
CREATE TABLE performance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    goals_scored INT DEFAULT 0,
    goals_conceded INT DEFAULT 0,
    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);
```

**Would need to:**
1. Create table
2. Add to reset function
3. Update on each match completion
4. Query for chart data

---

## Recommendation

**Use Option 1: Calculate from Existing Matches**

**Why:**
- Simpler implementation
- No database changes needed
- Automatically works with existing data
- Automatically resets when matches are deleted
- Real-time calculation from actual match data

**Implementation Steps:**
1. Replace dummy data with calculation from `userMatches`
2. Group matches by day (last 7 days)
3. Calculate goals per day
4. Display in chart

---

## Quick Fix Implementation

**Replace lines 93-102 in Dashboard.tsx:**

```typescript
// Calculate performance from recent matches (last 7 days)
const chartData = useMemo(() => {
    const last7Days = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentMatches = userMatches.filter(m => m.date >= last7Days && m.status === 'completed');
    
    // Initialize last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const last7DaysData = [];
    
    for (let i = 6; i >= 0; i--) {
        const dayIndex = (today - i + 7) % 7;
        last7DaysData.push({
            name: days[dayIndex],
            goals: 0,
            date: Date.now() - (i * 24 * 60 * 60 * 1000)
        });
    }
    
    // Add goals from matches
    recentMatches.forEach(match => {
        const matchDay = new Date(match.date).getDay();
        const dayData = last7DaysData.find(d => new Date(d.date).getDay() === matchDay);
        
        if (dayData) {
            const isHome = match.homeUserId === user.id;
            const userGoals = isHome ? (match.homeScore || 0) : (match.awayScore || 0);
            dayData.goals += userGoals;
        }
    });
    
    return last7DaysData.map(({ name, goals }) => ({ name, goals }));
}, [userMatches, user.id]);
```

**This will:**
- ✅ Show real data from actual matches
- ✅ Update when new matches are completed
- ✅ Reset when database is reset (matches deleted)
- ✅ Show last 7 days of performance
- ✅ No database changes needed

---

## Summary

**Current:** Dummy hardcoded data that never changes  
**Fix:** Calculate from real match data  
**Reset:** Automatic (when matches are deleted)  
**Update:** Automatic (when new matches are completed)  

**Would you like me to implement this fix?**
