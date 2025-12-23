# Changelog

All notable changes to Rakla Football Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0-beta] - 2025-12-23

### 🆕 Added

#### Real-Time Features
- **Supabase Realtime Integration** - Live updates across all devices
  - League creation appears instantly for all users
  - Match score updates sync in real-time
  - User role changes reflect immediately
  - Visual flash animations for updated items
  - LIVE connection indicators
- **Custom Realtime Hook** - Reusable `useRealtimeSubscription` hook
  - Auto-subscribe/unsubscribe on mount/unmount
  - Event filtering (INSERT, UPDATE, DELETE)
  - Comprehensive error handling and logging

#### Security Enhancements
- **Authorization Checks** - Added to all admin pages
  - LeagueManagement: Pro Manager + Superuser only
  - Settings: Superuser only
  - ActivityLog: Superuser only
- **ACCESS DENIED Screens** - Clear error messages for unauthorized access
- **Security Documentation** - Complete `SECURITY.md` with authorization matrix

#### UI/UX Improvements
- **Consistent Avatars** - Anime-style avatars across all pages
  - Created `avatarUtils.ts` for centralized avatar management
  - Fixed 10+ avatar inconsistencies
- **In-App Success Messages** - Replaced browser alerts
  - Beautiful emerald-themed modals
  - Auto-dismiss after 3 seconds
  - Progress bar animations
- **Bulk User Operations** - Multi-select and delete users
  - Select all checkbox
  - Delete confirmation modal
  - Success feedback with count

### 🔧 Changed
- **Realtime Permissions** - Improved participant filtering
  - Normal users see leagues they're part of
  - Pro managers see their own leagues
  - Superusers see all leagues
- **Supabase Client Configuration** - Added realtime options
  - `eventsPerSecond: 10` to prevent throttling
  - Disabled auth session persistence
  - Better error logging

### 🐛 Fixed
- **User Deletion Bug** - Fixed Supabase RLS issues
  - Added better error logging
  - Created SQL fix scripts
  - Documented solution in `docs/archive/`
- **Avatar Inconsistencies** - All pages now use actual user avatars
  - Removed picsum.photos fallbacks
  - Fixed RunningLeagues page (8 occurrences)
  - Fixed LeagueManagement page (2 occurrences)
- **Realtime UI Updates** - Fixed state not updating
  - Added participant check to `onInsert`
  - Added realtime to RunningLeagues page
  - Proper permission filtering
- **Authorization Vulnerabilities** - Blocked unauthorized access
  - Normal users can't access League Management
  - Normal users can't access Activity Log
  - Pro managers can't access Settings

### 📚 Documentation
- **README.md** - Updated for v1.2 with new features
- **SECURITY.md** - Complete security documentation
- **DEVELOPER_GUIDE.md** - Updated with realtime setup
- **Archive** - Moved old docs to `docs/archive/`
  - FIX-USER-DELETION.md
  - FIXES-APPLIED.md
  - REALTIME-GUIDE.md
  - Old SQL fix files

### 🗑️ Removed
- Temporary documentation files (moved to archive)
- Old SQL fix files (moved to archive)
- Unnecessary picsum.photos avatar URLs

---

## [1.0.0-beta.02] - 2025-12-20

### Initial Beta Release
- League management system
- Match tracking and standings
- User roles and permissions
- Activity logging
- Profile management
- Supabase integration
- Vercel deployment

---

## Upgrade Guide

### From 1.0.0-beta.02 to 1.2.0-beta:

1. **Pull latest code:**
   ```bash
   git pull origin main
   npm install
   ```

2. **Enable Realtime in Supabase:**
   ```sql
   -- Run enable-realtime.sql in Supabase SQL Editor
   ALTER PUBLICATION supabase_realtime ADD TABLE users;
   ALTER PUBLICATION supabase_realtime ADD TABLE leagues;
   ALTER PUBLICATION supabase_realtime ADD TABLE matches;
   ```

3. **Verify Realtime:**
   - Open app in two browsers
   - Create a league in one
   - Should appear in the other instantly

4. **Test Security:**
   - Login as Normal User
   - Try accessing `/#/manage`
   - Should see ACCESS DENIED

---

## Breaking Changes

None - This is a backward-compatible update.

---

## Known Issues

None currently reported.

---

## Future Roadmap

### v1.3 (Planned)
- [ ] Toast notifications for realtime events
- [ ] Sound effects for goals
- [ ] Typing indicators
- [ ] Online presence (who's online)
- [ ] Optimistic UI updates

### v2.0 (Future)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Team management
- [ ] Advanced statistics
- [ ] Export/import data

---

**For detailed documentation, see:**
- [README.md](README.md)
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- [SECURITY.md](SECURITY.md)
