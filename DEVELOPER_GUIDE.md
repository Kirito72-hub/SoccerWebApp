# 👨‍💻 Rakla Football Manager - Developer Guide

**Complete development documentation for contributors and maintainers**

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Development History](#-development-history)
3. [Architecture](#-architecture)
4. [Database Design](#-database-design)
5. [Authentication System](#-authentication-system)
6. [RLS Policies](#-rls-policies)
7. [Key Components](#-key-components)
8. [Services Layer](#-services-layer)
9. [Common Tasks](#-common-tasks)
10. [Troubleshooting](#-troubleshooting)
11. [Testing](#-testing)
12. [Deployment](#-deployment)

---

## 🎯 Project Overview

### **What is Rakla?**

Rakla is a full-stack football league management system that allows users to create leagues, track matches, and view statistics. The app supports three user roles (Normal User, Pro Manager, Superuser) and multiple league formats (Round Robin 1-leg, 2-legs, and Cup).

### **Current Status:**

✅ **Production Ready** - Version 2.0.0  
✅ **100% Migrated to Supabase**  
✅ **All RLS Policies Fixed**  
✅ **Deployed on Vercel**  
✅ **Live at:** https://rakla.vercel.app

---

## 📜 Development History

### **Phase 1: Initial Development (localStorage)**

**Original Implementation:**
- Client-side only application
- All data stored in localStorage
- No backend or database
- Basic CRUD operations
- Simple authentication

**Limitations:**
- No data persistence across devices
- No real-time updates
- No data backup
- Limited scalability

### **Phase 2: Supabase Migration**

**Migration Process:**

1. **Database Schema Creation** (`supabase-schema.sql`)
   - Created 5 tables: users, leagues, matches, user_stats, activity_logs
   - Added indexes for performance
   - Set up foreign key relationships
   - Implemented triggers for auto-updates

2. **Service Layer Refactoring**
   - Created `database.ts` for Supabase operations
   - Created `dataService.ts` as abstraction layer
   - Maintained `storage.ts` for offline fallback
   - Implemented camelCase ↔ snake_case conversion

3. **Component Migration** (10 components)
   - `Auth.tsx` - Login/Signup
   - `Dashboard.tsx` - User stats
   - `LeagueManagement.tsx` - League CRUD
   - `RunningLeagues.tsx` - Match management
   - `FinishedLeaguesLog.tsx` - Completed leagues
   - `ActivityLog.tsx` - Activity feed
   - `Profile.tsx` - User profile
   - `Settings.tsx` - Admin panel
   - `Layout.tsx` - App shell
   - `App.tsx` - Main app

4. **RLS Policy Implementation**
   - Initial policies with `auth.uid()`
   - Discovered custom auth incompatibility
   - Refactored to use `admin_id`/`user_id`
   - Fixed all CRUD operations

### **Phase 3: RLS Policy Fixes**

**Critical Issues Found:**

1. **League Creation Failed** - INSERT policy too restrictive
2. **Match Generation Failed** - INSERT policy using `auth.uid()`
3. **Match Updates Failed** - UPDATE policy using `auth.uid()`
4. **Activity Logs Failed** - INSERT policy using `auth.uid()`
5. **League Deletion Failed** - DELETE policy using `auth.uid()`
6. **False Activity Logs** - Logging before operation success

**Solutions Applied:**

All policies changed from:
```sql
-- ❌ BROKEN (uses auth.uid())
WITH CHECK (auth.uid() IS NOT NULL)
```

To:
```sql
-- ✅ FIXED (uses admin_id/user_id)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = admin_id 
    AND LOWER(role) IN ('superuser', 'pro_manager')
  )
)
```

**Files Created:**
- `supabase-fix-leagues-rls.sql` - Initial fix
- `supabase-fix-delete-policy.sql` - DELETE fix
- `supabase-rls-complete-fix.sql` - All policies
- `debug-rls-policy.sql` - Diagnostic queries
- `RLS_FIX_COMPLETE.md` - Documentation

### **Phase 4: Optimization & PWA (v1.3.0-beta)**

**Enhancements:**
- ✨ **Avatar Consistency** - Unified avatar system
- 🔔 **Notification Settings** - User preferences UI
- 📱 **PWA Integration** - Fully installable app
  - Manifest implementation
  - Service Worker for offline support
  - Custom install prompt
  - Push notification readiness

---

## 🏗️ Architecture

### **Frontend Architecture:**

```
┌─────────────────────────────────────┐
│         React Application           │
├─────────────────────────────────────┤
│  Components (UI Layer)              │
│  ├── Pages (Route Components)       │
│  └── Layout (App Shell)             │
├─────────────────────────────────────┤
│  Services (Business Logic)          │
│  ├── dataService (Abstraction)      │
│  ├── database (Supabase)            │
│  ├── storage (localStorage)         │
│  └── fixtures (Logic)               │
├─────────────────────────────────────┤
│  Types (TypeScript Definitions)     │
└─────────────────────────────────────┘
```

### **Data Flow:**

```
User Action
    ↓
Component Event Handler
    ↓
dataService Method
    ↓
database.ts (Supabase) OR storage.ts (localStorage)
    ↓
Supabase Database
    ↓
Response
    ↓
Component State Update
    ↓
UI Re-render
```

### **Authentication Flow:**

```
1. User submits login form
2. Auth.tsx calls dataService.login()
3. dataService checks if Supabase is online
4. If online: database.login() → Supabase query
5. If offline: storage.login() → localStorage
6. User object returned
7. Saved to localStorage for session
8. App.tsx loads user from localStorage
9. User authenticated
```

---

## 🗄️ Database Design

### **Schema Overview:**

```sql
users
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── password (TEXT, bcrypt hashed)
├── username (TEXT)
├── first_name (TEXT)
├── last_name (TEXT)
├── date_of_birth (DATE)
├── avatar (TEXT, URL)
├── role (TEXT: superuser, pro_manager, normal_user)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

leagues
├── id (UUID, PK)
├── name (TEXT)
├── admin_id (UUID, FK → users.id)
├── format (TEXT: round_robin_1leg, round_robin_2legs, cup)
├── status (TEXT: running, finished)
├── participant_ids (UUID[])
├── created_at (TIMESTAMP)
└── finished_at (TIMESTAMP)

matches
├── id (UUID, PK)
├── league_id (UUID, FK → leagues.id)
├── home_user_id (UUID, FK → users.id)
├── away_user_id (UUID, FK → users.id)
├── home_score (INTEGER)
├── away_score (INTEGER)
├── status (TEXT: pending, completed)
├── date (TIMESTAMP)
├── round (INTEGER)
└── created_at (TIMESTAMP)

user_stats
├── user_id (UUID, PK, FK → users.id)
├── matches_played (INTEGER)
├── leagues_participated (INTEGER)
├── goals_scored (INTEGER)
├── goals_conceded (INTEGER)
├── championships_won (INTEGER)
└── updated_at (TIMESTAMP)

activity_logs
├── id (UUID, PK)
├── type (TEXT: league_created, league_deleted, match_result, etc.)
├── user_id (UUID, FK → users.id)
├── username (TEXT)
├── description (TEXT)
├── timestamp (TIMESTAMP)
└── metadata (JSONB)
```

### **Indexes:**

```sql
-- Performance indexes
idx_leagues_admin_id ON leagues(admin_id)
idx_leagues_status ON leagues(status)
idx_matches_league_id ON matches(league_id)
idx_matches_status ON matches(status)
idx_activity_logs_user_id ON activity_logs(user_id)
idx_activity_logs_timestamp ON activity_logs(timestamp DESC)
```

### **Triggers:**

```sql
-- Auto-update updated_at timestamp
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user_stats when user is created
CREATE TRIGGER on_user_created 
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_stats();
```

---

## 🔐 Authentication System

### **Custom Authentication (Not Supabase Auth)**

**Important:** This app uses **custom authentication** with localStorage sessions, NOT Supabase's built-in auth system.

**Why Custom Auth?**
- Full control over user data
- Custom user roles
- Simpler implementation
- No external auth dependencies

**How It Works:**

1. **Registration:**
   ```typescript
   // User submits signup form
   const hashedPassword = await bcrypt.hash(password, 10);
   const user = await database.createUser({
     email, password: hashedPassword, username, ...
   });
   localStorage.setItem('currentUser', JSON.stringify(user));
   ```

2. **Login:**
   ```typescript
   // User submits login form
   const user = await database.login(email, password);
   // database.login() queries Supabase users table
   // Verifies password with bcrypt.compare()
   localStorage.setItem('currentUser', JSON.stringify(user));
   ```

3. **Session Management:**
   ```typescript
   // App.tsx loads user on mount
   const savedUser = localStorage.getItem('currentUser');
   if (savedUser) {
     setCurrentUser(JSON.parse(savedUser));
   }
   ```

4. **Logout:**
   ```typescript
   localStorage.removeItem('currentUser');
   setCurrentUser(null);
   ```

**Security Considerations:**

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ RLS policies protect data access
- ✅ Role-based permissions enforced
- ⚠️ Session stored in localStorage (client-side)
- ⚠️ No JWT tokens or refresh tokens

---

## 🔒 RLS Policies

### **Critical Understanding:**

**Because we use custom auth (not Supabase Auth), `auth.uid()` returns `NULL` in all RLS policies.**

This means we CANNOT use:
```sql
-- ❌ DOES NOT WORK
CREATE POLICY "policy_name" ON table_name
FOR INSERT WITH CHECK (auth.uid() = some_field);
```

Instead, we must use:
```sql
-- ✅ WORKS
CREATE POLICY "policy_name" ON table_name
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = table_name.user_field
    AND LOWER(role) IN ('superuser', 'pro_manager')
  )
);
```

### **Current RLS Policies:**

#### **1. Users Table:**

```sql
-- Anyone can view users
CREATE POLICY "Users can view all users" 
ON users FOR SELECT USING (true);

-- Anyone can create account (signup)
CREATE POLICY "Anyone can create an account" 
ON users FOR INSERT WITH CHECK (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE USING (auth.uid() = id);
-- Note: This doesn't work with custom auth, but kept for future Supabase Auth migration

-- Superusers can update any user
CREATE POLICY "Superusers can update any user" 
ON users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superuser')
);
-- Note: This also doesn't work, but kept for future
```

#### **2. Leagues Table:**

```sql
-- Anyone can view leagues
CREATE POLICY "Anyone can view leagues" 
ON leagues FOR SELECT USING (true);

-- Only Pro Managers and Superusers can create leagues
CREATE POLICY "Pro managers and superusers can create leagues" 
ON leagues FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = admin_id 
    AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
  )
);

-- League admins and superusers can update leagues
CREATE POLICY "Admins and superusers can update leagues" 
ON leagues FOR UPDATE USING (
  admin_id IN (
    SELECT id FROM users 
    WHERE LOWER(role) IN ('superuser', 'pro_manager')
  )
);

-- League admins and superusers can delete leagues
CREATE POLICY "Admins and superusers can delete leagues" 
ON leagues FOR DELETE USING (
  admin_id IN (
    SELECT id FROM users 
    WHERE LOWER(role) IN ('superuser', 'pro_manager')
  )
);
```

#### **3. Matches Table:**

```sql
-- Anyone can view matches
CREATE POLICY "Anyone can view matches" 
ON matches FOR SELECT USING (true);

-- League admins can create matches
CREATE POLICY "League admins can create matches" 
ON matches FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM leagues 
    WHERE id = league_id 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = leagues.admin_id 
      AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
    )
  )
);

-- League admins can update matches
CREATE POLICY "League admins can update matches" 
ON matches FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM leagues 
    WHERE id = league_id 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = leagues.admin_id 
      AND (LOWER(role) = 'pro_manager' OR LOWER(role) = 'superuser')
    )
  )
);
```

#### **4. Activity Logs Table:**

```sql
-- Anyone can view activity logs
CREATE POLICY "Anyone can view activity logs" 
ON activity_logs FOR SELECT USING (true);

-- Users can create activity logs
CREATE POLICY "Users can create activity logs" 
ON activity_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id
  )
);
```

#### **5. User Stats Table:**

```sql
-- Anyone can view stats
CREATE POLICY "Anyone can view stats" 
ON user_stats FOR SELECT USING (true);

-- System can update stats (permissive for now)
CREATE POLICY "System can update stats" 
ON user_stats FOR ALL USING (true);
```

### **Applying RLS Policies:**

To apply all policies, run:
```bash
# In Supabase SQL Editor
# Copy and paste contents of supabase-rls-complete-fix.sql
```

---

## 🧩 Key Components

### **1. Auth.tsx**

**Purpose:** Login and signup page

**Key Features:**
- Dual-mode form (login/signup)
- Password hashing with bcrypt
- Form validation
- Error handling
- Automatic session creation

**Important Code:**
```typescript
const handleSignup = async () => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await dataService.createUser({
    email, password: hashedPassword, username, ...
  });
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  onLogin(newUser);
};
```

### **2. Dashboard.tsx**

**Purpose:** User statistics overview

**Data Loaded:**
- User stats (matches, goals, championships)
- Recent matches
- All users (for opponent stats)

**Calculations:**
- Win rate percentage
- Favorite opponent (most wins against)
- Toughest rival (most losses against)

### **3. LeagueManagement.tsx**

**Purpose:** Create and manage leagues

**Key Features:**
- League creation modal
- Participant selection
- Format selection (1-leg RR, 2-legs RR, Cup)
- Automatic fixture generation
- League deletion with confirmation
- Match result entry

**Important Code:**
```typescript
const handleCreateLeague = async () => {
  // Create league
  const newLeague = await dataService.createLeague({...});
  
  // Generate fixtures
  const fixtures = generateFixtures(newLeague.id, participants, format);
  
  // Create all matches
  for (const fixture of fixtures) {
    await dataService.createMatch({...fixture, leagueId: newLeague.id});
  }
  
  // Log activity (only after success!)
  await dataService.createActivityLog({...});
};
```

### **4. RunningLeagues.tsx**

**Purpose:** View and manage active leagues

**Key Features:**
- League selection dropdown
- Match list with status
- Add match results
- View league standings
- Finish league
- Cup bracket view (for cup format)

**Standings Calculation:**
```typescript
const calculateStandings = (matches, participants) => {
  const standings = participants.map(userId => ({
    userId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));

  matches.forEach(match => {
    if (match.status === 'completed') {
      // Update stats for both teams
      // Win = 3 points, Draw = 1 point, Loss = 0 points
    }
  });

  // Sort by points, then goal difference, then goals scored
  return standings.sort((a, b) => 
    b.points - a.points || 
    b.goalDifference - a.goalDifference || 
    b.goalsFor - a.goalsFor
  );
};
```

### **5. Settings.tsx** (Superuser Only)

**Purpose:** User management and role assignment

**Key Features:**
- View all users
- Search users
- Update user roles
- Role badges

**Access Control:**
```typescript
// In Layout.tsx
{user.role === 'superuser' && (
  <NavLink to="/settings">Settings</NavLink>
)}
```

---

## 🔧 Services Layer

### **dataService.ts**

**Purpose:** Abstraction layer between components and data sources

**Pattern:**
```typescript
async someOperation() {
  try {
    if (await db.isOnline()) {
      return await db.someOperation();
    } else {
      return storage.someOperation();
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**Key Methods:**
- `getUsers()` - Fetch all users
- `createUser()` - Create new user
- `updateUser()` - Update user profile
- `getLeagues()` - Fetch all leagues
- `createLeague()` - Create new league
- `deleteLeague()` - Delete league
- `getMatches()` - Fetch all matches
- `createMatch()` - Create new match
- `updateMatch()` - Update match result
- `getUserStats()` - Fetch user stats
- `updateUserStats()` - Update user stats
- `getActivityLogs()` - Fetch activity logs
- `createActivityLog()` - Create activity log

### **database.ts**

**Purpose:** Supabase operations

**Important:** Handles camelCase ↔ snake_case conversion

**Example:**
```typescript
async createLeague(league: Omit<League, 'id'>): Promise<League> {
  const { data, error } = await supabase
    .from('leagues')
    .insert([{
      name: league.name,
      admin_id: league.adminId,  // camelCase → snake_case
      format: league.format,
      status: league.status,
      participant_ids: league.participantIds,
      created_at: new Date(league.createdAt).toISOString()
    }])
    .select()
    .single();

  if (error) throw error;

  // Convert back to camelCase
  return {
    id: data.id,
    name: data.name,
    adminId: data.admin_id,  // snake_case → camelCase
    format: data.format,
    status: data.status,
    participantIds: data.participant_ids,
    createdAt: new Date(data.created_at).getTime(),
    finishedAt: data.finished_at ? new Date(data.finished_at).getTime() : undefined
  };
}
```

### **storage.ts**

**Purpose:** localStorage fallback (offline mode)

**Note:** Kept for backward compatibility and offline support, but Supabase is primary

---

## 📝 Common Tasks

### **Task 1: Add a New User Role**

1. Update `types/index.ts`:
   ```typescript
   export type UserRole = 'superuser' | 'pro_manager' | 'normal_user' | 'new_role';
   ```

2. Update database schema:
   ```sql
   ALTER TABLE users 
   DROP CONSTRAINT users_role_check;
   
   ALTER TABLE users 
   ADD CONSTRAINT users_role_check 
   CHECK (role IN ('superuser', 'pro_manager', 'normal_user', 'new_role'));
   ```

3. Update RLS policies to include new role where needed

4. Update UI components to handle new role

### **Task 2: Add a New League Format**

1. Update `types/index.ts`:
   ```typescript
   export type LeagueFormat = 'round_robin_1leg' | 'round_robin_2legs' | 'cup' | 'new_format';
   ```

2. Update `services/fixtures.ts`:
   ```typescript
   export const generateFixtures = (leagueId: string, participants: string[], format: LeagueFormat) => {
     if (format === 'new_format') {
       // Implement fixture generation logic
     }
     // ... existing logic
   };
   ```

3. Update UI in `LeagueManagement.tsx` to show new format option

### **Task 3: Add a New Statistics Field**

1. Update database schema:
   ```sql
   ALTER TABLE user_stats 
   ADD COLUMN new_stat INTEGER DEFAULT 0;
   ```

2. Update `types/index.ts`:
   ```typescript
   export interface UserStats {
     // ... existing fields
     newStat: number;
   }
   ```

3. Update `database.ts` conversion functions

4. Update calculation logic in relevant components

5. Update UI to display new stat

### **Task 4: Add a New Activity Log Type**

1. Update `types/index.ts`:
   ```typescript
   export type ActivityType = 'league_created' | 'league_deleted' | 'match_result' | 'new_type';
   ```

2. Update database constraint:
   ```sql
   ALTER TABLE activity_logs 
   DROP CONSTRAINT activity_logs_type_check;
   
   ALTER TABLE activity_logs 
   ADD CONSTRAINT activity_logs_type_check 
   CHECK (type IN ('league_created', 'league_deleted', 'match_result', 'new_type'));
   ```

3. Add logging calls where appropriate:
   ```typescript
   await dataService.createActivityLog({
     type: 'new_type',
     userId: user.id,
     username: user.username,
     description: 'Description of the new activity',
     timestamp: Date.now(),
     metadata: { /* relevant data */ }
   });
   ```

---

## 🐛 Troubleshooting

### **Issue 1: RLS Policy Violation (Error 42501)**

**Symptoms:**
- Console error: `new row violates row-level security policy for table "table_name"`
- Operations fail silently
- Data not being inserted/updated/deleted

**Diagnosis:**
1. Check which table is failing (error message shows table name)
2. Check which operation (INSERT, UPDATE, DELETE)
3. Verify user role in database:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'user@example.com';
   ```

**Solution:**
1. Review RLS policy for that table and operation
2. Ensure policy checks `admin_id` or `user_id`, NOT `auth.uid()`
3. Ensure role check uses `LOWER(role)` for case-insensitivity
4. Apply fix from `supabase-rls-complete-fix.sql`

**Example Fix:**
```sql
-- Check current policy
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'leagues' AND cmd = 'INSERT';

-- Drop and recreate
DROP POLICY IF EXISTS "policy_name" ON leagues;

CREATE POLICY "policy_name" ON leagues FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = admin_id 
    AND LOWER(role) IN ('superuser', 'pro_manager')
  )
);
```

### **Issue 2: Data Not Syncing**

**Symptoms:**
- Changes not appearing after refresh
- Old data showing
- Inconsistent state

**Diagnosis:**
1. Check if Supabase is online:
   ```typescript
   const online = await db.isOnline();
   console.log('Supabase online:', online);
   ```
2. Check browser console for errors
3. Check network tab for failed requests

**Solution:**
1. Verify `.env` has correct Supabase credentials
2. Check Supabase project status
3. Clear localStorage and refresh
4. Check if data is in Supabase dashboard

### **Issue 3: TypeScript Errors**

**Symptoms:**
- Red squiggly lines in VS Code
- Build fails with type errors

**Common Causes:**
1. Missing properties in type definitions
2. Incorrect type annotations
3. camelCase vs snake_case mismatch

**Solution:**
1. Check `types/index.ts` for correct definitions
2. Ensure database.ts converts snake_case ↔ camelCase
3. Run `npm run build` to see all type errors

### **Issue 4: Fixture Generation Not Working**

**Symptoms:**
- No matches created after league creation
- Empty matches list

**Diagnosis:**
1. Check console for errors during league creation
2. Verify `generateFixtures()` is being called
3. Check if matches are in database

**Solution:**
1. Review `services/fixtures.ts` logic
2. Ensure participant count is valid (≥2 for RR, power of 2 for Cup)
3. Check RLS policy for matches INSERT

---

## 🧪 Testing

### **Manual Testing Checklist:**

#### **Authentication:**
- [ ] Sign up with new account
- [ ] Log in with existing account
- [ ] Log out
- [ ] Session persists on refresh

#### **League Management:**
- [ ] Create Round Robin 1-leg league
- [ ] Create Round Robin 2-legs league
- [ ] Create Cup league
- [ ] Verify fixtures generated correctly
- [ ] Delete league
- [ ] Verify activity log created

#### **Match Management:**
- [ ] Add match result
- [ ] Verify standings update
- [ ] Verify stats update
- [ ] Finish league
- [ ] Verify league moves to finished

#### **User Management (Superuser):**
- [ ] View all users
- [ ] Search users
- [ ] Update user role
- [ ] Verify role change reflected

#### **Statistics:**
- [ ] View dashboard stats
- [ ] Verify calculations correct
- [ ] Check favorite opponent
- [ ] Check toughest rival

### **Database Testing:**

```sql
-- Test user creation
INSERT INTO users (email, password, username, first_name, last_name, date_of_birth, role)
VALUES ('test@test.com', '$2b$10$hashedpassword', 'testuser', 'Test', 'User', '1990-01-01', 'normal_user');

-- Test league creation
INSERT INTO leagues (name, admin_id, format, status, participant_ids)
VALUES ('Test League', 'user-uuid', 'round_robin_1leg', 'running', ARRAY['user1-uuid', 'user2-uuid']);

-- Test RLS policy
SET ROLE authenticated;
SELECT * FROM leagues; -- Should work
INSERT INTO leagues (...); -- Should fail if not pro_manager/superuser
```

### **Performance Testing:**

- Test with 100+ users
- Test with 50+ leagues
- Test with 1000+ matches
- Monitor query performance in Supabase dashboard

---

## 🚀 Deployment

### **Frontend Deployment (Vercel):**

1. **Connect GitHub Repository:**
   - Go to vercel.com
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Set Environment Variables:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - App will be live at `your-app.vercel.app`

5. **Automatic Deployments:**
   - Every push to `main` branch auto-deploys
   - Preview deployments for pull requests

### **Backend Deployment (Supabase):**

1. **Create Project:**
   - Go to supabase.com
   - Create new project
   - Choose region closest to users

2. **Set Up Database:**
   - Go to SQL Editor
   - Copy contents of `supabase-schema.sql`
   - Run the script

3. **Apply RLS Policies:**
   - Copy contents of `supabase-rls-complete-fix.sql`
   - Run in SQL Editor

4. **Get Credentials:**
   - Go to Project Settings → API
   - Copy Project URL
   - Copy anon/public key
   - Add to Vercel environment variables

5. **Create Admin User:**
   - Sign up through the app
   - Run in Supabase SQL Editor:
     ```sql
     UPDATE users SET role = 'superuser' WHERE email = 'your-email@example.com';
     ```

### **Custom Domain (Optional):**

1. **In Vercel:**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update CORS (if needed):**
   - Supabase automatically allows all origins
   - For production, consider restricting in Supabase dashboard

---

## 📚 Additional Resources

### **Documentation:**
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [Vercel Docs](https://vercel.com/docs)

### **Project Files:**
- `supabase-schema.sql` - Complete database schema
- `supabase-rls-complete-fix.sql` - All RLS policies
- `RLS_FIX_COMPLETE.md` - RLS fix documentation
- `TESTING_CHECKLIST.md` - Comprehensive testing guide

### **Useful SQL Queries:**

```sql
-- View all users
SELECT id, email, username, role FROM users;

-- View all leagues
SELECT id, name, admin_id, format, status FROM leagues;

-- View all matches for a league
SELECT * FROM matches WHERE league_id = 'league-uuid';

-- View user stats
SELECT * FROM user_stats WHERE user_id = 'user-uuid';

-- View recent activity
SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 20;

-- Check RLS policies
SELECT tablename, policyname, cmd, with_check 
FROM pg_policies 
WHERE schemaname = 'public';

-- Find duplicate policies
SELECT tablename, cmd, COUNT(*) 
FROM pg_policies 
GROUP BY tablename, cmd 
HAVING COUNT(*) > 1;
```

---

## 🤝 Contributing

### **Development Workflow:**

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with meaningful messages:**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### **Code Style:**

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

### **Commit Message Format:**

```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance
```

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/Kirito72-hub/SoccerWebApp/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Kirito72-hub/SoccerWebApp/discussions)
- **Email:** support@rakla.app (if applicable)

---

<div align="center">

**Happy Coding! ⚽**

Made with ❤️ by the Rakla Team

</div>
