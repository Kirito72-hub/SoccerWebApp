import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions {
    table: string;
    event?: RealtimeEvent;
    filter?: string;
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
    enabled?: boolean;
}

/**
 * Custom hook for Supabase Realtime subscriptions
 * Automatically subscribes/unsubscribes based on component lifecycle
 */
export const useRealtimeSubscription = ({
    table,
    event = '*',
    filter,
    onInsert,
    onUpdate,
    onDelete,
    enabled = true
}: UseRealtimeSubscriptionOptions) => {
    useEffect(() => {
        if (!enabled) return;

        const channelName = `${table}-${Date.now()}`;
        let channel: RealtimeChannel;

        const setupSubscription = () => {
            channel = supabase.channel(channelName);

            const config: any = {
                event,
                schema: 'public',
                table
            };

            if (filter) {
                config.filter = filter;
            }

            channel.on(
                'postgres_changes',
                config,
                (payload) => {
                    console.log(`[Realtime] ${table} change:`, payload.eventType, payload);

                    switch (payload.eventType) {
                        case 'INSERT':
                            onInsert?.(payload.new);
                            break;
                        case 'UPDATE':
                            onUpdate?.(payload.new);
                            break;
                        case 'DELETE':
                            onDelete?.(payload.old);
                            break;
                    }
                }
            );

            channel.subscribe((status) => {
                console.log(`[Realtime] ${table} subscription status:`, status);
            });
        };

        setupSubscription();

        return () => {
            if (channel) {
                channel.unsubscribe();
                console.log(`[Realtime] Unsubscribed from ${table}`);
            }
        };
    }, [table, event, filter, onInsert, onUpdate, onDelete, enabled]);
};
