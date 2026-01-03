/**
 * Notification Sound Service
 * Manages playing notification sounds with mute control
 */

import { NotificationSoundType } from '../types/notifications';

class NotificationSoundService {
    private muted: boolean = false;
    private volume: number = 0.5; // Default volume (0.0 to 1.0)

    // Sound file paths
    private sounds = {
        new_notification: '/sounds/notification.mp3',
        mark_read: '/sounds/mark-read.mp3',
        delete: '/sounds/delete.mp3',
        achievement: '/sounds/achievement.mp3'
    };

    // Audio instances cache
    private audioCache: Map<NotificationSoundType, HTMLAudioElement> = new Map();

    constructor() {
        // Load mute preference from localStorage
        const savedMute = localStorage.getItem('notification_sounds_muted');
        this.muted = savedMute === 'true';

        // Load volume preference from localStorage
        const savedVolume = localStorage.getItem('notification_sounds_volume');
        if (savedVolume) {
            this.volume = parseFloat(savedVolume);
        }

        // Preload audio files
        this.preloadSounds();
    }

    /**
     * Preload all sound files for instant playback
     */
    private preloadSounds(): void {
        Object.entries(this.sounds).forEach(([type, path]) => {
            try {
                const audio = new Audio(path);
                audio.volume = this.volume;
                audio.preload = 'auto';
                this.audioCache.set(type as NotificationSoundType, audio);
            } catch (error) {
                console.warn(`Failed to preload sound: ${type}`, error);
            }
        });
    }

    /**
     * Play a sound by type
     */
    private async playSound(type: NotificationSoundType): Promise<void> {
        if (this.muted) {
            return; // Don't play if muted
        }

        try {
            // Get cached audio or create new one
            let audio = this.audioCache.get(type);

            if (!audio) {
                audio = new Audio(this.sounds[type]);
                audio.volume = this.volume;
                this.audioCache.set(type, audio);
            }

            // Reset audio to start if already playing
            audio.currentTime = 0;

            // Play the sound
            await audio.play();
        } catch (error) {
            // Fail silently - sound files might not exist yet
            console.debug(`Could not play sound: ${type}`, error);
        }
    }

    /**
     * Play new notification sound
     */
    async playNotification(): Promise<void> {
        await this.playSound('new_notification');
    }

    /**
     * Play mark as read sound
     */
    async playMarkAsRead(): Promise<void> {
        await this.playSound('mark_read');
    }

    /**
     * Play delete sound
     */
    async playDelete(): Promise<void> {
        await this.playSound('delete');
    }

    /**
     * Play achievement sound
     */
    async playAchievement(): Promise<void> {
        await this.playSound('achievement');
    }

    /**
     * Set muted state
     */
    setMuted(muted: boolean): void {
        this.muted = muted;
        localStorage.setItem('notification_sounds_muted', String(muted));
    }

    /**
     * Get muted state
     */
    isMuted(): boolean {
        return this.muted;
    }

    /**
     * Toggle mute
     */
    toggleMute(): boolean {
        this.muted = !this.muted;
        localStorage.setItem('notification_sounds_muted', String(this.muted));
        return this.muted;
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
        localStorage.setItem('notification_sounds_volume', String(this.volume));

        // Update volume for all cached audio instances
        this.audioCache.forEach(audio => {
            audio.volume = this.volume;
        });
    }

    /**
     * Get current volume
     */
    getVolume(): number {
        return this.volume;
    }

    /**
     * Test sound playback
     */
    async testSound(): Promise<void> {
        const wasMuted = this.muted;
        this.muted = false; // Temporarily unmute for test
        await this.playNotification();
        this.muted = wasMuted; // Restore mute state
    }

    /**
     * Play sound based on notification category
     */
    async playSoundForCategory(category: string): Promise<void> {
        switch (category) {
            case 'achievement':
                await this.playAchievement();
                break;
            case 'alert':
                await this.playNotification(); // Use default notification sound
                break;
            default:
                await this.playNotification();
        }
    }

    /**
     * Clear audio cache (useful for cleanup)
     */
    clearCache(): void {
        this.audioCache.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        this.audioCache.clear();
    }

    /**
     * Reload sounds (useful after updating sound files)
     */
    reloadSounds(): void {
        this.clearCache();
        this.preloadSounds();
    }
}

// Export singleton instance
export const notificationSound = new NotificationSoundService();
