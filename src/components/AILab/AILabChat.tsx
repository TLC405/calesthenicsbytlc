import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Plus, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DifficultyBadge } from '@/components/Exercise/DifficultyBadge';
import { VideoPlayer } from '@/components/Exercise/VideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  exercises?: SuggestedExercise[];
}

interface SuggestedExercise {
  name: string;
  category: string;
  difficulty: number;
  primary_muscles: string[];
  cues: string[];
  youtube_search: string;
  youtube_url?: string;
}

interface AILabChatProps {
  onAddToNotepad?: (items: { name: string; section: 'warmup' | 'workout' | 'cooldown' | 'compression' }[]) => void;
}

export function AILabChat({ onAddToNotepad }: AILabChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! 👋 I'm your AI training coach. Ask me to build a workout, suggest exercises, or help with progressions. Try: \"Build me a full body workout with warm-up and cool-down\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoPopup, setVideoPopup] = useState<{ url: string; title: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('discover-exercises', {
        body: { query: userMessage },
      });
      if (response.error) throw new Error(response.error.message || 'Failed to get response');
      const data = response.data;
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || data.content, exercises: data.exercises }]);
    } catch (error: any) {
      console.error('AI Lab error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to get AI response', variant: 'destructive' });
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addExerciseToLibrary = async (exercise: SuggestedExercise) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({ title: 'Sign in required', description: 'Please sign in to add exercises', variant: 'destructive' });
        return;
      }
      const slug = exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { error } = await supabase.from('exercises').insert({
        name: exercise.name, slug: `${slug}-${Date.now()}`, category: exercise.category,
        primary_muscles: exercise.primary_muscles, secondary_muscles: [], equipment: ['None (Bodyweight)'],
        cues: exercise.cues, difficulty_level: exercise.difficulty, created_by: userData.user.id,
        youtube_url: exercise.youtube_url || null,
      });
      if (error) throw error;
      toast({ title: 'Exercise added!', description: `${exercise.name} is now in your library` });
    } catch (error: any) {
      toast({ title: 'Error adding exercise', description: error.message, variant: 'destructive' });
    }
  };

  const playVideo = (exercise: SuggestedExercise) => {
    if (exercise.youtube_url) {
      setVideoPopup({ url: exercise.youtube_url, title: exercise.name });
    } else {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube_search + ' tutorial calisthenics')}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const guessSection = (category: string): 'warmup' | 'workout' | 'cooldown' | 'compression' => {
    const cat = category.toLowerCase();
    if (['mobility', 'flexibility', 'yoga'].includes(cat)) return 'warmup';
    return 'workout';
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}

              <div className={cn('max-w-[80%] space-y-3', message.role === 'user' ? 'order-1' : '')}>
                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border/50 bg-card text-foreground'
                )}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>

                {message.exercises && message.exercises.length > 0 && (
                  <div className="space-y-2">
                    {/* Add all to notepad button */}
                    {onAddToNotepad && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] font-mono uppercase tracking-wider rounded-xl border-border/50 gap-1"
                        onClick={() => onAddToNotepad(
                          message.exercises!.map(e => ({ name: e.name, section: guessSection(e.category) }))
                        )}
                      >
                        <Plus className="w-3 h-3" />
                        Add All to Notepad
                      </Button>
                    )}

                    {message.exercises.map((exercise, i) => (
                      <div key={i} className="rounded-2xl border border-border/50 bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-display font-semibold text-sm">{exercise.name}</h4>
                              <span className="text-[10px] font-mono text-muted-foreground uppercase">{exercise.category}</span>
                              <DifficultyBadge level={exercise.difficulty} size="sm" />
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {exercise.primary_muscles.map(muscle => (
                                <Badge key={muscle} variant="secondary" className="text-[10px] border border-border/30 rounded-lg">{muscle}</Badge>
                              ))}
                            </div>
                            {exercise.cues.length > 0 && (
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {exercise.cues.slice(0, 3).map((cue, j) => (
                                  <li key={j} className="flex items-start gap-1.5">
                                    <span className="text-muted-foreground/40 mt-0.5">•</span>
                                    {cue}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <Button size="sm" className="h-7 text-xs rounded-xl" onClick={() => addExerciseToLibrary(exercise)}>
                              <Plus className="w-3 h-3 mr-1" />Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs rounded-xl border-border/50"
                              onClick={() => playVideo(exercise)}
                            >
                              <Play className="w-3 h-3 mr-1" fill="currentColor" />Video
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="rounded-2xl border border-border/50 bg-card px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/30 p-4">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Build me a push day with warm-up..."
            disabled={isLoading}
            className="flex-1 h-11 bg-card rounded-xl border-border/50 focus:border-ring"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-11 w-11 rounded-xl">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-2 font-mono uppercase tracking-wider">
          Powered by AI · I Got The Power
        </p>
      </div>

      {/* Video Popup */}
      <Dialog open={!!videoPopup} onOpenChange={(isOpen) => !isOpen && setVideoPopup(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl border border-border/50 bg-background">
          {videoPopup && (
            <VideoPlayer
              youtubeUrl={videoPopup.url}
              title={videoPopup.title}
              thumbnailMode={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
