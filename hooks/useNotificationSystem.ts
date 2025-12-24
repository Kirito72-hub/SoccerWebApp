import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { notificationService } from '../services/notificationService';
import { User, Match, League } from '../types';

export const useNotificationSystem = (user: User | null) => {
    useEffect(() => {
        if (!user) return;

        console.log('🔔 Initializing Notification System for:', user.username);

        // Subscribe to MATCHES - Pure T-Rex Approach 🦖
        const matchSubscription = supabase
            .channel('notification-matches')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'matches' },
                async (payload) => {
                    console.log('🔔 Match Update Received:', payload);
                    try {
                        const newMatch = payload.new as Match;

                        // Only process completed matches
                        if (newMatch.status !== 'completed') {
                            console.log('⏭️ Match not completed, skipping');
                            return;
                        }


                        // Check if user is involved (Supabase uses snake_case!)
                        const isHome = (newMatch as any).home_user_id === user.id;
                        const isAway = (newMatch as any).away_user_id === user.id;

                        if (!isHome && !isAway) {
                            console.log('⏭️ User not involved in match, skipping');
                            return;
                        }

                        // Check if notifications enabled
                        const notificationsEnabled = localStorage.getItem(`notifications_matches_${user.id}`) !== 'false';
                        if (!notificationsEnabled) {
                            console.log('⏭️ Match notifications disabled for user');
                            return;
                        }

                        // Calculate result (Supabase uses snake_case!)
                        const userScore = isHome ? (newMatch as any).home_score : (newMatch as any).away_score;
                        const opponentScore = isHome ? (newMatch as any).away_score : (newMatch as any).home_score;

                        if (userScore === undefined || opponentScore === undefined) {
                            console.log('⏭️ Scores undefined, skipping');
                            return;
                        }

                        // Determine notification
                        let title = '';
                        let message = '';

                        if (userScore > opponentScore) {
                            title = 'Victory! 🏆';
                            message = 'You won the match! Great job!';
                        } else if (userScore < opponentScore) {
                            title = 'Defeat 💔';
                            message = 'Better luck next time!';
                        } else {
                            title = 'Draw 🤝';
                            message = 'A hard-fought draw!';
                        }

                        console.log('🎯 Saving match notification:', { title, message });

                        // T-REX: Save directly to notifications table 🦖
                        const { error } = await supabase
                            .from('notifications')
                            .insert({
                                user_id: user.id,
                                type: 'match',
                                title,
                                message
                            });

                        if (error) {
                            console.error('❌ Failed to save match notification:', error);
                        } else {
                            console.log('✅ Match notification saved! T-Rex will handle the rest 🦖');
                        }
                    } catch (error) {
                        console.error('❌ Error in match update handler:', error);
                    }
                }
            )
            .subscribe();

        // Subscribe to LEAGUES - Pure T-Rex Approach 🦖
        const leagueSubscription = supabase
            .channel('notification-leagues')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leagues' },
                async (payload) => {
                    console.log('🔔 League Update Received:', payload);
                    try {
                        const newLeague = payload.new as League;
                        const eventType = payload.eventType; // INSERT, UPDATE, DELETE


                        // Check if user is participant (Supabase uses snake_case!)
                        const participantIds = (newLeague as any).participant_ids || [];
                        if (!newLeague || !participantIds || !participantIds.includes(user.id)) {
                            console.log('⏭️ User not participant in league, skipping');
                            return;
                        }

                        // Check if notifications enabled
                        const notificationsEnabled = localStorage.getItem(`notifications_leagues_${user.id}`) !== 'false';
                        if (!notificationsEnabled) {
                            console.log('⏭️ League notifications disabled for user');
                            return;
                        }

                        let title = '';
                        let message = '';
                        let shouldNotify = false;

                        if (eventType === 'INSERT') {
                            title = 'League Started! ⚽';
                            message = `${newLeague.name} has begun! Good luck!`;
                            shouldNotify = true;
                        } else if (eventType === 'UPDATE' && newLeague.status === 'finished') {
                            title = 'League Finished 🏁';
                            message = `${newLeague.name} has ended! Check the final standings!`;
                            shouldNotify = true;
                        }

                        if (!shouldNotify) {
                            console.log('⏭️ No notification needed for this league event');
                            return;
                        }

                        console.log('🎯 Saving league notification:', { title, message });

                        // T-REX: Save directly to notifications table 🦖
                        const { error } = await supabase
                            .from('notifications')
                            .insert({
                                user_id: user.id,
                                type: 'league',
                                title,
                                message
                            });

                        if (error) {
                            console.error('❌ Failed to save league notification:', error);
                        } else {
                            console.log('✅ League notification saved! T-Rex will handle the rest 🦖');
                        }
                    } catch (error) {
                        console.error('❌ Error in league update handler:', error);
                    }
                }
            )
            .subscribe();

        return () => {
            console.log('🔕 Cleaning up Notification System');
            supabase.removeChannel(matchSubscription);
            supabase.removeChannel(leagueSubscription);
        };
    }, [user?.id]); // Only re-run if user ID changes
};
