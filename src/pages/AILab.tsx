import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Dumbbell, Target, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AILabChat } from '@/components/AILab/AILabChat';
import { useAuth } from '@/providers/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface WorkoutItem {
  name: string;
  section: 'warmup' | 'workout' | 'cooldown' | 'compression';
}

export default function AILab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [notepad, setNotepad] = useState<WorkoutItem[]>([]);
  const [notepadOpen, setNotepadOpen] = useState(false);

  const addToNotepad = (items: WorkoutItem[]) => {
    setNotepad(prev => [...prev, ...items]);
  };

  const removeFromNotepad = (idx: number) => {
    setNotepad(prev => prev.filter((_, i) => i !== idx));
  };

  const sections = ['warmup', 'workout', 'cooldown', 'compression'] as const;
  const sectionLabels: Record<string, string> = { warmup: '🔥 Warm-Up', workout: '💪 Workout', cooldown: '❄️ Cool-Down', compression: '💆 Compression' };

  const NotepadContent = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold tracking-tight">Workout Notepad</h3>
        <span className="text-[9px] font-mono text-muted-foreground">{notepad.length} items</span>
      </div>

      {notepad.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">Ask AI to build a workout and it'll appear here</p>
        </div>
      ) : (
        <>
          {sections.map(sec => {
            const items = notepad.filter(i => i.section === sec);
            if (items.length === 0) return null;
            return (
              <div key={sec}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">{sectionLabels[sec]}</p>
                <div className="space-y-1">
                  {items.map((item, i) => {
                    const globalIdx = notepad.indexOf(item);
                    return (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-accent/30 border border-border/30">
                        <span className="text-xs font-medium truncate">{item.name}</span>
                        <button onClick={() => removeFromNotepad(globalIdx)} className="text-muted-foreground hover:text-destructive text-[10px]">×</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <Button
            onClick={() => navigate('/planner')}
            size="sm"
            className="w-full h-10 text-[10px] font-mono uppercase tracking-wider rounded-xl gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Open in Builder
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight">AI Coach</h1>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Build with AI</p>
            </div>
          </div>

          {/* Mobile notepad toggle */}
          {isMobile && user && (
            <Sheet open={notepadOpen} onOpenChange={setNotepadOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-[10px] font-mono uppercase tracking-wider rounded-xl border-border/50 gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Notepad
                  {notepad.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center">{notepad.length}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
                <SheetHeader>
                  <SheetTitle className="sr-only">Workout Notepad</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full">
                  <NotepadContent />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-border/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Unlock AI Coaching</h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Personalized exercise recommendations and workout building.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Brain, label: 'Smart' },
                  { icon: Dumbbell, label: 'Build' },
                  { icon: Target, label: 'Goals' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-xl border border-border/40 bg-card p-3 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground" />
                    <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate('/auth')} className="w-full h-11 font-display font-bold uppercase tracking-wider text-sm rounded-xl">
                Sign In to Continue
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* AI Chat */}
            <div className="flex-1 flex flex-col min-h-0">
              <AILabChat onAddToNotepad={addToNotepad} />
            </div>

            {/* Desktop Notepad Panel */}
            {!isMobile && (
              <div className="w-80 border-l border-border/30 bg-card/50 hidden lg:block">
                <ScrollArea className="h-[calc(100vh-4rem)]">
                  <NotepadContent />
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
