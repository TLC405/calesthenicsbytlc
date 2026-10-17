import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MessageLikeButtonProps {
  messageId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  currentUserId?: string;
  demo?: boolean;
  onToggle?: (nextLiked: boolean) => void;
}

export function MessageLikeButton({
  messageId,
  initialLiked,
  initialLikeCount,
  currentUserId,
  demo = false,
  onToggle,
}: MessageLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!pending) {
      setLiked(initialLiked);
      setLikeCount(initialLikeCount);
    }
  }, [initialLiked, initialLikeCount, pending]);

  async function toggleLike() {
    if (pending || !currentUserId) return;
    const previousLiked = liked;
    const previousCount = likeCount;
    const nextLiked = !previousLiked;

    setPending(true);
    setLiked(nextLiked);
    setLikeCount(Math.max(0, previousCount + (nextLiked ? 1 : -1)));

    if (demo) {
      onToggle?.(nextLiked);
      setPending(false);
      return;
    }

    const { error } = nextLiked
      ? await supabase.from('message_likes').insert({
          message_id: messageId, user_id: currentUserId,
        })
      : await supabase.from('message_likes').delete().match({
          message_id: messageId, user_id: currentUserId,
        });

    if (error) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error('Could not update your like', { description: error.message });
    } else {
      onToggle?.(nextLiked);
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
      aria-pressed={liked}
      disabled={pending || !currentUserId}
      onClick={toggleLike}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:opacity-60',
        liked
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/15'
          : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <Heart className={cn('h-4 w-4 transition-transform', liked && 'fill-current scale-110')} />
      <span className="font-stats tabular-nums">{likeCount}</span>
    </button>
  );
}
