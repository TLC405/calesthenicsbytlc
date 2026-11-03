import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type N = { id: string; title: string; body: string | null; read: boolean; created_at: string };

export function NotificationBell() {
  const [items, setItems] = useState<N[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("notifications").select("id,title,body,read,created_at").order("created_at", { ascending: false }).limit(30);
    setItems((data as N[]) ?? []);
  }, []);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null)); }, []);

  useEffect(() => {
    if (!uid) return;
    load();
    const ch = supabase
      .channel(`notif-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, load]);

  const unread = items.filter((i) => !i.read).length;
  const markAll = async () => {
    if (!uid || !unread) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", uid).eq("read", false);
    load();
  };

  if (!uid) return null;
  return (
    <Popover onOpenChange={(o) => o && markAll()}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl p-0">
        <div className="border-b border-border px-4 py-2 text-sm font-bold">Notifications</div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">All caught up.</p>}
          {items.map((n) => (
            <div key={n.id} className={`border-b border-border/50 px-4 py-3 text-sm ${n.read ? "" : "bg-primary/5"}`}>
              <p className="font-semibold">{n.title}</p>
              {n.body && <p className="text-muted-foreground">{n.body}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
