# Backup System Analysis

## Current Template Format

Based on `Backups/leagues-matches-generated.json`, the backup format is:

```json
{
  "version": "1.8.0",
  "exportDate": "2026-01-08T23:10:04.984669Z",
  "userId": "sys-restored",
  "matches": [
    {
      "id": "uuid",
      "league_id": "uuid",
      "home_user_id": "uuid",
      "away_user_id": "uuid",
      "home_score": number,
      "away_score": number,
      "status": "completed",
      "date": "ISO timestamp",
      "round": number,
      "created_at": "ISO timestamp"
    }
  ],
  "leagues": [
    {
      "id": "uuid",
      "name": "string",
      "admin_id": "uuid",
      "format": "round_robin_2legs",
      "status": "finished",
      "participant_ids": ["uuid"],
      "created_at": "ISO timestamp",
      "finished_at": "ISO timestamp",
      "standings": [
        {
          "userId": "uuid",
          "played": number,
          "won": number,
          "drawn": number,
          "lost": number,
          "gf": number,
          "ga": number,
          "gd": number,
          "points": number
        }
      ],
      "winner": "uuid"
    }
  ]
}
```

## Current Implementation Issues

### 1. **Order of Data**
- ❌ Current: `leagues`, `matches`, `activityLogs`
- ✅ Template: `matches`, `leagues` (no activityLogs)

### 2. **Missing Fields**
- ❌ Leagues missing: `standings`, `winner`, `finished_at`
- ❌ Matches missing: `round` field

### 3. **Version Format**
- ❌ Current: `"1.0.0"`
- ✅ Template: `"1.8.0"` (matches app version)

### 4. **Extra Fields**
- ❌ Current includes: `activityLogs` (not in template)

## Required Changes

### 1. Update BackupData Interface
```typescript
export interface BackupData {
    version: string;
    exportDate: string;
    userId: string;
    matches: Match[];      // First in order
    leagues: League[];     // Second in order
    // Remove activityLogs
}
```

### 2. Add Standings Calculation
For finished leagues, calculate standings from matches:
- `played`: Total matches played
- `won`: Matches won
- `drawn`: Matches drawn
- `lost`: Matches lost
- `gf`: Goals for
- `ga`: Goals against
- `gd`: Goal difference
- `points`: Won * 3 + Drawn * 1

### 3. Add Winner Calculation
- Winner is the user with highest points
- Tiebreaker: Goal difference
- Tiebreaker: Goals for

### 4. Add Round Field to Matches
- Calculate round number based on match order in league
- Round-robin 2 legs: Each pair plays twice

### 5. Update Version
- Use current app version from package.json

## Implementation Plan

### Step 1: Update Interface
- Modify `BackupData` interface
- Remove `activityLogs`
- Reorder fields: `matches` before `leagues`

### Step 2: Add Standings Calculator
- Create `calculateStandings(matches, participantIds)` function
- Calculate all stats from match data
- Sort by points, GD, GF

### Step 3: Add Winner Determination
- Get top player from standings
- Set as `winner` field in league

### Step 4: Add Round Calculation
- Calculate round number for each match
- Based on league format and match order

### Step 5: Update Export Function
- Fetch leagues with all fields
- Calculate standings for finished leagues
- Determine winner for finished leagues
- Add round numbers to matches
- Order data correctly: matches first, then leagues
- Use app version from package.json

## Benefits

1. **Consistency**: Backups match the template format exactly
2. **Completeness**: All required fields included
3. **Compatibility**: Can restore from backups seamlessly
4. **Statistics**: Standings and winner automatically calculated
5. **Version Tracking**: Uses actual app version

## Testing Checklist

- [ ] Export creates JSON in correct format
- [ ] Matches array comes before leagues array
- [ ] All match fields present (including round)
- [ ] All league fields present (including standings, winner)
- [ ] Standings calculated correctly
- [ ] Winner determined correctly
- [ ] Version matches package.json
- [ ] No extra fields (activityLogs removed)
- [ ] Can import backup successfully
