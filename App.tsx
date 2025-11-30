
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CompetitorStalker } from './components/CompetitorStalker';
import { AgentChat } from './components/AgentChat';
import { WarRoom } from './components/WarRoom';
import { IdeaIncinerator } from './components/IdeaIncinerator';
import { TacticalRoadmap } from './components/TacticalRoadmap';
import { storageService } from './services/storageService';
import { Treasury } from './components/Treasury';
import { Billing } from './components/Billing';
import { SystemBoot } from './components/SystemBoot';
import { CommandPalette } from './components/CommandPalette';
import { Settings } from './components/Settings';
import { ToastSystem } from './components/ToastSystem';
import { Scratchpad } from './components/Scratchpad';
import { FocusMode } from './components/FocusMode';
import { SignalTower } from './components/SignalTower';
import { TheStudio } from './components/TheStudio';
import { TheDeck } from './components/TheDeck';
import { TheCodex } from './components/TheCodex';
import { TheVault } from './components/TheVault';
import { TheMainframe } from './components/TheMainframe';
import { TheSimulator } from './components/TheSimulator';
import { TheNetwork } from './components/TheNetwork';
import { TheIronclad } from './components/TheIronclad';
import { TheUplink } from './components/TheUplink';
import { TheBoardroom } from './components/TheBoardroom';
import { ThePivot } from './components/ThePivot';
import { TheSanctuary } from './components/TheSanctuary';
import { TheArchitect } from './components/TheArchitect';
import { TheAcademy } from './components/TheAcademy';
import { TheTribe } from './components/TheTribe';
import { TheAmplifier } from './components/TheAmplifier';
import { TheLaunchpad } from './components/TheLaunchpad';
import { TheScout } from './components/TheScout';
import { AuthGate } from './components/AuthGate';
import { KeyboardShortcutsOverlay } from './components/KeyboardShortcutsOverlay';
import { AgentId, Task } from './types';
import { Menu, NotebookPen } from 'lucide-react'
import { useSwipe } from './hooks/useSwipe';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
// ... other imports

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

  const renderView = () => {
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
      case 'billing':
        return <Billing />;
      case 'settings':
        return <Settings />;
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
  };

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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar z-10">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          {/* Content with transition */}
          <div className={`max-w-7xl mx-auto h-full transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100 animate-fade-in'
            }`}>
            {renderView()}
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
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/app/:viewId" element={
        <AuthGate>
          <DashboardLayout />
        </AuthGate>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  );
}

export default App;
