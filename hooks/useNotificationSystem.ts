import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { notificationService } from '../services/notificationService';
import { User, Match, League } from '../types';

export const useNotificationSystem = (user: User | null) => {
    useEffect(() => {
        if (!user) return;

        console.log('🔔 Initializing Notification System for:', user.username);

        // Subscribe to MATCHES
        const matchSubscription = supabase
            .channel('notification-matches')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'matches' },
                (payload) => {
                    console.log('🔔 Match Update Received:', payload);
                    try {
                        const newMatch = payload.new as Match;
                        console.log('🎯 Calling handleMatchUpdate for user:', user.id);
                        notificationService.handleMatchUpdate(newMatch, user.id);
                        console.log('✅ handleMatchUpdate call completed');
                    } catch (error) {
                        console.error('❌ Error in match update handler:', error);
                    }
                }
            )
            .subscribe();

        // Subscribe to LEAGUES
        const leagueSubscription = supabase
            .channel('notification-leagues')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leagues' },
                (payload) => {
                    console.log('🔔 League Update Received:', payload);
                    const newLeague = payload.new as League;
                    const eventType = payload.eventType; // INSERT, UPDATE

                    if (newLeague && (eventType === 'INSERT' || eventType === 'UPDATE')) {
                        notificationService.handleLeagueUpdate(newLeague, user.id, eventType);
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
