import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

/**
 * Simple Realtime Test Page
 * Use this to test if Supabase Realtime is working
 */
const RealtimeTest: React.FC = () => {
    const [status, setStatus] = useState<string>('Not connected');
    const [messages, setMessages] = useState<string[]>([]);
    const [leagues, setLeagues] = useState<any[]>([]);

    const addMessage = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setMessages(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 20));
    };

    useEffect(() => {
        addMessage('🔄 Setting up realtime subscription...');

        const channel = supabase
            .channel('realtime-test-channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'leagues'
                },
                (payload) => {
                    addMessage(`🔴 REALTIME EVENT: ${payload.eventType}`);
                    addMessage(`📦 Data: ${JSON.stringify(payload.new || payload.old)}`);

                    if (payload.eventType === 'INSERT') {
                        setLeagues(prev => [...prev, payload.new]);
                    } else if (payload.eventType === 'UPDATE') {
                        setLeagues(prev => prev.map(l =>
                            l.id === payload.new.id ? payload.new : l
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setLeagues(prev => prev.filter(l => l.id !== payload.old.id));
                    }
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    setStatus('✅ Connected');
                    addMessage('✅ Successfully subscribed to leagues table');
                } else if (status === 'CHANNEL_ERROR') {
                    setStatus('❌ Error');
                    addMessage(`❌ Channel error: ${err?.message || 'Unknown error'}`);
                } else if (status === 'TIMED_OUT') {
                    setStatus('⏱️ Timed out');
                    addMessage('⏱️ Connection timed out');
                } else {
                    setStatus(`Status: ${status}`);
                    addMessage(`Status: ${status}`);
                }
            });

        // Load initial leagues
        const loadLeagues = async () => {
            try {
                const { data, error } = await supabase
                    .from('leagues')
                    .select('*')
                    .limit(5);

                if (error) {
                    addMessage(`❌ Error loading leagues: ${error.message}`);
                } else {
                    setLeagues(data || []);
                    addMessage(`✅ Loaded ${data?.length || 0} leagues`);
                }
            } catch (err: any) {
                addMessage(`❌ Exception: ${err.message}`);
            }
        };

        loadLeagues();

        return () => {
            addMessage('🔌 Unsubscribing...');
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="glass rounded-3xl border border-white/10 p-6">
                    <h1 className="text-3xl font-black mb-2">🔴 Realtime Test Page</h1>
                    <p className="text-gray-400">Testing Supabase Realtime Connection</p>
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-sm font-bold">Status:</span>
                        <span className={`px-3 py-1 rounded-lg font-bold text-sm ${status.includes('✅')
                                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                : status.includes('❌')
                                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                    : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                            {status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Messages Log */}
                    <div className="glass rounded-3xl border border-white/10 p-6">
                        <h2 className="text-xl font-black mb-4">📝 Console Messages</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 text-sm">No messages yet...</p>
                            ) : (
                                messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className="text-xs font-mono bg-black/30 p-2 rounded border border-white/5"
                                    >
                                        {msg}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Leagues List */}
                    <div className="glass rounded-3xl border border-white/10 p-6">
                        <h2 className="text-xl font-black mb-4">🏆 Leagues ({leagues.length})</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {leagues.length === 0 ? (
                                <p className="text-gray-500 text-sm">No leagues loaded...</p>
                            ) : (
                                leagues.map((league) => (
                                    <div
                                        key={league.id}
                                        className="bg-black/30 p-3 rounded border border-white/5"
                                    >
                                        <p className="font-bold text-sm">{league.name}</p>
                                        <p className="text-xs text-gray-500">
                                            Status: {league.status} | Format: {league.format}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="glass rounded-3xl border border-yellow-500/30 bg-yellow-600/10 p-6">
                    <h3 className="text-lg font-black mb-3 text-yellow-400">📋 Test Instructions:</h3>
                    <ol className="space-y-2 text-sm">
                        <li className="flex gap-2">
                            <span className="font-bold text-yellow-400">1.</span>
                            <span>Open this page in <strong>two browser windows</strong> (or desktop + mobile)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-yellow-400">2.</span>
                            <span>Check if status shows <strong className="text-emerald-400">✅ Connected</strong></span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-yellow-400">3.</span>
                            <span>In Supabase SQL Editor, run:</span>
                        </li>
                        <li className="ml-6">
                            <code className="text-xs bg-black/50 px-2 py-1 rounded">
                                INSERT INTO leagues (name, admin_id, format, status, participant_ids, created_at)
                                VALUES ('TEST', (SELECT id FROM users LIMIT 1), 'round_robin_1leg', 'running', ARRAY[]::uuid[], NOW());
                            </code>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-yellow-400">4.</span>
                            <span>Watch the <strong>Console Messages</strong> - you should see a 🔴 REALTIME EVENT</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-yellow-400">5.</span>
                            <span>The new league should appear in the <strong>Leagues</strong> list</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default RealtimeTest;
