import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DifficultyBadge } from '@/components/Exercise/DifficultyBadge';
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
}

export function AILabChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! 👋 I'm your AI training assistant. Ask me about exercise progressions, workout techniques, or let me help you discover new movements.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      });
      if (error) throw error;
      toast({ title: 'Exercise added!', description: `${exercise.name} is now in your library` });
    } catch (error: any) {
      toast({ title: 'Error adding exercise', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'assistant' && (
                <div className="w-7 h-7 border-2 border-foreground bg-secondary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-foreground" />
                </div>
              )}
              
              <div className={cn('max-w-[80%] space-y-3', message.role === 'user' ? 'order-1' : '')}>
                <div className={cn(
                  'border-2 px-4 py-3 text-sm',
                  message.role === 'user'
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-foreground/20 bg-card text-foreground'
                )}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>

                {message.exercises && message.exercises.length > 0 && (
                  <div className="space-y-2">
                    {message.exercises.map((exercise, i) => (
                      <div key={i} className="border-2 border-foreground/20 bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-display font-semibold text-sm">{exercise.name}</h4>
                              <span className="text-[10px] font-mono text-muted-foreground uppercase">{exercise.category}</span>
                              <DifficultyBadge level={exercise.difficulty} size="sm" />
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {exercise.primary_muscles.map(muscle => (
                                <Badge key={muscle} variant="secondary" className="text-[10px] border border-foreground/10">{muscle}</Badge>
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
                            <Button size="sm" className="h-7 text-xs border-2 border-foreground" onClick={() => addExerciseToLibrary(exercise)}>
                              <Plus className="w-3 h-3 mr-1" />Add
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-2 border-foreground/30" asChild>
                              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube_search)}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />Video
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-7 h-7 border-2 border-foreground bg-foreground flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-background" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 border-2 border-foreground bg-secondary flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-foreground" />
              </div>
              <div className="border-2 border-foreground/20 bg-card px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input — brutalist */}
      <div className="border-t-2 border-foreground p-4">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about exercises, progressions, or techniques..."
            disabled={isLoading}
            className="flex-1 h-10 bg-card border-2 border-foreground/20 focus:border-foreground"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-10 w-10 border-2 border-foreground">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-2 font-mono uppercase tracking-wider">
          Powered by AI
        </p>
      </div>
    </div>
  );
}
