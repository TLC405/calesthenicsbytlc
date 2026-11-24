import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { MusicProvider } from "./providers/MusicProvider";
import { InlineSoundtrackSlot } from "./components/Music/InlineSoundtrackSlot";
import { lazy, Suspense } from "react";
const Skills=lazy(()=>import("./pages/Skills"));
const MasterSkillMap = lazy(()=>import("./pages/MasterSkillMap"));
const More=lazy(()=>import("./pages/More"));
const LevelAssessment=lazy(()=>import("./pages/LevelAssessment"));
const ClientPortal = lazy(()=>import("./pages/ClientPortal"));
const VideoAudit = lazy(()=>import("./pages/VideoAudit"));
const VideoAnalyzer = lazy(()=>import("./pages/VideoAnalyzer"));
const Integrations = lazy(()=>import("./pages/Integrations"));
import { MobileNav } from "./components/Layout/MobileNav";
import { RouteGuard } from "./components/Layout/RouteGuard";
const Index=lazy(()=>import("./pages/Index"));
const FocusPlanner=lazy(()=>import("./pages/FocusPlanner"));
const CoachChat=lazy(()=>import("./pages/CoachChat"));
const PowerIntro=lazy(()=>import("./pages/PowerIntro"));
const Auth=lazy(()=>import("./pages/Auth"));
const Dashboard = lazy(()=>import("./pages/Dashboard"));
const Planner = lazy(()=>import("./pages/Planner"));
const Library = lazy(()=>import("./pages/Library"));
const AILab = lazy(()=>import("./pages/AILab"));
const AccountSettings=lazy(()=>import("./pages/Settings"));
const Settings=lazy(()=>import("./pages/TrainingSettings"));
import { AppControls } from "./components/Layout/AppControls";
const TrainingEntry=lazy(()=>import("./components/Layout/TrainingEntry").then(m=>({default:m.TrainingEntry})));
import { LaunchHome } from "./components/Layout/LaunchHome";
const ActiveWorkout=lazy(()=>import("./pages/ActiveWorkout"));
const SkillStudio = lazy(()=>import("./pages/SkillStudio"));
const Anatomy = lazy(()=>import("./pages/Anatomy"));
const NotFound=lazy(()=>import("./pages/NotFound"));
const SuperHumanProgram = lazy(()=>import("./pages/SuperHumanProgram"));
const Community = lazy(()=>import("./pages/Community"));
const Admin = lazy(()=>import("./pages/Admin"));
import "./styles/neumorph.css";
import "./styles/focus-training.css";
import "./styles/movement-learning.css";
import "./styles/superhuman-brand.css";
import "./styles/superhuman-ui-v2.css";
import "./styles/tlctv-inline.css";
import "./styles/tlctv-analyzer.css";
import "./styles/atomic-screen-fixes.css";
import "./styles/client-portal.css";
import "./styles/tlc-integrations.css";
import "./styles/movement-modifications.css";
import "./styles/tlctv-first.css";
import "./styles/master-skill-map.css";
import "./styles/progression-quality.css";
import "./styles/mobile-dock-v3.css";
import "./styles/theme-material-overhaul.css";
import "./styles/skeuomorphic-themes-v4.css";
import "./styles/train-screen-bugfix-v5.css";
import "./styles/atomic-ui-sweep-v6.css";
import "./styles/route-qa-v7.css";
import "./styles/dbz-kame-house-v9.css";
import { useTheme } from './components/ThemeSwitcher';
import { LoadingScreen } from './components/LoadingScreen';

const queryClient = new QueryClient();

function AppContent() {
  useTheme();
  return (
    <BrowserRouter>
      <LaunchHome />
      <AppControls />
      <div className="power-app-shell min-w-0 md:pb-0">
        <RouteGuard><Suspense fallback={<div id="tlc-route-loading"><LoadingScreen /></div>}><Routes>
          <Route path="/" element={<Index />} />
          <Route path="/build" element={<FocusPlanner />} />
          <Route path="/coach" element={<CoachChat />} />
          <Route path="/intro" element={<PowerIntro />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/today" element={<TrainingEntry />} />
          <Route path="/planner" element={<TrainingEntry />} />
          <Route path="/library" element={<Library />} />
          <Route path="/ai-lab" element={<AILab />} />
          <Route path="/train" element={<TrainingEntry />} />
          <Route path="/routine-days" element={<Navigate to="/skills" replace />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/map" element={<MasterSkillMap />} />
          <Route path="/program" element={<SuperHumanProgram />} />
          <Route path="/assessment" element={<LevelAssessment />} />
          <Route path="/client" element={<ClientPortal />} />
          <Route path="/client/:tab" element={<ClientPortal />} />
          <Route path="/videos" element={<VideoAudit />} />
          <Route path="/tlctv/analyzer" element={<VideoAnalyzer />} />
          <Route path="/integrations" element={<Integrations />} />
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
        </Routes></Suspense></RouteGuard>
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
