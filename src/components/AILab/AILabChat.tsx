import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
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
      content: "Hey! 👋 I'm your AI training assistant. Ask me about exercise progressions, workout techniques, or let me help you discover new movements. Try: \"What are some progressions for the planche?\" or \"Suggest exercises for building pulling strength\"",
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

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response');
      }

      const data = response.data;
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || data.content,
        exercises: data.exercises,
      }]);
    } catch (error: any) {
      console.error('AI Lab error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive',
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again!",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addExerciseToLibrary = async (exercise: SuggestedExercise) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to add exercises to your library',
          variant: 'destructive',
        });
        return;
      }

      const slug = exercise.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase.from('exercises').insert({
        name: exercise.name,
        slug: `${slug}-${Date.now()}`,
        category: exercise.category,
        primary_muscles: exercise.primary_muscles,
        secondary_muscles: [],
        equipment: ['None (Bodyweight)'],
        cues: exercise.cues,
        difficulty_level: exercise.difficulty,
        created_by: userData.user.id,
      });

      if (error) throw error;

      toast({
        title: 'Exercise added! 💪',
        description: `${exercise.name} is now in your library`,
      });
    } catch (error: any) {
      toast({
        title: 'Error adding exercise',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={cn(
                'max-w-[80%] space-y-3',
                message.role === 'user' ? 'order-1' : ''
              )}>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.exercises && message.exercises.length > 0 && (
                  <div className="space-y-2">
                    {message.exercises.map((exercise, i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">{exercise.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {exercise.category}
                                </Badge>
                                <DifficultyBadge level={exercise.difficulty} size="sm" />
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {exercise.primary_muscles.map(muscle => (
                                  <Badge key={muscle} variant="secondary" className="text-xs">
                                    {muscle}
                                  </Badge>
                                ))}
                              </div>

                              {exercise.cues.length > 0 && (
                                <ul className="text-xs text-muted-foreground list-disc list-inside">
                                  {exercise.cues.slice(0, 3).map((cue, j) => (
                                    <li key={j}>{cue}</li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => addExerciseToLibrary(exercise)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a
                                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube_search)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Video
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 max-w-3xl mx-auto"
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about exercises, progressions, or techniques..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-2">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Powered by Lovable AI • Ask anything about calisthenics training
        </p>
      </div>
    </div>
  );
}