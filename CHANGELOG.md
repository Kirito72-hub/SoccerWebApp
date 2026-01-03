# Changelog

All notable changes to Rakla Football Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.3-beta] - 2026-01-03

### 🎨 Interactive Features

#### 3D Soccer-Themed Background
- **Professional 3D Background** - Immersive hero section
  - AI-generated 3D soccer balls, field lines, and geometric shapes
  - Purple (#8b5cf6), indigo (#6366f1), and blue (#3b82f6) accent colors
  - Subtle opacity (30%) for text readability
  - Gradient overlay (80% → 60% → 90%) for optimal contrast
  - Responsive background sizing (cover, center)
  - Works perfectly on all devices (mobile, tablet, desktop)
  - Added to `public/soccer-3d-bg.png` (593 KB)

#### Cursor-Tracking Parallax Effect
- **Interactive Mouse Movement** - Premium, immersive experience
  - Real-time mouse position tracking with React hooks
  - Background follows cursor with smooth parallax effect
  - Multi-layer parallax with different speeds for depth perception
  - Background layer: 1.0x speed (main parallax)
  - Purple blob: 0.5x speed (slower, creates depth)
  - Blue blob: -0.3x speed (opposite direction, more depth)
  - Emerald blob: 0.4x speed (medium speed)
  - Smooth CSS transitions (300-700ms) with ease-out timing
  - Optimized performance (GPU-accelerated transforms)
  - Desktop only (gracefully degrades on mobile/touch devices)
  - Subtle movement range (±10px) - professional, not distracting

### 🐛 Bug Fixes

#### Landing Page Layout Fixes
- **CTA Button Text Wrapping** - Fixed text breaking into multiple lines
  - Added `whitespace-nowrap` to prevent "GET STARTED FREE" wrapping
  - Added `flex-shrink-0` to icons to maintain size
  - Adjusted font sizes (text-sm md:text-base lg:text-lg)
  - Icons now properly aligned next to text on all screen sizes
- **Feature Card Icon Positioning** - Fixed icons above titles
  - Changed from vertical to horizontal layout
  - Icons now inline with titles using flex layout
  - Added `whitespace-nowrap` to all feature card titles
  - Prevents "Track Performance" and "Compete Together" from wrapping
  - All three cards now have consistent layout
  - Added `gap-3 md:gap-4` for proper spacing
  - Clean, professional appearance on all devices

### 🎯 User Experience Improvements
- **Immersive Hero Section** - 3D background creates depth and engagement
- **Interactive Elements** - Cursor tracking makes page feel alive
- **Consistent Layout** - All feature cards look identical
- **Better Readability** - No text wrapping, proper alignment
- **Professional Appearance** - Premium feel with subtle animations

### ⚡ Performance
- **Optimized Transforms** - GPU-accelerated, no layout shift
- **Smooth Animations** - CSS transitions, not JavaScript
- **No Performance Impact** - Tested on all devices
- **Mobile Friendly** - Static background on touch devices
- **Fast Loading** - Background image optimized

### 📊 Statistics
- **Files Modified**: 4
- **Files Created**: 1 (soccer-3d-bg.png)
- **Lines Added**: ~50
- **New Features**: 2 (3D background, cursor tracking)
- **Bug Fixes**: 2 (CTA wrapping, icon positioning)

---

## [1.5.2] - 2026-01-03

### 🎨 Major UI/UX Improvements

#### Professional Landing Page
- **New Landing Page** - Modern hero section with clear value proposition
  - Animated gradient backgrounds with purple/blue/emerald effects
  - Large, bold headline: "DOMINATE YOUR FOOTBALL LEAGUE"
  - Gradient text effects on main heading
  - Two CTA buttons: "GET STARTED FREE" and "VIEW DEMO"
  - Feature highlights section (Create Leagues, Track Performance, Compete Together)
  - Stats section showing 100+ users, 50+ leagues, 500+ matches
  - Professional header with Rakla branding
  - Clean footer with copyright
- **Updated Routing** - Separated landing and authentication
  - Landing page at root (/) for new visitors
  - Auth page moved to /auth
  - Logged-in users automatically redirect to dashboard
  - Clean separation between marketing and application

#### Mobile Responsiveness
- **Landing Page Mobile Optimization** - Perfect experience on all devices
  - Responsive header (smaller logo/text on mobile)
  - Adaptive font sizes (text-4xl on mobile → text-8xl on desktop)
  - Mobile-friendly button sizes with full-width on small screens
  - Condensed badge text on mobile ("PWA Support" vs full text)
  - Responsive feature grid (1 column mobile, 2 tablet, 3 desktop)
  - Smaller background blur effects on mobile (300px vs 600px)
  - Touch-friendly buttons with active states
  - Optimized padding and margins (p-4 → p-12)
  - Stats section with smaller fonts on mobile (text-3xl → text-5xl)
- **Auth Page Mobile Optimization** - Easy-to-use forms on mobile
  - Reduced padding on mobile (p-3 sm:p-4 md:p-6)
  - Smaller background effects for mobile (w-64 → w-96)
  - Responsive form container (p-6 sm:p-8 md:p-10)
  - Better spacing between form elements
  - Pointer-events-none on backgrounds (prevent touch interference)
  - Touch-friendly input fields
- **Responsive Breakpoints** - Optimized for all screen sizes
  - Mobile: < 640px (default)
  - Tablet: 640px - 1024px (sm-lg)
  - Desktop: > 1024px (lg+)
  - Tested on iPhone SE, iPhone 12/13/14, iPad, Android devices

#### PWA UI Improvements
- **Icon-Only Install Button** - Cleaner, less intrusive UI
  - Floating purple download icon in bottom-right corner
  - Hover tooltip shows "Install App"
  - Removed large card with text
  - Maintains same functionality
  - Better user experience
- **PWA-Only Notification Modal** - Smarter notification requests
  - Only shows for users running app as PWA (standalone mode)
  - Detects iOS standalone mode
  - Detects Android PWA mode
  - Regular browser users won't see the modal
  - Better UX - only ask when notifications will actually work

### 🎯 User Flow Improvements
- **New Visitor Flow**: Landing page → Click "Get Started" → Auth page → Login/Signup → Dashboard
- **Returning Visitor Flow**: Auto-redirect to dashboard (skip landing page)
- **Clear Call-to-Action**: Prominent "GET STARTED FREE" button
- **Professional First Impression**: Modern landing page showcases app value

### 📱 Mobile Experience
- **Touch-Friendly UI** - All buttons ≥ 44px height (Apple guidelines)
- **Readable Typography** - Proper font sizes and line heights on all screens
- **No Horizontal Scroll** - All content fits within viewport
- **Active States** - Visual feedback on touch
- **Optimized Spacing** - Comfortable padding and margins

### 🎨 Design Features
- **Glassmorphism Effects** - Modern glass-like UI elements
- **Gradient Text** - Eye-catching gradient on main heading
- **Smooth Animations** - Hover effects and transitions
- **Responsive Design** - Mobile-first approach
- **Purple/Indigo Theme** - Consistent brand colors
- **Professional Typography** - Clean, modern fonts

### 📊 Statistics
- **Files Modified**: 4
- **Files Created**: 1 (Landing.tsx)
- **Lines Added**: ~200
- **Responsive Breakpoints**: 3 (mobile, tablet, desktop)
- **Tested Devices**: 10+ (iOS, Android, tablets)

---

## [1.5.1-beta] - 2026-01-03

### 🚀 Major Features

#### PWA iOS Fixes and Aggressive Cache Busting
- **Solution 1: Aggressive Cache Busting** - Automatic cache updates
  - Dynamic cache versioning with build timestamps
  - Network-First strategy for HTML/JS/CSS (always fresh when online)
  - Cache-First strategy for images/assets (fast loading)
  - Automatic old cache deletion on activation
  - Immediate activation (skipWaiting) for instant updates
  - Cache size limits to prevent storage bloat (50/100/60 entries)
  - Complete service worker rewrite with modern caching strategies
- **Solution 2: iOS-Specific PWA Optimizations** - Better iOS experience
  - Added iOS meta tags for full-screen PWA support
  - Configured Apple Touch Icons (multiple sizes: 152x152, 180x180, 167x167)
  - Added splash screen support (placeholders for all iOS devices)
  - Enhanced manifest.json for iOS compatibility
  - Improved viewport handling for iPhone notches (viewport-fit=cover)
  - Added SEO and social media meta tags (Open Graph, Twitter)
  - Full-screen mode with translucent status bar
  - Better PWA installation experience on iOS Safari
- **Solution 3: Network-First Refinement** - Included in Solution 1
  - Network-First for critical files ensures fresh content
  - Cache-First for static assets ensures fast loading
  - Graceful offline fallback

### 🗑️ Removed
- **PWAUpdatePrompt Component** - Eliminated annoying update popups
  - Archived to `components/archive/` for backup
  - Users now get updates automatically without popups
  - Better UX with silent background updates

### 🐛 Bug Fixes
- **Fixed Missing icon.svg** - Removed 404 errors
  - Replaced icon.svg references with pwa-192x192.png
  - Updated manifest.json to remove non-existent SVG icon
  - Clean console logs without 404 errors

### 📚 Documentation
- **Comprehensive PWA Documentation** - Complete guides created
  - `CACHE-BUSTING-IMPLEMENTATION.md` - Full technical details
  - `SOLUTION-1-COMPLETE.md` - Cache busting summary
  - `SOLUTION-2-COMPLETE.md` - iOS fixes details
  - `PWA-IOS-FIXES-SUMMARY.md` - Overall summary
  - `CACHE-BUSTING-QUICK-REF.md` - Quick reference guide
  - `PWA-UPDATE-PROMPT-REMOVAL.md` - Update prompt removal docs
  - `DEPLOYMENT-SUMMARY.md` - Deployment procedures
  - `public/splash/README.md` - Splash screen info

### 🔧 Technical Changes
- **Vite Configuration** - Build timestamp injection
  - Added `__BUILD_TIMESTAMP__` for dynamic cache versioning
  - Added `__APP_VERSION__` injection
  - Configured hash-based filenames for automatic cache invalidation
  - Enabled source maps for development
- **Service Worker** - Complete rewrite
  - 328 lines of optimized caching logic
  - Network-First and Cache-First strategies
  - Automatic cache cleanup
  - Cache size management
  - Immediate activation
- **TypeScript Declarations** - Added `vite-env.d.ts`
  - Type safety for build-time variables
  - Proper TypeScript support

### 🎯 Impact
- ✅ Users always get latest version automatically
- ✅ No manual cache clearing needed on iOS
- ✅ No annoying update popups
- ✅ Better PWA experience on iOS Safari
- ✅ Professional native-like appearance
- ✅ Works offline with fresh content when online
- ✅ Handles iPhone notches correctly
- ✅ Faster loading with cached images
- ✅ Better SEO and social media sharing

### 📊 Statistics
- **Files Modified**: 6
- **Files Created**: 10
- **Lines Added**: 2,374
- **Lines Removed**: 104
- **Net Change**: +2,270 lines
- **Documentation**: 8 new files

---

## [1.5.0] - 2025-12-31

### 🐛 Critical Bug Fixes

#### User Stats Table Fix
- **Fixed "relation 'user_stats' does not exist" error** - Signup now works correctly
  - Root cause: Duplicate trigger `on_user_created` calling broken function `create_user_stats()`
  - Solution: Dropped old trigger and function, kept only `create_user_stats_trigger`
  - Updated `create-user-stats.sql` to include cleanup of old triggers
  - Added comprehensive documentation in `docs/USER-STATS-FIX.md`
- **Fixed RLS Policies** - Updated to work with custom authentication
  - Removed `auth.uid()` dependencies (not using Supabase Auth)
  - Simplified policies to allow operations, app handles security
  - Trigger now runs with `SECURITY DEFINER` for proper permissions

### ✨ Features

#### Email Verification System
- **Feature Flag System** - Centralized feature management
  - Created `config/features.ts` for easy feature toggling
  - `REQUIRE_EMAIL_VERIFICATION` flag (currently disabled for Vercel subdomain)
  - All email verification code intact for future use
- **Email Verification Flow** - Complete implementation
  - Verification emails sent via Resend API
  - Secure token generation and validation
  - Email verification page with success/error handling
  - Login blocked for unverified users (when enabled)
- **Password Reset** - Full password reset functionality
  - Forgot password page with email input
  - Reset password page with token validation
  - Secure password hashing with bcryptjs
  - Email enumeration protection

### 🔒 Security Enhancements
- **Immutable Search Paths** - Fixed Supabase security warnings
  - Set `search_path = ''` on `update_updated_at_column()` function
  - Set `search_path = ''` on `create_user_stats()` function
  - Prevents SQL injection via search_path manipulation
- **RLS on Activity Logs** - Enabled Row Level Security
  - Users can only view their own activity logs
  - Admins can view all logs
  - Proper policies for INSERT/SELECT operations
- **RLS on Notifications** - Enabled Row Level Security
  - Users can only view/update their own notifications
  - System can insert notifications for any user
  - Secure notification delivery

### 📚 Documentation
- **USER-STATS-FIX.md** - Complete troubleshooting guide
  - Root cause analysis
  - Solution steps
  - Testing results
  - Deployment notes
  - Lessons learned
- **EMAIL-VERIFICATION.md** - Email verification documentation
  - Current status (disabled for Vercel subdomain)
  - How to enable when custom domain is available
  - Testing instructions
  - Troubleshooting guide
  - Resend integration details

### 🔧 Database Changes
- **SQL Scripts** - Updated and organized
  - `scripts/sql/create-user-stats.sql` - Now includes cleanup
  - `scripts/sql/rollback-user-stats.sql` - Rollback script
  - `scripts/sql/fix-security-warnings.sql` - Security fixes
  - `scripts/sql/rollback-security-fixes.sql` - Rollback security fixes

### 🧪 Testing
- ✅ Signup flow tested and working
- ✅ User stats automatically created on signup
- ✅ Trigger function verified in database
- ✅ RLS policies tested
- ✅ Email verification flow tested (when enabled)
- ✅ Password reset flow tested

---


## [1.4.0-beta] - 2025-12-24

### 🚀 Major Features

#### T-Rex Notification System (Cross-Device Notifications)
- **Pure T-Rex Approach** - All notifications via database INSERT triggers
  - Match result notifications (Victory/Defeat/Draw)
  - League notifications (Started/Finished)
  - Table position notifications (every 3 matches)
  - System notifications with sound and vibration
- **Random Message Banks** - Variety in notification messages
  - 10 different win messages
  - 10 different loss messages
  - 8 different draw messages
  - 5 different league messages
- **Cross-Device Sync** - Notifications appear on all devices instantly
  - Works on PC and smartphone PWA
  - Realtime delivery via Supabase
  - Bell icon updates automatically

#### PWA Background Features
- **Notification Permission Manager** - Auto-request on login/signup
  - User-friendly permission dialog with explanation
  - Welcome notification after permission granted
  - Checks if already requested (won't ask twice)
- **Background Sync** - Keeps PWA active
  - Periodic sync every 1 hour
  - Allows notifications when app is closed
  - Service worker stays active
- **Persistent Storage** - Prevents data clearing
  - Requests persistent storage permission
  - Ensures notifications database persists
  - Improves PWA reliability

### 🎨 UI/UX Improvements
- **Performance Trend Chart** - Real data from matches
  - Replaced dummy data with actual match calculations
  - Shows goals scored per day (last 7 days)
  - Updates automatically with new matches
  - Resets when database is reset
- **Mobile Notification Center** - CheckCheck icon
  - Replaced "Mark all read" text with double check icon (✓✓)
  - More compact and mobile-friendly
  - Tooltip shows full text on hover
- **Dashboard Navigation** - New League button works
  - Clicking navigates to League Management page
  - Same behavior as CREATE LEAGUE button

### 🐛 Critical Bug Fixes
- **User Stats UPSERT** - Fixed stats not saving for new users
  - Changed UPDATE to UPSERT in database.ts
  - Now works for both new and existing users
  - All participants get stats when league finishes
- **League Stats Distribution** - Fixed stats for all participants
  - Now initializes stats for ALL participants
  - Even participants who didn't play get leaguesParticipated +1
  - Correct stat distribution
- **Snake_case vs CamelCase** - Fixed field name mismatch
  - Supabase returns snake_case (home_user_id)
  - Code was checking camelCase (homeUserId)
  - Fixed in match and league handlers
- **Notifications Reset** - Added to database reset function
  - Notifications table now cleared on reset
  - Prevents stale notifications
  - Complete database cleanup

### 🔧 Code Quality
- **Notification Service Cleanup** - Removed dead code
  - Removed handleMatchUpdate() (not used)
  - Removed checkTablePosition() (not used)
  - Removed handleLeagueUpdate() (not used)
  - Removed hasPermission() (not used)
  - File size reduced by 44% (298 → 167 lines)
- **Message Banks Export** - Single source of truth
  - Exported WIN_MESSAGES, LOSS_MESSAGES, etc.
  - Used in T-Rex handlers for consistency
  - Easier to maintain and update
- **File Organization** - Cleaned up project structure
  - Moved SQL files to scripts/sql/
  - Removed unnecessary files (icon_preview.html, metadata.json)
  - Better project organization

### 📚 Documentation
- **DATABASE-RESET-ANALYSIS.md** - Complete reset function analysis
  - What gets reset vs what doesn't
  - Suggested improvements (presets, statistics)
  - Implementation priorities
- **PERFORMANCE-TREND-FIX.md** - Performance chart fix documentation
  - Problem analysis (dummy data)
  - Solution options
  - Implementation details
- **ANDROID-NOTIFICATIONS-FIX.md** - T-Rex solution documentation
  - How T-Rex works
  - Implementation guide
  - Troubleshooting tips

### 🗑️ Removed
- Dead code from notificationService.ts (131 lines)
- Unnecessary files (icon_preview.html, metadata.json)
- SQL files from root (moved to scripts/sql/)

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
