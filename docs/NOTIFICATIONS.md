# 🔔 Notification System Guide

## **Overview**

Rakla Football Manager has a comprehensive push notification system with 3 categories:

1. **🟣 League Notifications** - League creation and completion
2. **🟢 Match Notifications** - Match results and table positions
3. **🔵 News Notifications** - App updates and system announcements

---

## **📱 User Settings**

Users can toggle each notification category in **Profile → Notification Settings**:

- Each category can be enabled/disabled independently
- Settings are saved per-user in localStorage
- **Default:** All notifications are ENABLED
- Notifications require PWA installation for best experience

---

## **🎯 Notification Triggers**

### **1. League Notifications** 🟣

**Triggers:**
- ✅ **New League Created** - When user is added as participant
- ✅ **League Finished** - When league status changes to 'finished'

**Example Messages:**
- "New League Alert! 🚨 Time to shine!"
- "League's wrapped! 🏁 Check the standings!"

**Logic:**
- Only sends to participants of the league
- Respects user's league notification preference
- Uses random messages for variety

---

### **2. Match Notifications** 🟢

**Triggers:**
- ✅ **Match Result** - When match status changes to 'completed'
  - Win: Encouraging messages 🏆
  - Loss: Consolation messages 💪
  - Draw: Mixed feelings messages 🤝
- ✅ **Table Position** - Every 3 completed matches
  - Shows current rank (e.g., "You are #3 in the tables 📊")
  - Special messages for 1st place and last place

**Example Messages:**

**Win:**
- "Boom! 3 points in the bag! 🚀⚽"
- "Victory tastes sweet! 🍯🏆"
- "That's how champions play! 👑⚡"

**Loss:**
- "Tough one, but we bounce back! 💪🔄"
- "Lost the battle, not the war! ⚔️📈"
- "Shake it off! Next one's ours 👊✨"

**Draw:**
- "Points shared today 🤝 Not bad!"
- "Perfectly balanced ⚖️ As all things should be"

**Table Position:**
- 1st place: "You are TOP of the league! 🥇 Everyone is chasing you!"
- Last place: "Currently bottom of the pile... 📉 Time to wake up!"
- Other: "You are currently sitting at #X in the tables. 📊"

**Logic:**
- Only sends to users involved in the match
- Respects user's match notification preference
- Counter tracks matches per league per user
- Position calculated from all completed matches

---

### **3. News Notifications** 🔵

**Triggers:**
- ✅ **App Version Updates** - When new version is deployed
- ✅ **System Announcements** - Admin-triggered announcements

**Example Messages:**

**App Updates:**
- "App updated! 🎉 Check out what's new!"
- "New features just dropped! 🚀✨"
- "We've leveled up! 📈 Update available!"

**Announcements:**
- "Important announcement! 📢 Check it out!"
- "Breaking news! 🗞️ Don't miss this!"
- "PSA: Important update! 📣✨"

**How to Send:**

```typescript
// Import the utility
import { sendAppUpdateNotification, sendSystemAnnouncement } from './services/newsUtils';

// Send app update (uses random message)
await sendAppUpdateNotification();

// Send app update with custom message
await sendAppUpdateNotification("v1.3.0 is here! PWA support added! 🎉");

// Send system announcement
await sendSystemAnnouncement("Tournament finals this Sunday! 🏆");
```

**Logic:**
- Broadcasts to ALL users
- Respects each user's news notification preference
- Can use random messages or custom messages
- Includes timestamp to prevent duplicates

---

## **🔧 Technical Implementation**

### **Files:**
- `services/notificationService.ts` - Core notification logic
- `services/newsUtils.ts` - Helper functions for news
- `hooks/useNotificationSystem.ts` - Realtime subscription hook
- `pages/Profile.tsx` - User settings UI

### **How It Works:**

1. **Realtime Subscriptions** (`useNotificationSystem.ts`)
   - Subscribes to Supabase realtime for `leagues` and `matches` tables
   - Triggers notification handlers when events occur

2. **Notification Service** (`notificationService.ts`)
   - Checks user preferences (localStorage)
   - Checks browser notification permission
   - Sends notification via Service Worker (PWA) or Notification API
   - Uses random message selection for variety

3. **User Preferences** (Profile page)
   - Toggle switches for each category
   - Saves to localStorage: `notifications_{type}_{userId}`
   - Default: `true` (enabled)

### **Permission Flow:**

1. User installs PWA
2. App requests notification permission
3. User grants/denies permission
4. If granted, notifications work
5. If denied, no notifications (respects user choice)

---

## **📊 Message Variety**

### **Why Random Messages?**
- Keeps notifications fresh and engaging
- Users don't get bored of same message
- Adds personality to the app
- Makes wins feel more exciting
- Makes losses feel less harsh

### **Message Characteristics:**
- ✅ **Short** - Easy to read at a glance
- ✅ **Funny** - Entertaining and memorable
- ✅ **Emoji-rich** - Visual and expressive
- ✅ **Encouraging** - Positive tone (even for losses)
- ✅ **Varied** - 7-15 options per category

---

## **🧪 Testing Notifications**

### **Test League Notifications:**
1. Enable league notifications in Profile
2. Create a new league with yourself as participant
3. Should receive "New League Alert!" notification
4. Change league status to 'finished'
5. Should receive "League's wrapped!" notification

### **Test Match Notifications:**
1. Enable match notifications in Profile
2. Complete a match where you're a participant
3. Should receive win/loss/draw notification
4. Complete 3 matches total
5. Should receive table position notification

### **Test News Notifications:**
1. Enable news notifications in Profile
2. Open browser console
3. Run: `await sendAppUpdateNotification()`
4. Should receive app update notification

---

## **🚀 Future Enhancements**

Potential additions:
- 🔕 Do Not Disturb hours
- 🔊 Notification sound toggle
- 📜 Notification history page
- 🎯 Notification for upcoming matches
- 🏆 Achievement notifications
- 👥 Friend request notifications

---

## **❓ FAQ**

**Q: Why am I not receiving notifications?**
A: Check:
1. Notification permission granted in browser
2. Category enabled in Profile settings
3. PWA installed (for best experience)
4. Service Worker registered (check console)

**Q: Can I disable specific notifications?**
A: Yes! Go to Profile → Notification Settings and toggle any category.

**Q: Do notifications work offline?**
A: Yes, if PWA is installed. Service Worker caches and delivers them.

**Q: Can I customize messages?**
A: Currently no, but messages are randomized for variety. Custom messages may be added in future.

**Q: How do I send a news notification?**
A: Use the helper functions in `services/newsUtils.ts` (requires admin access).

---

**Last Updated:** v1.3.0-beta  
**Status:** ✅ Fully Implemented
