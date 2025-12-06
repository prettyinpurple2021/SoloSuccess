
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Routes, Route, Navigate, useParams, useNavigate, Outlet, useOutletContext } from 'react-router-dom';
import { Loader2, Menu, NotebookPen } from 'lucide-react';
import { Task, AgentId } from './types';
import { storageService } from './services/storageService';
import { useSwipe } from './hooks/useSwipe';
import { FocusMode } from './components/FocusMode';
import { CommandPalette } from './components/CommandPalette';
import { ToastSystem } from './components/ToastSystem';
import { Scratchpad } from './components/Scratchpad';
import { NotificationBell } from './components/NotificationBell';
import { KeyboardShortcutsOverlay } from './components/KeyboardShortcutsOverlay';
import { AuthGate } from './components/AuthGate';

// Lazy Load Components
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const CompetitorStalker = React.lazy(() => import('./components/CompetitorStalker').then(module => ({ default: module.CompetitorStalker })));
const AgentChat = React.lazy(() => import('./components/AgentChat').then(module => ({ default: module.AgentChat })));
const WarRoom = React.lazy(() => import('./components/WarRoom').then(module => ({ default: module.WarRoom })));
const IdeaIncinerator = React.lazy(() => import('./components/IdeaIncinerator').then(module => ({ default: module.IdeaIncinerator })));
const TacticalRoadmap = React.lazy(() => import('./components/TacticalRoadmap').then(module => ({ default: module.TacticalRoadmap })));
const Treasury = React.lazy(() => import('./components/Treasury').then(module => ({ default: module.Treasury })));
const Billing = React.lazy(() => import('./components/Billing').then(module => ({ default: module.Billing })));
const SystemBoot = React.lazy(() => import('./components/SystemBoot').then(module => ({ default: module.SystemBoot })));
const Settings = React.lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const SignalTower = React.lazy(() => import('./components/SignalTower').then(module => ({ default: module.SignalTower })));
const TheStudio = React.lazy(() => import('./components/TheStudio').then(module => ({ default: module.TheStudio })));
const TheDeck = React.lazy(() => import('./components/TheDeck').then(module => ({ default: module.TheDeck })));
const TheCodex = React.lazy(() => import('./components/TheCodex').then(module => ({ default: module.TheCodex })));
const TheVault = React.lazy(() => import('./components/TheVault').then(module => ({ default: module.TheVault })));
const TheMainframe = React.lazy(() => import('./components/TheMainframe').then(module => ({ default: module.TheMainframe })));
const TheSimulator = React.lazy(() => import('./components/TheSimulator').then(module => ({ default: module.TheSimulator })));
const TheNetwork = React.lazy(() => import('./components/TheNetwork').then(module => ({ default: module.TheNetwork })));
const TheIronclad = React.lazy(() => import('./components/TheIronclad').then(module => ({ default: module.TheIronclad })));
const TheUplink = React.lazy(() => import('./components/TheUplink').then(module => ({ default: module.TheUplink })));
const TheBoardroom = React.lazy(() => import('./components/TheBoardroom').then(module => ({ default: module.TheBoardroom })));
const ThePivot = React.lazy(() => import('./components/ThePivot').then(module => ({ default: module.ThePivot })));
const TheSanctuary = React.lazy(() => import('./components/TheSanctuary').then(module => ({ default: module.TheSanctuary })));
const TheArchitect = React.lazy(() => import('./components/TheArchitect').then(module => ({ default: module.TheArchitect })));
const TheAcademy = React.lazy(() => import('./components/TheAcademy').then(module => ({ default: module.TheAcademy })));
const TheTribe = React.lazy(() => import('./components/TheTribe').then(module => ({ default: module.TheTribe })));
const TheAmplifier = React.lazy(() => import('./components/TheAmplifier').then(module => ({ default: module.TheAmplifier })));
const TheLaunchpad = React.lazy(() => import('./components/TheLaunchpad').then(module => ({ default: module.TheLaunchpad })));
const TheScout = React.lazy(() => import('./components/TheScout').then(module => ({ default: module.TheScout })));
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
const TeamWorkspace = React.lazy(() => import('./components/TeamWorkspace').then(module => ({ default: module.TeamWorkspace })));
const LandingPage = React.lazy(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));
const Login = React.lazy(() => import('./components/auth/Login').then(module => ({ default: module.Login })));
const Signup = React.lazy(() => import('./components/auth/Signup').then(module => ({ default: module.Signup })));
const FeaturesPage = React.lazy(() => import('./components/marketing/FeaturesPage').then(module => ({ default: module.FeaturesPage })));
const ContactPage = React.lazy(() => import('./components/marketing/ContactPage').then(module => ({ default: module.ContactPage })));
const PricingPage = React.lazy(() => import('./components/marketing/PricingPage').then(module => ({ default: module.PricingPage })));
const AboutPage = React.lazy(() => import('./components/marketing/AboutPage').then(module => ({ default: module.AboutPage })));
const PrivacyPolicy = React.lazy(() => import('./components/marketing/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./components/marketing/TermsOfService').then(module => ({ default: module.TermsOfService })));
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050505]">
    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
  </div>
);


// Context for child routes to access layout state/functions
interface DashboardContextType {
  handleViewChange: (view: string) => void;
  handleEnterFocusMode: (task: Task) => void;
  activeAgent: AgentId | null;
  incomingAgentMessage: string | null;
  clearIncomingMessage: () => void;
}

function DashboardContent() {
  const { viewId } = useParams();
  const currentView = viewId || 'dashboard';
  const {
    handleViewChange,
    handleEnterFocusMode,
    activeAgent,
    incomingAgentMessage,
    clearIncomingMessage
  } = useOutletContext<DashboardContextType>();

  switch (currentView) {
    case 'dashboard':
      return <Dashboard />;
    case 'stalker':
      return <CompetitorStalker onNavigate={handleViewChange} />;
    case 'war-room':
      return <WarRoom />;
    case 'incinerator':
      return <IdeaIncinerator />;
    case 'roadmap':
      return <TacticalRoadmap onEnterFocusMode={handleEnterFocusMode} />;
    case 'treasury':
      return <Treasury />;
    case 'ironclad':
      return <TheIronclad />;
    case 'signal':
      return <SignalTower />;
    case 'studio':
      return <TheStudio />;
    case 'deck':
      return <TheDeck />;
    case 'codex':
      return <TheCodex />;
    case 'vault':
      return <TheVault />;
    case 'mainframe':
      return <TheMainframe />;
    case 'simulator':
      return <TheSimulator />;
    case 'network':
      return <TheNetwork />;
    case 'uplink':
      return <TheUplink />;
    case 'boardroom':
      return <TheBoardroom />;
    case 'pivot':
      return <ThePivot />;
    case 'sanctuary':
      return <TheSanctuary />;
    case 'architect':
      return <TheArchitect />;
    case 'academy':
      return <TheAcademy />;
    case 'tribe':
      return <TheTribe />;
    case 'amplifier':
      return <TheAmplifier />;
    case 'launchpad':
      return <TheLaunchpad />;
    case 'scout':
      return <TheScout />;
    case 'team':
      return <TeamWorkspace />;
    case 'billing':
      return <Billing />;
    case 'settings':
      return <Settings />;
    case 'analytics':
      return <AnalyticsDashboard />;
    case 'chat':
      return activeAgent ? (
        <AgentChat
          agentId={activeAgent}
          initialMessage={incomingAgentMessage}
          onMessageConsumed={clearIncomingMessage}
        />
      ) : <Dashboard />;
    default:
      return <Dashboard />;
  }
}

function DashboardLayout() {
  const { viewId } = useParams();
  const navigate = useNavigate();
  const currentView = viewId || 'dashboard';

  const [activeAgent, setActiveAgent] = useState<AgentId | null>(null);
  const [isBooted, setIsBooted] = useState(false);
  const [checkingBoot, setCheckingBoot] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Focus Mode State
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  // Ref to access Agent Chat input via Scratchpad "Send"
  const [incomingAgentMessage, setIncomingAgentMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkBoot = async () => {
      // Check if user has ever completed boot (persistent flag)
      const bootCompleted = localStorage.getItem('solo_boot_completed');

      // Check for temporary skip in current session
      const tempSkip = sessionStorage.getItem('solo_onboarding_temp_skip');

      console.log('🔍 Checking Boot Status:', { bootCompleted, tempSkip });

      if (bootCompleted === 'true' || tempSkip === 'true') {
        // User already did initial setup or skipped for this session
        console.log('✅ Boot already completed or skipped');
        setIsBooted(true);
        setCheckingBoot(false);
        return;
      }

      // Check if they have context saved
      const context = await storageService.getContext();
      console.log('📂 Loaded Context:', context);

      if (context) {
        // Check for explicit completion status in brandDna
        const status = (context.brandDna as any)?.onboardingStatus;
        console.log('📊 Onboarding Status:', status);

        if (status === 'completed') {
          console.log('✅ Onboarding marked as completed in DB');
          localStorage.setItem('solo_boot_completed', 'true');
          setIsBooted(true);
        } else if (status === 'draft') {
          console.log('📝 Onboarding is in draft mode');
          // Explicitly draft, so we should show onboarding (unless temp skipped, which is checked above)
          // Do nothing here, setIsBooted remains false
        } else if (context.founderName || context.companyName) {
          console.log('⚠️ Legacy context found, assuming completed');
          // Legacy fallback: Has meaningful context but no status flag, assume completed
          localStorage.setItem('solo_boot_completed', 'true');
          setIsBooted(true);
        }
      } else {
        console.log('❌ No context found, starting fresh');
      }

      setCheckingBoot(false);
    };
    checkBoot();
  }, []);

  // Swipe gestures for mobile sidebar
  const swipeHandlers = useSwipe({
    onSwipeRight: () => {
      if (!isMobileSidebarOpen && window.innerWidth < 768) {
        setIsMobileSidebarOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    },
    minSwipeDistance: 80
  });

  const handleViewChange = (view: string) => {
    if (view === currentView) return;

    setIsTransitioning(true);
    // Close mobile sidebar when changing views
    setIsMobileSidebarOpen(false);

    setTimeout(() => {
      navigate(`/app/${view}`);
      setIsTransitioning(false);
    }, 150);
  };

  const handleBootComplete = () => {
    setIsBooted(true);
  };

  // Keyboard shortcuts overlay
  React.useEffect(() => {
    const handleShortcutKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleShortcutKey);
    return () => window.removeEventListener('keydown', handleShortcutKey);
  }, []);


  const handleSendFromScratchpad = (text: string) => {
    if (activeAgent) {
      setIncomingAgentMessage(text);
      // Ensure we are looking at the chat
      navigate('/app/chat');
    }
  };

  const handleEnterFocusMode = (task: Task) => {
    setFocusTask(task);
  };

  const handleFocusComplete = async (taskId: string) => {

    await storageService.updateTask(taskId, {
      status: 'done',
      completedAt: new Date().toISOString()
    });
    setFocusTask(null);
  };

  // Clear incoming message after it's "consumed" by AgentChat
  const clearIncomingMessage = () => setIncomingAgentMessage(null);

  if (checkingBoot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-mono text-sm animate-pulse">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!isBooted) {
    return (
      <SystemBoot onComplete={handleBootComplete} />
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden relative selection:bg-emerald-500/30">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0 gradient-mesh" />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/3 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      <FocusMode
        activeTask={focusTask}
        onExit={() => setFocusTask(null)}
        onComplete={handleFocusComplete}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        setIsOpen={setIsPaletteOpen}
        setCurrentView={handleViewChange}
        setActiveAgent={setActiveAgent}
        onToggleScratchpad={() => setIsScratchpadOpen(prev => !prev)}
      />

      <ToastSystem />

      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        activeAgent={activeAgent}
        onSendToAgent={handleSendFromScratchpad}
      />

      <Sidebar
        currentView={currentView}
        setCurrentView={handleViewChange}
        activeAgent={activeAgent}
        setActiveAgent={setActiveAgent}
        onOpenPalette={() => setIsPaletteOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleScratchpad={() => setIsScratchpadOpen(prev => !prev)}
      />

      {/* Main Content */}
      <main
        className="flex-1 md:ml-64 h-full flex flex-col relative"
        {...swipeHandlers}
      >
        {/* Enhanced Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 glass-strong z-10 sticky top-0 animate-slide-in-top">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all hover-scale active:scale-95"
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-bold text-white tracking-tight text-shadow-glow">
              SOLO_SUCCESS<span className="text-gradient">_AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
              className={`p-2 rounded-lg transition-all hover-scale active:scale-95 ${isScratchpadOpen
                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                }`}
              aria-label="Toggle scratchpad"
            >
              <NotebookPen size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar z-10">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          {/* Content with transition */}
          <div className={`max-w-7xl mx-auto h-full transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100 animate-fade-in'
            }`}>
            <Outlet context={{
              handleViewChange,
              handleEnterFocusMode,
              activeAgent,
              incomingAgentMessage,
              clearIncomingMessage
            }} />
          </div>
        </div>
      </main>

      {showShortcuts && (
        <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app/admin/login" element={
          <AuthGate>
            <AdminLogin />
          </AuthGate>
        } />
        <Route path="/app/admin/dashboard" element={
          <AuthGate>
            <AdminDashboard />
          </AuthGate>
        } />
        <Route path="/app/onboarding" element={
          <AuthGate>
            <SystemBoot onComplete={() => window.location.href = '/app'} />
          </AuthGate>
        } />

        {/* Nested Route Structure */}
        <Route path="/app" element={
          <AuthGate>
            <DashboardLayout />
          </AuthGate>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path=":viewId" element={<DashboardContent />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
