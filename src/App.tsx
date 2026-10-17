import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { MusicProvider } from "./providers/MusicProvider";
import { MusicControl } from "./components/Music/MusicControl";
import { MobileNav } from "./components/Layout/MobileNav";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Library from "./pages/Library";
import AILab from "./pages/AILab";
import Settings from "./pages/Settings";
import Train from "./pages/Train";
import Anatomy from "./pages/Anatomy";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import Admin from "./pages/Admin";
import "./styles/neumorph.css";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <BrowserRouter>
      <div className="pb-[4.5rem] md:pb-0">
        <Routes>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route path="/auth" element={<Navigate to="/library" replace />} />
          <Route path="/admin-login" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/library" element={<Library />} />
          <Route path="/ai-lab" element={<AILab />} />
          <Route path="/train" element={<Train />} />
          <Route path="/anatomy" element={<Anatomy />} />
          <Route path="/community" element={<Community />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
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
