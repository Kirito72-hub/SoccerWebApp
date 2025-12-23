import { User } from '../types';

/**
 * Get the avatar URL for a user
 * Returns the user's chosen avatar or a default anime avatar
 */
export const getUserAvatar = (user: User | undefined | null): string => {
    if (!user) {
        return '/avatars/anime_striker.png'; // Default fallback
    }

    // If user has a custom avatar, use it
    if (user.avatar && !user.avatar.includes('picsum.photos')) {
        return user.avatar;
    }

    // Otherwise use default anime avatar
    return '/avatars/anime_striker.png';
};

/**
 * Get avatar by user ID from a list of users
 */
export const getAvatarByUserId = (userId: string, allUsers: User[]): string => {
    const user = allUsers.find(u => u.id === userId);
    return getUserAvatar(user);
};
