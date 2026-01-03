# Notification Sounds

This directory contains sound files for notification events.

## Required Sound Files

### 1. notification.mp3
**Purpose**: New notification arrives
**Characteristics**:
- Subtle, pleasant ping or chime
- Duration: 0.5-1 second
- Volume: Moderate
- Tone: Friendly, not alarming

**Suggested sources**:
- https://notificationsounds.com/
- https://freesound.org/
- https://mixkit.co/free-sound-effects/notification/

### 2. mark-read.mp3
**Purpose**: Notification marked as read
**Characteristics**:
- Soft click or tick sound
- Duration: 0.2-0.5 seconds
- Volume: Quiet
- Tone: Confirmatory

### 3. delete.mp3
**Purpose**: Notification deleted
**Characteristics**:
- Whoosh or swipe sound
- Duration: 0.3-0.6 seconds
- Volume: Moderate
- Tone: Dismissive but not harsh

### 4. achievement.mp3
**Purpose**: Achievement unlocked
**Characteristics**:
- Celebratory chime or fanfare
- Duration: 1-2 seconds
- Volume: Slightly louder
- Tone: Exciting, positive

## File Format
- Format: MP3
- Bitrate: 128kbps or higher
- Sample Rate: 44.1kHz

## Usage
The notification sound service (`services/notificationSound.ts`) will automatically load these files.

## Fallback
If sound files are missing, the service will fail silently (no errors, just no sound).

## Testing
You can test sounds by calling:
```typescript
import { notificationSound } from './services/notificationSound';

notificationSound.playNotification();
notificationSound.playMarkAsRead();
notificationSound.playDelete();
notificationSound.playAchievement();
```

## Volume Control
Users can mute sounds via notification preferences.
