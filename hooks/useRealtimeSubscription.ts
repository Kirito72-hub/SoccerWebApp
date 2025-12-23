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
        if (!enabled) {
            console.log(`[Realtime] Subscription disabled for ${table}`);
            return;
        }

        // Use a unique channel name with timestamp to avoid conflicts
        const channelName = `${table}-realtime-${Math.random().toString(36).substr(2, 9)}`;
        let channel: RealtimeChannel;

        const setupSubscription = () => {
            console.log(`[Realtime] Setting up subscription for ${table}...`);

            channel = supabase.channel(channelName);

            const config: any = {
                event,
                schema: 'public',
                table
            };

            if (filter) {
                config.filter = filter;
            }

            console.log(`[Realtime] Config:`, config);

            channel.on(
                'postgres_changes',
                config,
                (payload) => {
                    console.log(`[Realtime] 🔴 ${table} ${payload.eventType}:`, payload);

                    switch (payload.eventType) {
                        case 'INSERT':
                            console.log(`[Realtime] Calling onInsert for ${table}`);
                            onInsert?.(payload.new);
                            break;
                        case 'UPDATE':
                            console.log(`[Realtime] Calling onUpdate for ${table}`);
                            onUpdate?.(payload.new);
                            break;
                        case 'DELETE':
                            console.log(`[Realtime] Calling onDelete for ${table}`);
                            onDelete?.(payload.old);
                            break;
                    }
                }
            );

            channel.subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Realtime] ✅ Successfully subscribed to ${table}`);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error(`[Realtime] ❌ Channel error for ${table}:`, err);
                } else if (status === 'TIMED_OUT') {
                    console.error(`[Realtime] ⏱️ Subscription timed out for ${table}`);
                } else {
                    console.log(`[Realtime] Status for ${table}:`, status);
                }
            });
        };

        setupSubscription();

        return () => {
            if (channel) {
                console.log(`[Realtime] 🔌 Unsubscribing from ${table}`);
                supabase.removeChannel(channel);
            }
        };
    }, [table, event, filter, onInsert, onUpdate, onDelete, enabled]);
};
