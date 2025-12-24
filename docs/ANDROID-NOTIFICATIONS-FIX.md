# Android Notification Troubleshooting Guide

## 🔍 The Issue

**Symptoms:**
- ✅ In-app notifications work (bell icon)
- ❌ System notifications don't appear (notification tray)
- ❌ No sound
- ❌ No vibration

**This is an Android OS permission issue, not a code bug!**

---

## ✅ Solution: Enable Android Notifications

### **Step-by-Step Fix:**

1. **Open Android Settings**
   - Swipe down → Tap gear icon
   - Or open Settings app

2. **Navigate to Apps**
   - Settings → Apps
   - Or Settings → Applications

3. **Find Rakla**
   - Scroll through app list
   - Or use search

4. **Tap on Rakla**
   - Opens app info page

5. **Tap "Notifications"**
   - Should show notification settings

6. **Enable Everything:**
   - ✅ Turn ON "Show notifications"
   - ✅ Turn ON "Sound"
   - ✅ Turn ON "Vibration"
   - ✅ Enable all notification categories

7. **Test It:**
   - Return to Rakla app
   - Send test announcement
   - Should now see system notification!

---

## 📱 Visual Guide

```
Android Settings
    ↓
Apps
    ↓
Rakla
    ↓
Notifications
    ↓
[Toggle] Show notifications → ON ✅
[Toggle] Sound → ON ✅
[Toggle] Vibration → ON ✅
```

---

## 🔧 Additional Checks

### **1. Battery Optimization**
Android might be killing notifications to save battery:

1. Settings → Apps → Rakla
2. Battery → Battery optimization
3. Select "Don't optimize"

### **2. Do Not Disturb**
Check if Do Not Disturb is blocking notifications:

1. Swipe down notification tray
2. Check if DND is enabled
3. Disable or add Rakla to exceptions

### **3. Notification Channels**
Some Android versions have notification channels:

1. Settings → Apps → Rakla → Notifications
2. Check if there are categories like "General", "Alerts", etc.
3. Enable ALL categories

---

## 🎯 Why This Happens

### **Two Permission Layers:**

**1. Browser Permission:**
- Granted when you click "Allow" in browser
- Lets website request notifications
- ✅ You already have this

**2. Android OS Permission:**
- Separate from browser permission
- Controls if notifications actually appear
- ❌ This is what's missing!

### **The Confusion:**
```
Browser says: "Permission granted" ✅
Android says: "Notifications blocked" ❌
Result: No system notifications ❌
```

---

## ✅ Expected Behavior After Fix

**Before:**
```
Send notification
  ↓
Saved to database ✅
  ↓
In-app notification ✅
  ↓
System notification ❌ (blocked by Android)
```

**After:**
```
Send notification
  ↓
Saved to database ✅
  ↓
In-app notification ✅
  ↓
System notification ✅ (Android allows it)
Sound plays ✅
Phone vibrates ✅
```

---

## 🧪 Test Checklist

After enabling Android notifications:

- [ ] Android Settings → Apps → Rakla → Notifications → ON
- [ ] Send test announcement from PC
- [ ] **System notification appears** ✅
- [ ] **Sound plays** ✅
- [ ] **Phone vibrates** ✅
- [ ] Notification appears in notification tray
- [ ] Can swipe down to see it
- [ ] Tap notification → App opens

---

## 📊 Common Android Versions

### **Android 12+:**
Settings → Apps → See all apps → Rakla → Notifications

### **Android 11:**
Settings → Apps & notifications → Rakla → Notifications

### **Android 10:**
Settings → Apps → Rakla → Notifications

### **Android 9 (Pie):**
Settings → Apps & notifications → App info → Rakla → Notifications

### **Android 8 (Oreo):**
Settings → Apps → Rakla → App notifications

---

## 🔍 Still Not Working?

### **1. Check Notification Log:**
Some Android phones have a notification log:
- Settings → Apps → Special access → Notification access
- Check if notifications are being received but hidden

### **2. Clear App Data:**
- Settings → Apps → Rakla → Storage
- Clear cache (NOT data, you'll lose login)
- Reopen app

### **3. Reinstall PWA:**
- Remove Rakla from home screen
- Open in browser
- Add to home screen again
- Grant all permissions

### **4. Check Phone Settings:**
- Some manufacturers (Samsung, Xiaomi, Huawei) have extra notification settings
- Check manufacturer-specific settings

---

## 💡 Quick Fix Summary

**The problem:** Android notifications are OFF in system settings

**The solution:** 
1. Settings → Apps → Rakla → Notifications
2. Turn everything ON
3. Test

**That's it!** 🎉

---

## 📱 Manufacturer-Specific Notes

### **Samsung:**
- Settings → Notifications → App notifications → Rakla
- Make sure "Show notifications" is ON

### **Xiaomi/MIUI:**
- Settings → Notifications → Rakla
- Enable "Show notifications"
- Also check: Settings → Battery & performance → Manage apps' battery usage → Rakla → No restrictions

### **Huawei/EMUI:**
- Settings → Notifications → Rakla
- Enable all notification types
- Also check: Settings → Battery → App launch → Rakla → Manage manually

### **OnePlus:**
- Settings → Apps → Rakla → Notifications
- Enable all categories

---

## ✅ Conclusion

**This is NOT a bug in the app!**

Android requires explicit permission at the OS level for notifications to appear in the system tray. The browser permission is separate and not enough.

**Fix:** Enable notifications in Android Settings → Apps → Rakla → Notifications

**After enabling:** System notifications will work perfectly with sound and vibration!
