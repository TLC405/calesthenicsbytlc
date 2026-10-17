import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: string;
  entity_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Recipient-scoped inbox with an exact unread count (not just the latest 30).
 * Database RLS enforces the same boundary; this filter is an additional guard.
 */
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(userId));
  const seenIds = useRef(new Set<string>());

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    if (!error) setUnreadCount(count ?? 0);
  }, [userId]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      supabase.from('notifications').select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false }).limit(30),
      supabase.from('notifications').select('id', { count: 'exact', head: true })
        .eq('recipient_id', userId).eq('is_read', false),
    ]);

    if (!error && data) {
      // Merge rather than replace: an INSERT event can arrive during the fetch.
      setNotifications(prev => {
        const byId = new Map<string, NotificationItem>();
        for (const item of [...prev, ...data]) byId.set(item.id, item);
        return [...byId.values()]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 30);
      });
      data.forEach(item => seenIds.current.add(item.id));
    }
    if (!countError) setUnreadCount(count ?? 0);
    if (error) console.error('Notification inbox unavailable:', error.message);
    setLoading(false);
  }, [userId]);

  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return;
    const { error } = await supabase.from('notifications')
      .update({ is_read: true }).eq('id', id).eq('recipient_id', userId);
    if (error) {
      toast.error('Could not mark notification as read');
      return;
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    void refreshUnreadCount();
  }, [userId, refreshUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase.from('notifications')
      .update({ is_read: true }).eq('recipient_id', userId).eq('is_read', false);
    if (error) {
      toast.error('Could not clear notifications');
      return;
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    void refreshUnreadCount();
  }, [userId, refreshUnreadCount]);

  useEffect(() => {
    seenIds.current.clear();
    setNotifications([]);
    setUnreadCount(0);
    if (!userId) {
      setLoading(false);
      return;
    }
    void fetchNotifications();

    const channel = supabase
      .channel(`power-circle-notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      }, payload => {
        const incoming = payload.new as NotificationItem;
        if (incoming.recipient_id !== userId || seenIds.current.has(incoming.id)) return;
        seenIds.current.add(incoming.id);
        setNotifications(prev => [incoming, ...prev.filter(n => n.id !== incoming.id)].slice(0, 30));
        void refreshUnreadCount();
        toast('New like received ❤️', { description: incoming.message });
      })
      .subscribe(status => {
        // Reconcile missed WebSocket events after reconnect/backgrounding.
        if (status === 'SUBSCRIBED') void fetchNotifications();
      });

    return () => { void supabase.removeChannel(channel); };
  }, [userId, fetchNotifications, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
