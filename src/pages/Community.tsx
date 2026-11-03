import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Megaphone, Send, Trash2 } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

type Msg = { id: string; user_id: string; author_name: string; content: string; created_at: string };
type Like = { message_id: string; user_id: string };

export default function Community() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [uid, setUid] = useState<string | null>(null);
  const [name, setName] = useState("Athlete");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [text, setText] = useState("");
  const [notifyFor, setNotifyFor] = useState<Msg | null>(null);
  const [nTitle, setNTitle] = useState("");
  const [nBody, setNBody] = useState("");

  const load = useCallback(async () => {
    const [{ data: m }, { data: l }] = await Promise.all([
      supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("message_likes").select("message_id,user_id"),
    ]);
    setMsgs((m as Msg[]) ?? []);
    setLikes((l as Like[]) ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return nav("/auth");
      setUid(data.user.id);
      const { data: p } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).maybeSingle();
      if (p?.display_name) setName(p.display_name.split("@")[0]);
      load();
    });
  }, [nav, load]);

  const post = async () => {
    if (!uid || !text.trim()) return;
    const { error } = await supabase.from("messages").insert({ user_id: uid, author_name: name, content: text.trim().slice(0, 1000) });
    if (error) return toast({ title: "Couldn't post", description: error.message, variant: "destructive" });
    setText(""); load();
  };

  const toggleLike = async (m: Msg) => {
    if (!uid) return;
    const mine = likes.some((l) => l.message_id === m.id && l.user_id === uid);
    if (mine) await supabase.from("message_likes").delete().eq("message_id", m.id).eq("user_id", uid);
    else await supabase.from("message_likes").insert({ message_id: m.id, user_id: uid });
    load();
  };

  const remove = async (m: Msg) => { await supabase.from("messages").delete().eq("id", m.id); load(); };

  const sendNotify = async () => {
    if (!notifyFor || !nTitle.trim()) return;
    const { data, error } = await supabase.rpc("notify_message_likers", { _message_id: notifyFor.id, _title: nTitle.trim(), _body: nBody.trim() });
    if (error) return toast({ title: "Not sent", description: error.message, variant: "destructive" });
    toast({ title: "Notification sent", description: `Delivered to ${data ?? 0} people` });
    setNotifyFor(null); setNTitle(""); setNBody("");
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-2xl">
        <Button size="icon" variant="ghost" onClick={() => nav("/dashboard")} aria-label="Back"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="flex-1 text-lg font-black tracking-tight">Community</h1>
        <NotificationBell />
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Share a win, a PR, a question…" className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0" />
          <div className="flex justify-end"><Button onClick={post} disabled={!text.trim()} className="rounded-xl"><Send className="mr-1 h-4 w-4" />Post</Button></div>
        </div>

        {msgs.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No posts yet — be the first.</p>}

        {msgs.map((m) => {
          const count = likes.filter((l) => l.message_id === m.id).length;
          const liked = likes.some((l) => l.message_id === m.id && l.user_id === uid);
          const mine = m.user_id === uid;
          return (
            <article key={m.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{m.author_name}</span>
                <span>{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              <div className="mt-3 flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggleLike(m)} className={liked ? "text-primary" : ""}>
                  <Heart className={`mr-1 h-4 w-4 ${liked ? "fill-current" : ""}`} />{count}
                </Button>
                {mine && (
                  <>
                    <Button size="sm" variant="ghost" disabled={count === 0} onClick={() => setNotifyFor(m)}><Megaphone className="mr-1 h-4 w-4" />Notify likers</Button>
                    <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={() => remove(m)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={!!notifyFor} onOpenChange={(o) => !o && setNotifyFor(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Notify everyone who liked this</DialogTitle></DialogHeader>
          <Input value={nTitle} onChange={(e) => setNTitle(e.target.value)} maxLength={120} placeholder="Title" />
          <Textarea value={nBody} onChange={(e) => setNBody(e.target.value)} maxLength={500} placeholder="Message (optional)" />
          <Button onClick={sendNotify} disabled={!nTitle.trim()} className="rounded-xl">Send</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
