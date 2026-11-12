import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { MusicProvider } from "./providers/MusicProvider";
import { InlineSoundtrackSlot } from "./components/Music/InlineSoundtrackSlot";
import Skills from "./pages/Skills";
import More from "./pages/More";
import LevelAssessment from "./pages/LevelAssessment";
import VideoAudit from "./pages/VideoAudit";
import { MobileNav } from "./components/Layout/MobileNav";
import Index from "./pages/Index";
import PowerIntro from "./pages/PowerIntro";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Library from "./pages/Library";
import AILab from "./pages/AILab";
import AccountSettings from "./pages/Settings";
import Settings from "./pages/TrainingSettings";
import { AppControls } from "./components/Layout/AppControls";
import { TrainingEntry } from "./components/Layout/TrainingEntry";
import { LaunchHome } from "./components/Layout/LaunchHome";
import Train from "./pages/Train";
import ActiveWorkout from "./pages/ActiveWorkout";
import SkillStudio from "./pages/SkillStudio";
import Anatomy from "./pages/Anatomy";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import Admin from "./pages/Admin";
import "./styles/neumorph.css";
import "./styles/focus-training.css";
import "./styles/movement-learning.css";
import "./styles/superhuman-brand.css";
import "./styles/superhuman-ui-v2.css";
import { useTheme } from './components/ThemeSwitcher';

const queryClient = new QueryClient();

function AppContent() {
  useTheme();
  return (
    <BrowserRouter>
      <LaunchHome />
      <AppControls />
      <div className="power-app-shell min-w-0 md:pb-0">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/intro" element={<PowerIntro />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/admin-login" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/today" element={<TrainingEntry />} />
          <Route path="/planner" element={<TrainingEntry />} />
          <Route path="/library" element={<Library />} />
          <Route path="/ai-lab" element={<AILab />} />
          <Route path="/train" element={<TrainingEntry />} />
          <Route path="/routine-days" element={<Navigate to="/skills" replace />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/assessment" element={<LevelAssessment />} />
          <Route path="/videos" element={<VideoAudit />} />
          <Route path="/more" element={<More />} />
          <Route path="/workout" element={<ActiveWorkout />} />
          <Route path="/skills/:skillId" element={<SkillStudio />} />
          <Route path="/build" element={<TrainingEntry />} />
          <Route path="/anatomy" element={<Anatomy />} />
          <Route path="/community" element={<Community />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <InlineSoundtrackSlot />
      </div>
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
