import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { MusicProvider } from "./providers/MusicProvider";
import { MusicControl } from "./components/Music/MusicControl";
import { MobileNav } from "./components/Layout/MobileNav";
import { LoadingScreen } from "./components/LoadingScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Library from "./pages/Library";
import AILab from "./pages/AILab";
import Settings from "./pages/Settings";
import Train from "./pages/Train";
import NotFound from "./pages/NotFound";
import "./styles/neumorph.css";

const queryClient = new QueryClient();

function AppContent() {
  const { loading } = useAuth();
  
  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <div className="pb-[6.5rem] md:pb-12">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/library" element={<Library />} />
          <Route path="/ai-lab" element={<AILab />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <MusicControl />
      <MobileNav />
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MusicProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </MusicProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
