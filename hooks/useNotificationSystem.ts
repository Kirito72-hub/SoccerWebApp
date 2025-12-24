import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
    notificationService,
    WIN_MESSAGES,
    LOSS_MESSAGES,
    DRAW_MESSAGES,
    LEAGUE_MESSAGES
} from '../services/notificationService';
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

                        // Determine notification with random messages
                        let title = '';
                        let message = '';

                        if (userScore > opponentScore) {
                            title = 'Victory! 🏆';
                            message = notificationService.getRandomMessage(WIN_MESSAGES);
                        } else if (userScore < opponentScore) {
                            title = 'Defeat 💔';
                            message = notificationService.getRandomMessage(LOSS_MESSAGES);
                        } else {
                            title = 'Draw 🤝';
                            message = notificationService.getRandomMessage(DRAW_MESSAGES);
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

                        // Table Position Check (Every 3 matches)
                        const leagueId = (newMatch as any).league_id;
                        const counterKey = `match_count_${leagueId}_${user.id}`;
                        const currentCount = parseInt(localStorage.getItem(counterKey) || '0') + 1;
                        localStorage.setItem(counterKey, currentCount.toString());

                        if (currentCount % 3 === 0) {
                            console.log('📊 3 matches completed! Checking table position...');

                            // Get all matches for this league
                            const { data: allMatches } = await supabase
                                .from('matches')
                                .select('*')
                                .eq('league_id', leagueId)
                                .eq('status', 'completed');

                            // Get league info
                            const { data: leagueData } = await supabase
                                .from('leagues')
                                .select('*')
                                .eq('id', leagueId)
                                .single();

                            if (allMatches && leagueData) {
                                // Calculate standings
                                const participantIds = leagueData.participant_ids || [];
                                const standings = participantIds.map((pid: string) => {
                                    const stats = { id: pid, points: 0, gd: 0, gf: 0 };
                                    allMatches.forEach((m: any) => {
                                        if (m.home_user_id === pid || m.away_user_id === pid) {
                                            const isHome = m.home_user_id === pid;
                                            const pScore = isHome ? m.home_score : m.away_score;
                                            const oScore = isHome ? m.away_score : m.home_score;

                                            if (pScore > oScore) stats.points += 3;
                                            else if (pScore === oScore) stats.points += 1;
                                            stats.gd += (pScore - oScore);
                                            stats.gf += pScore;
                                        }
                                    });
                                    return stats;
                                }).sort((a: any, b: any) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

                                const rank = standings.findIndex((s: any) => s.id === user.id) + 1;

                                let rankMessage = `You are currently sitting at #${rank} in the tables. 📊`;
                                if (rank === 1) rankMessage = "You are TOP of the league! 🥇 Everyone is chasing you!";
                                else if (rank === standings.length) rankMessage = "Currently bottom of the pile... 📉 Time to wake up!";

                                // Save table position notification
                                await supabase
                                    .from('notifications')
                                    .insert({
                                        user_id: user.id,
                                        type: 'match',
                                        title: 'League Update 📋',
                                        message: rankMessage
                                    });

                                console.log('✅ Table position notification saved!');
                            }
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
                            message = notificationService.getRandomMessage(LEAGUE_MESSAGES.created);
                            shouldNotify = true;
                        } else if (eventType === 'UPDATE' && newLeague.status === 'finished') {
                            title = 'League Finished 🏁';
                            message = notificationService.getRandomMessage(LEAGUE_MESSAGES.finished);
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
