import { useState } from 'react';
import { Bell, CheckCheck, Heart, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, type NotificationItem } from '@/hooks/useNotifications';

const sample: NotificationItem[] = [
  {
    id: 'demo-notification-1',
    recipient_id: 'demo-user',
    actor_id: 'demo-maya',
    type: 'message_like',
    entity_id: 'demo-post-you',
    message: 'Maya liked your handstand progress update.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

export function NotificationBell({ userId, demo = false }: { userId?: string; demo?: boolean }) {
  const navigate = useNavigate();
  const live = useNotifications(demo ? undefined : userId);
  const [demoItems, setDemoItems] = useState<NotificationItem[]>(sample);
  const items = demo ? demoItems : live.notifications;
  const count = demo ? demoItems.filter(n => !n.is_read).length : live.unreadCount;

  function read(id: string) {
    if (demo) setDemoItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    else void live.markAsRead(id);
  }

  function readAll() {
    if (demo) setDemoItems(prev => prev.map(n => ({ ...n, is_read: true })));
    else void live.markAllAsRead();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
          className="relative h-11 w-11 rounded-2xl border-border/60 bg-card shadow-sm"
        >
          <Bell className="h-[19px] w-[19px]" />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 min-w-[19px] h-[19px] px-1 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-background">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10}
        className="w-[min(360px,calc(100vw-24px))] max-h-[70dvh] overflow-y-auto rounded-2xl p-2 shadow-xl border-border/60"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-3 py-3">
          <div>
            <p className="font-display text-sm font-extrabold">Activity</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {count ? `${count} unread notification${count === 1 ? '' : 's'}` : 'All caught up'}
            </p>
          </div>
          {count > 0 && (
            <button onClick={readAll} type="button"
              className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 px-5 text-center text-muted-foreground">
            <Inbox className="h-7 w-7 opacity-50" />
            <p className="text-xs">No notifications yet. Share a training milestone!</p>
          </div>
        ) : items.map(item => (
          <DropdownMenuItem key={item.id}
            onSelect={() => {
              read(item.id);
              navigate(`/community#post-${item.entity_id}`);
            }}
            className={`my-1 flex items-start gap-3 rounded-xl p-3 cursor-pointer focus:bg-accent ${!item.is_read ? 'bg-primary/5' : 'opacity-75'}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs leading-relaxed text-foreground">{item.message}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
            {!item.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </DropdownMenuItem>
        ))}
        {demo && <p className="px-3 py-2 text-center text-[10px] text-muted-foreground border-t border-border/40">Sample activity · demo mode</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
