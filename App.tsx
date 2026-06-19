import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Chrome, 
  Flame, 
  Facebook, 
  Instagram, 
  Search, 
  Copy, 
  Check, 
  Download, 
  LogOut, 
  Sliders, 
  Database, 
  User, 
  Lock, 
  Sparkles, 
  Cpu, 
  Layers, 
  Wifi, 
  Trash2, 
  Shuffle, 
  Clock,
  Terminal,
  HelpCircle,
  Eye,
  Settings,
  Heart
} from 'lucide-react';
import { androidPool, iosPool, winPool, carriers } from './data';
import { UAHistoryItem } from './types';
import { generateUA, parseUASegments, getRandomElement, getRandomInt } from './utils/generator';

export default function App() {
  // Authentication & session state
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Configuration panel states
  const [platform, setPlatform] = useState<string>('CHROME');
  const [deviceCategory, setDeviceCategory] = useState<string>('MOBILE');
  const [chromeMajorVer, setChromeMajorVer] = useState<string>('148'); // Default to the brand new high version 148!
  const [firefoxMajorVer, setFirefoxMajorVer] = useState<string>('143'); // Default to top Firefox version
  const [selectedDevice, setSelectedDevice] = useState<string>('RANDOM');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('RANDOM');

  // Generator Output states
  const [generatedUA, setGeneratedUA] = useState<string>('');
  const [deviceMeta, setDeviceMeta] = useState<string>('');
  const [osMeta, setOsMeta] = useState<string>('');
  const [engineMeta, setEngineMeta] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Interactive breakdown state
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);

  // Search & History logs state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [historyList, setHistoryList] = useState<UAHistoryItem[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');

  // Load history from localStorage on mounting / session change
  useEffect(() => {
    // Look up auto-logged in user sessions
    const savedUser = localStorage.getItem('last_active_ua_user');
    if (savedUser) {
      setActiveUser(savedUser);
    } else {
      // Setup a fast guest account for default instant use
      setActiveUser('BypassGuest');
    }
  }, []);

  // Sync session metrics and table outputs
  useEffect(() => {
    if (!activeUser) return;
    const usersDB = JSON.parse(localStorage.getItem('ua_db') || '{}');
    if (usersDB[activeUser]) {
      setHistoryList(usersDB[activeUser].history || []);
    } else {
      // Initalize empty history for guest sessions
      usersDB[activeUser] = { pass: 'guestpass', history: [] };
      localStorage.setItem('ua_db', JSON.stringify(usersDB));
      setHistoryList([]);
    }
  }, [activeUser]);

  // Generate an initial UA so the screen is never left empty
  useEffect(() => {
    if (activeUser) {
      handleTriggerGeneration();
    }
  }, [activeUser, platform, deviceCategory]);

  // Handle Signup/Login submit
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!usernameInput || !passwordInput) {
      setAuthError('Please enter both username and password.');
      return;
    }

    const usersDB = JSON.parse(localStorage.getItem('ua_db') || '{}');

    if (authMode === 'signup') {
      if (usersDB[usernameInput]) {
        setAuthError('This username already exists. Choose another.');
        return;
      }
      // Register password & placeholder arrays
      usersDB[usernameInput] = {
        pass: passwordInput,
        history: []
      };
      localStorage.setItem('ua_db', JSON.stringify(usersDB));
      setAuthSuccess('Account registered! Please sign in.');
      setAuthMode('login');
      setPasswordInput('');
    } else {
      const userRecord = usersDB[usernameInput];
      if (userRecord && userRecord.pass === passwordInput) {
        localStorage.setItem('last_active_ua_user', usernameInput);
        setActiveUser(usernameInput);
        setAuthSuccess(`Welcome back, ${usernameInput}!`);
      } else {
        setAuthError('Invalid credentials. Check your username and password.');
      }
    }
  };

  // Sign in instantly as Bypass Sandbox guest
  const handleBypassAuth = () => {
    localStorage.setItem('last_active_ua_user', 'BypassGuest');
    setActiveUser('BypassGuest');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('last_active_ua_user');
    setActiveUser(null);
    setUsernameInput('');
    setPasswordInput('');
    setAuthError(null);
    setAuthSuccess(null);
  };

  // Core UA Generation dispatch
  const handleTriggerGeneration = () => {
    setIsGenerating(true);
    setSelectedSegmentIdx(null);

    // Simulate micro-loading frame for ultra-real responsive feedback
    setTimeout(() => {
      // Extract properties based on selected parameters
      let targetDevice = selectedDevice;
      if (selectedDevice === 'RANDOM') {
        if (deviceCategory === 'MOBILE') {
          targetDevice = getRandomElement(androidPool).name;
        } else if (deviceCategory === 'IOS') {
          targetDevice = getRandomElement(iosPool).name;
        } else {
          targetDevice = getRandomElement(winPool).name;
        }
      }

      let carrierObj = undefined;
      if (selectedCarrier !== 'RANDOM') {
        const found = carriers.find(c => c.c === selectedCarrier);
        if (found) carrierObj = found;
      }

      // Generate accurate Chrome string supporting custom 147 / 148
      const chromeVerPart = `${chromeMajorVer}.${getRandomInt(0, 10)}.${getRandomInt(6000, 7150)}.${getRandomInt(10, 201)}`;
      const firefoxVerPart = `${firefoxMajorVer}.0`;

      const result = generateUA({
        platform,
        deviceCategory,
        customChromeVer: platform === 'FIREFOX' ? undefined : chromeVerPart,
        customFirefoxVer: platform === 'FIREFOX' ? firefoxVerPart : undefined,
        customDeviceName: targetDevice,
        customCarrier: carrierObj
      });

      setGeneratedUA(result.ua);
      setDeviceMeta(result.deviceName);
      setOsMeta(result.osVersion);
      setEngineMeta(result.engineSpec);
      setIsGenerating(false);

      // Save to active user history in storage
      if (activeUser) {
        const usersDB = JSON.parse(localStorage.getItem('ua_db') || '{}');
        if (!usersDB[activeUser]) {
          usersDB[activeUser] = { pass: 'guest', history: [] };
        }

        const newHistoryItem: UAHistoryItem = {
          id: 'ua_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          platform,
          deviceCategory,
          ua: result.ua,
          deviceName: result.deviceName,
          osVersion: result.osVersion,
          engineSpec: result.engineSpec
        };

        // Prepend and limit size to 150 items
        const updatedHistory = [newHistoryItem, ...(usersDB[activeUser].history || [])].slice(0, 150);
        usersDB[activeUser].history = updatedHistory;
        localStorage.setItem('ua_db', JSON.stringify(usersDB));
        setHistoryList(updatedHistory);
      }
    }, 280);
  };

  // Quick action: Randomize selections and generate immediately
  const handleRandomizeEverything = () => {
    const platformsPool = ['CHROME', 'FIREFOX', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK'];
    const deviceCatPool = ['MOBILE', 'IOS', 'WINDOWS'];
    
    const pickedPlatform = getRandomElement(platformsPool);
    const pickedDeviceCat = getRandomElement(deviceCatPool);
    
    // Choose chrome version from spectrum
    const ChromeVersions = ['148', '147', '146', '145', '141', '139', '133'];
    const pickedChromeVer = getRandomElement(ChromeVersions);

    setPlatform(pickedPlatform);
    setDeviceCategory(pickedDeviceCat);
    setChromeMajorVer(pickedChromeVer);
    setSelectedDevice('RANDOM');
    setSelectedCarrier('RANDOM');
    
    // Fire generation
    setIsGenerating(true);
    setTimeout(() => {
      // Force instant generation call overriding state latency
      const targetDeviceModel = pickedDeviceCat === 'MOBILE' 
        ? getRandomElement(androidPool).name 
        : pickedDeviceCat === 'IOS' 
          ? getRandomElement(iosPool).name 
          : getRandomElement(winPool).name;

      const chromeVerPart = `${pickedChromeVer}.${getRandomInt(0, 9)}.${getRandomInt(6000, 7150)}.${getRandomInt(10, 201)}`;
      
      const result = generateUA({
        platform: pickedPlatform,
        deviceCategory: pickedDeviceCat,
        customChromeVer: chromeVerPart,
        customDeviceName: targetDeviceModel,
      });

      setGeneratedUA(result.ua);
      setDeviceMeta(result.deviceName);
      setOsMeta(result.osVersion);
      setEngineMeta(result.engineSpec);
      setIsGenerating(false);

      if (activeUser) {
        const usersDB = JSON.parse(localStorage.getItem('ua_db') || '{}');
        const newHistoryItem: UAHistoryItem = {
          id: 'ua_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          platform: pickedPlatform,
          deviceCategory: pickedDeviceCat,
          ua: result.ua,
          deviceName: result.deviceName,
          osVersion: result.osVersion,
          engineSpec: result.engineSpec
        };
        const updatedHistory = [newHistoryItem, ...(usersDB[activeUser].history || [])].slice(0, 150);
        usersDB[activeUser].history = updatedHistory;
        localStorage.setItem('ua_db', JSON.stringify(usersDB));
        setHistoryList(updatedHistory);
      }
    }, 150);
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  // Delete individual log
  const handleDeleteLogItem = (id: string) => {
    if (!activeUser) return;
    const usersDB = JSON.parse(localStorage.getItem('ua_db') || '{}');
    if (usersDB[activeUser]) {
      const filtered = (usersDB[activeUser].history || []).filter((item: UAHistoryItem) => item.id !== id);
      usersDB[activeUser].history = filtered;
      localStorage.setItem('ua_db', JSON.stringify(usersDB));
      setHistoryList(filtered);
    }
  };

  // Clear entire history for active session
  const handleClearAllHistory = () => {
    if (!activeUser) return;
    if (window.confirm('Are you sure you want to scrub all stored UA session logs?')) {
      const usersDB = JSON.parse(localStorage.getItem('ua_db') || '{}');
      if (usersDB[activeUser]) {
        usersDB[activeUser].history = [];
        localStorage.setItem('ua_db', JSON.stringify(usersDB));
        setHistoryList([]);
      }
    }
  };

  // Download raw txt file of the current user agent
  const handleDownloadTextFile = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedUA], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `ua_profile_${platform.toLowerCase()}_${deviceCategory.toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Parse UA into formatted segments
  const parsedSegments = parseUASegments(generatedUA);

  // Filter history based on search query and platform selection filtering tabs
  const filteredHistory = historyList.filter(item => {
    const matchesSearch = 
      item.ua.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.deviceName && item.deviceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.osVersion && item.osVersion.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesPlatform = platformFilter === 'ALL' || item.platform === platformFilter;
    
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans selection:bg-[#2f81f7]/30 selection:text-white flex flex-col antialiased">
      
      {/* Dynamic Glow Accents in the Dark Horizon */}
      <motion.div 
        animate={{ 
          x: [0, 50, -30, 0], 
          y: [0, -40, 30, 0],
          scale: [1, 1.12, 0.93, 1],
          opacity: [0.6, 0.8, 0.5, 0.6]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-[#2f81f7]/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          x: [0, -40, 40, 0], 
          y: [0, 50, -50, 0],
          scale: [1, 0.88, 1.15, 1],
          opacity: [0.5, 0.7, 0.4, 0.45]
        }}
        transition={{ 
          duration: 24, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#1f6feb]/5 rounded-full blur-[100px] pointer-events-none" 
      />

      {/* HEADER SECTION */}
      <header className="border-b border-[#30363d] bg-[#161b22]/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Meta Indicators */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#2f81f7] to-[#1f6feb] flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-mono">ELITE MASTER UA</h1>
                <span className="text-[10px] bg-[#30363d]/80 text-[#58a6ff] hover:text-[#79c0ff] border border-[#30363d] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Real Engine v148
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">High-fidelity sandbox browser & social application header matrix</p>
            </div>
          </div>

          {/* Connected User session widget */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {activeUser ? (
              <div className="flex items-center gap-3 bg-[#0d1117] px-3.5 py-1.5 rounded-lg border border-[#30363d]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#3fb950] animate-pulse" />
                  <span className="text-xs font-mono font-medium text-[#c9d1d9]">
                    {activeUser === 'BypassGuest' ? 'Guest Developer' : `Host: ${activeUser}`}
                  </span>
                </div>
                {activeUser !== 'BypassGuest' && (
                  <span className="text-[10px] bg-[#238636]/20 text-[#56d364] px-1.5 py-0.5 rounded border border-[#238636]/30 font-mono">
                    PRO
                  </span>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="text-xs text-[#f85149] hover:bg-[#f85149]/10 p-1.5 rounded transition"
                  title="Disconnect Session"
                  id="btn-logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#8b949e] font-mono">
                <Database className="h-3.5 w-3.5 text-[#8b949e]" />
                <span>Sandbox Offline Cache</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">

        <AnimatePresence mode="wait">
          {!activeUser ? (
            
            /* SECURE ACCESS SHIELD (SIMULATED REGISTER/LOGIN GATE) */
            <motion.div 
              initial={{ opacity: 0, y: 35, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -35, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="max-w-md mx-auto w-full my-12"
              key="auth-panel"
            >
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2f81f7] to-[#56d364]" />
                
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-full bg-[#1f6feb]/10 text-[#2f81f7] mb-3">
                    <Sliders className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Developer Shield Authorization</h2>
                  <p className="text-xs text-[#8b949e]">Create or authenticate your local sandbox database key</p>
                </div>

                {authSuccess && (
                  <div className="mb-4 text-xs font-mono bg-[#238636]/15 border border-[#238636]/35 text-[#3fb950] p-3 rounded-lg flex items-center gap-2">
                    <span className="font-bold">✔</span>
                    <span>{authSuccess}</span>
                  </div>
                )}

                {authError && (
                  <div className="mb-4 text-xs font-mono bg-[#da3633]/15 border border-[#da3633]/35 text-[#f85149] p-3 rounded-lg flex items-center gap-2">
                    <span className="font-bold">⚠</span>
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                      Client Key (Username)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                      <input 
                        type="text" 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="e.g. dev_engineer"
                        id="user-name"
                        className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] transition pl-10 pr-4 py-2.5 rounded-lg text-white placeholder-[#484f58] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                      Security Pass (Password)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                      <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        id="user-pass"
                        className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] transition pl-10 pr-4 py-2.5 rounded-lg text-white placeholder-[#484f58] text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      onClick={() => setAuthMode('login')}
                      className="w-full bg-[#1f6feb] hover:bg-[#2f81f7] font-semibold text-white text-sm py-2.5 px-4 rounded-lg transition shadow-md shadow-blue-500/10 cursor-pointer"
                      id="btn-login-submit"
                    >
                      Sign In
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      onClick={() => setAuthMode('signup')}
                      className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] font-semibold text-white text-sm py-2.5 px-4 rounded-lg transition cursor-pointer"
                      id="btn-signup-submit"
                    >
                      Register Keys
                    </motion.button>
                  </div>
                </form>

                <div className="mt-6 border-t border-[#30363d] pt-4 text-center">
                  <span className="text-xs text-[#8b949e]">Prefer quick testing?</span>
                  <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(45, 212, 191, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBypassAuth}
                    className="mt-2 block w-full bg-gradient-to-r from-teal-900/30 to-blue-950/30 hover:from-teal-900/50 hover:to-blue-950/50 border border-teal-800/40 hover:border-teal-400/50 font-mono text-[11px] text-teal-400 font-bold py-2 rounded-lg transition uppercase tracking-wider"
                    id="btn-bypass"
                  >
                    🚀 Bypass Secure Shield (Instant Sandbox)
                  </motion.button>
                </div>

              </div>
            </motion.div>

          ) : (
            
            /* PRIMARY WORKSPACE DASHBOARD */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              key="primary-dashboard"
            >
              
              {/* LEFT COLUMN: PARAMETERS CONTROLLER PANEL (5 Cols) */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="lg:col-span-5 flex flex-col gap-5"
              >
                
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
                  
                  {/* Parameter Panel Title */}
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4.5 w-4.5 text-[#58a6ff]" />
                      <h2 className="text-sm font-bold font-mono tracking-wide uppercase text-[#c9d1d9]">
                        UA Profile Tectonic Engine
                      </h2>
                    </div>
                    <button 
                      onClick={handleRandomizeEverything}
                      className="text-xs flex items-center gap-1 text-[#8b949e] hover:text-[#58a6ff] bg-[#21262d] hover:bg-[#30363d] px-2.5 py-1 rounded border border-[#30363d] transition active:scale-95"
                      title="Randomize config metrics across everything"
                    >
                      <Shuffle className="h-3 w-3" />
                      <span>Randomize</span>
                    </button>
                  </div>

                  {/* FORM INTERACTIVE FIELDS */}
                  <div className="space-y-4">
                    
                    {/* Platform Selector */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                          Social Core / Browser Platform
                        </label>
                        <span className="text-[9px] font-mono text-[#58a6ff] bg-[#1f6feb]/10 px-1.5 py-0.2 rounded border border-[#1f6feb]/20">
                          100% Real Engine
                        </span>
                      </div>
                      
                      {/* Grid representation for platform select */}
                      <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                        {[
                          { id: 'CHROME', label: 'Chrome', icon: Chrome, desc: 'Real Engine 133-148', color: 'hover:border-amber-500/50 hover:bg-amber-500/5' },
                          { id: 'FIREFOX', label: 'Firefox', icon: Flame, desc: 'Stable 133-143', color: 'hover:border-orange-500/50 hover:bg-orange-500/5' },
                          { id: 'FACEBOOK', label: 'Facebook', icon: Facebook, desc: 'Mobile Webview', color: 'hover:border-blue-500/50 hover:bg-blue-500/5' },
                          { id: 'INSTAGRAM', label: 'Instagram', icon: Instagram, desc: 'In-App Sandbox', color: 'hover:border-pink-500/50 hover:bg-pink-500/5' },
                          { id: 'TIKTOK', label: 'TikTok', icon: Layers, desc: 'Global Builds', color: 'hover:border-teal-500/50 hover:bg-teal-500/5' }
                        ].map((plat) => {
                          const Icon = plat.icon;
                          const isSel = platform === plat.id;
                          return (
                            <motion.button
                              whileHover={{ scale: 1.035, y: -2 }}
                              whileTap={{ scale: 0.965 }}
                              key={plat.id}
                              onClick={() => setPlatform(plat.id)}
                              className={`p-2.5 text-left rounded-lg border transition duration-150 flex flex-col justify-between cursor-pointer ${
                                isSel 
                                  ? 'bg-[#1f6feb]/15 border-[#2f81f7] text-white ring-1 ring-[#2f81f7]' 
                                  : `bg-[#0d1117] border-[#30363d] text-[#8b949e] ${plat.color}`
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <Icon className={`h-4.5 w-4.5 ${isSel ? 'text-[#58a6ff]' : 'text-[#8b949e]'}`} />
                                {isSel && <div className="h-1.5 w-1.5 rounded-full bg-[#58a6ff]" />}
                              </div>
                              <div>
                                <span className="text-xs font-semibold block text-[#c9d1d9]">{plat.label}</span>
                                <span className="text-[9px] block text-[#8b949e] leading-tight mt-0.5">{plat.desc}</span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Device Category Selection */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                        Target Shell Device Category
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'MOBILE', label: 'Android Mobile', info: 'All major brands' },
                          { id: 'IOS', label: 'Apple iOS', info: 'iPhone / iPad' },
                          { id: 'WINDOWS', label: 'Win Intel/x64', info: '8.1, 10, 11 Shells' }
                        ].map((cat) => {
                          const isSel = deviceCategory === cat.id;
                          return (
                            <motion.button
                              whileHover={{ scale: 1.035, y: -1 }}
                              whileTap={{ scale: 0.965 }}
                              key={cat.id}
                              onClick={() => {
                                setDeviceCategory(cat.id);
                                setSelectedDevice('RANDOM');
                              }}
                              className={`p-2 px-1 text-center rounded-lg border transition cursor-pointer ${
                                isSel
                                  ? 'bg-[#1f6feb]/10 border-[#2f81f7] text-[#58a6ff] font-semibold'
                                  : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/40'
                              }`}
                            >
                              <span className="text-xs block text-white">{cat.label}</span>
                              <span className="text-[8px] block opacity-80 mt-0.5 font-mono">{cat.info}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* DYNAMIC SPECTRUM: CHROME ENGINE VERSION TWEAKER */}
                    {platform !== 'FIREFOX' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#8b949e] flex items-center gap-1">
                            <Cpu className="h-3.5 w-3.5 text-amber-500" />
                            Chrome Engine Spec
                          </label>
                          <span className="text-[10px] text-amber-500 font-mono font-bold">
                            Supports v147 + v148
                          </span>
                        </div>

                        {/* Custom Select grid of versions */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { v: '148', label: '148 (Latest)', premium: true },
                            { v: '147', label: '147 (Stable)', premium: true },
                            { v: '146', label: '146', premium: false },
                            { v: '145', label: '145', premium: false },
                            { v: '144', label: '144', premium: false },
                            { v: '141', label: '141', premium: false },
                            { v: '139', label: '139', premium: false },
                            { v: '133', label: '133', premium: false }
                          ].map(item => {
                            const isSel = chromeMajorVer === item.v;
                            return (
                              <button
                                key={item.v}
                                onClick={() => setChromeMajorVer(item.v)}
                                className={`py-1 text-center rounded text-xs font-mono transition duration-150 ${
                                  isSel
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 font-bold shadow-sm shadow-amber-500/10'
                                    : 'bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/30'
                                }`}
                              >
                                {item.v}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[9px] text-[#8b949e] font-mono mt-2 leading-snug">
                          * As requested, we added Chrome <strong>147</strong> and <strong>148</strong> engine presets to provide 100% genuine future-compatibility coverage.
                        </p>
                      </motion.div>
                    )}

                    {/* DYNAMIC SPECTRUM: FIREFOX VERSION TWEAKER */}
                    {platform === 'FIREFOX' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#8b949e] flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            Firefox Engine Spec
                          </label>
                          <span className="text-[10px] text-orange-500 font-mono font-bold">
                            Stable Matches
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {['143', '142', '139', '135', '133'].map(v => {
                            const isSel = firefoxMajorVer === v;
                            return (
                              <button
                                key={v}
                                onClick={() => setFirefoxMajorVer(v)}
                                className={`py-1 text-center rounded text-xs font-mono transition duration-150 ${
                                  isSel
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 font-bold'
                                    : 'bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/30'
                                }`}
                              >
                                v{v}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Brand Model customizer dropdowns */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1">
                          Device Blueprint
                        </label>
                        <select
                          value={selectedDevice}
                          onChange={(e) => setSelectedDevice(e.target.value)}
                          className="w-full bg-[#0d1117] text-white border border-[#30363d] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#2f81f7] outline-none"
                        >
                          <option value="RANDOM">🎲 Randomize Model</option>
                          {deviceCategory === 'MOBILE' && androidPool.map(dev => (
                            <option key={dev.name} value={dev.name}>{dev.name} ({dev.brand})</option>
                          ))}
                          {deviceCategory === 'IOS' && iosPool.map(dev => (
                            <option key={dev.name} value={dev.name}>{dev.name}</option>
                          ))}
                          {deviceCategory === 'WINDOWS' && winPool.map(dev => (
                            <option key={dev.name} value={dev.name}>{dev.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1">
                          Network Carrier
                        </label>
                        <select
                          value={selectedCarrier}
                          onChange={(e) => setSelectedCarrier(e.target.value)}
                          disabled={deviceCategory === 'WINDOWS'}
                          className="w-full bg-[#0d1117] text-white border border-[#30363d] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#2f81f7] outline-none disabled:opacity-40"
                        >
                          <option value="RANDOM">🎲 Random Carrier</option>
                          {carriers.map(car => (
                            <option key={car.c} value={car.c}>{car.c} ({car.l})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* EXECUTE ACTION BUTTON */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ 
                        scale: 1.025, 
                        boxShadow: "0 0 22px rgba(63, 185, 80, 0.4)",
                        transition: { duration: 0.15 } 
                      }}
                      whileTap={{ scale: 0.985 }}
                      onClick={handleTriggerGeneration}
                      disabled={isGenerating}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-[#238636] to-[#2ea44f] hover:from-[#2ea44f] hover:to-[#3fb950] font-bold text-[#f0f6fc] text-sm py-4 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {/* Premium Shimmer Sweep sheen effect */}
                      {!isGenerating && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          initial={{ left: "-100%" }}
                          animate={{ left: "200%" }}
                          transition={{ repeat: Infinity, repeatDelay: 2.8, duration: 1.4, ease: "easeInOut" }}
                        />
                      )}

                      {isGenerating ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="font-mono tracking-wider">SYNCHRONIZING ENGINE MATRIX...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-white animate-pulse" />
                          <span>GENERATE UNIQUE UA</span>
                        </>
                      )}
                    </motion.button>
                    
                    <div className="text-center mt-2">
                      <span className="text-[9px] font-mono text-[#8b949e]">
                        Outputs are matching actual browser structure values
                      </span>
                    </div>
                  </div>

                </div>

                {/* REAL DATA POOL INSPECTOR PANEL */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 120, damping: 15 }}
                  whileHover={{ borderColor: "rgba(63, 185, 80, 0.35)" }}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-[#3fb950]" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#c9d1d9]">
                      Database Pool Explorer
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto text-[10px] font-mono text-[#8b949e] pr-1">
                    <div className="border-b border-[#30363d]/50 pb-1">
                      <span className="text-[#58a6ff]">Active Chrome Spectrum:</span> 133, 139, 141, 144, 145, 146, 147, 148
                    </div>
                    <div className="border-b border-[#30363d]/50 pb-1">
                      <span className="text-[#3fb950]">Android Devices:</span> {androidPool.map(a => a.name).join(', ')}
                    </div>
                    <div className="border-b border-[#30363d]/50 pb-1">
                      <span className="text-[#d2a8ff]">iOS Platforms:</span> {iosPool.map(i => i.name).join(', ')}
                    </div>
                    <div>
                      <span className="text-amber-500">Mocks Carriers:</span> {carriers.map(c => c.c).join(', ')}
                    </div>
                  </div>
                </motion.div>

              </motion.div>

              {/* RIGHT COLUMN: DISPATCH MONITOR & SEGMENT ANALYSIS (7 Cols) */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.15 }}
                className="lg:col-span-7 flex flex-col gap-6"
              >
                
                {/* OUTPUT DISPLAY TERMINAL */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none rounded-bl-3xl" />
                  
                  {/* Title & Actions */}
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4.5 w-4.5 text-[#3fb950]" />
                      <span className="text-xs font-bold font-mono tracking-wider uppercase text-[#c9d1d9]">
                        Live Generated Header Stream
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyToClipboard(generatedUA)}
                        className="text-xs flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-white px-3 py-1.5 rounded border border-[#30363d] transition cursor-pointer"
                        title="Copy string to clipboard"
                        id="btn-copy"
                      >
                        {copyStatus ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#56d364]" />
                            <span className="text-[#56d364] font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-[#8b949e]" />
                            <span>Copy UA</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleDownloadTextFile}
                        className="text-xs flex items-center gap-1 bg-[#21262d] hover:bg-[#30363d] text-white p-1.5 rounded border border-[#30363d] transition cursor-pointer"
                        title="Export UA profile to .txt"
                        id="btn-download"
                      >
                        <Download className="h-3.5 w-3.5 text-[#8b949e]" />
                      </button>
                    </div>
                  </div>

                  {/* UA string terminal box wrapper */}
                  <div className="bg-[#010409] border border-[#30363d] rounded-lg p-4 font-mono text-sm relative group overflow-hidden shadow-inner">
                    <div className="absolute top-2 right-2 text-[9px] font-mono text-[#8b949e] opacity-40 select-none z-10">
                      UNIFIED COGNITIVE STRING
                    </div>

                    {/* Green Laser Scanner Sweep Line */}
                    {isGenerating && (
                      <motion.div 
                        initial={{ y: "-100%" }}
                        animate={{ y: "250%" }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#56d364] to-transparent shadow-[0_0_8px_rgba(86,211,100,0.8)] opacity-70 pointer-events-none z-10"
                      />
                    )}

                    <AnimatePresence mode="wait">
                      {isGenerating ? (
                        <motion.div 
                          key="loading-terminal"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="py-6 text-center text-[#56d364] font-mono flex flex-col items-center justify-center gap-2"
                        >
                          <div className="flex items-center gap-1.5 text-xs text-[#56d364] font-semibold tracking-wider font-mono">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#56d364] animate-ping" />
                            <span>CALIBRATING TELEMETRY SIGS...</span>
                          </div>
                          <div className="text-[10px] text-[#8b949e] font-mono select-none">
                            Configuring dynamic kernel headers &amp; masking hardware agents...
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="ua-output"
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{ duration: 0.3 }}
                          className="text-[#79c0ff] whitespace-pre-wrap break-all leading-relaxed pr-6 select-all selection:bg-blue-600/50 relative z-0"
                        >
                          {generatedUA || "Hit generate to compile header..."}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Meta tags indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <motion.div 
                      key={"meta-device-" + deviceMeta}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 140, damping: 14 }}
                      whileHover={{ scale: 1.025, borderColor: "#30363d" }}
                      className="bg-[#0d1117] rounded-lg p-2.5 border border-[#30363d]/70 transition-all"
                    >
                      <span className="block text-[9px] text-[#8b949e] font-mono uppercase">Target Hardware</span>
                      <span className="text-xs font-semibold text-white block truncate">{deviceMeta || 'N/A'}</span>
                    </motion.div>
                    
                    <motion.div 
                      key={"meta-os-" + osMeta}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.05 }}
                      whileHover={{ scale: 1.025, borderColor: "#30363d" }}
                      className="bg-[#0d1117] rounded-lg p-2.5 border border-[#30363d]/70 transition-all"
                    >
                      <span className="block text-[9px] text-[#8b949e] font-mono uppercase">Os Layer</span>
                      <span className="text-xs font-semibold text-white block truncate">{osMeta || 'N/A'}</span>
                    </motion.div>

                    <motion.div 
                      key={"meta-version-" + platform + "-" + chromeMajorVer + "-" + firefoxMajorVer}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.1 }}
                      whileHover={{ scale: 1.025, borderColor: "#30363d" }}
                      className="bg-[#0d1117] rounded-lg p-2.5 border border-[#30363d]/70 col-span-2 sm:col-span-1 transition-all"
                    >
                      <span className="block text-[9px] text-[#8b949e] font-mono uppercase">Version Code</span>
                      <span className="text-xs font-semibold text-amber-400 block truncate font-mono">
                        {platform === 'CHROME' ? `Chrome ${chromeMajorVer}` : platform === 'FIREFOX' ? `Firefox ${firefoxMajorVer}` : `${platform} Client`}
                      </span>
                    </motion.div>
                  </div>

                  {/* INTERACTIVE BREAKDOWN & LEARNING MATRIX */}
                  <div className="bg-[#0d1117]/80 rounded-xl border border-[#30363d] p-4">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <HelpCircle className="h-4 w-4 text-[#58a6ff]" />
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#c9d1d9]">
                        Interactive Sequence breakdown
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-[#8b949e] mb-3 leading-relaxed">
                      Click any highlighted block below to view its functional description, system value, and web compliance role:
                    </p>

                    <div className="flex flex-wrap gap-1.5 font-mono text-xs mb-3">
                      {parsedSegments.map((seg, idx) => {
                        let colorClass = 'bg-[#21262d] text-white border-[#30363d]';
                        if (seg.type === 'prefix') colorClass = 'bg-slate-900 border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:border-slate-500/50';
                        if (seg.type === 'system') colorClass = 'bg-blue-900/30 border-blue-800/40 text-blue-300 hover:bg-blue-900/40 hover:border-blue-600/50';
                        if (seg.type === 'engine') colorClass = 'bg-violet-900/30 border-violet-800/40 text-violet-300 hover:bg-violet-900/40 hover:border-violet-600/50';
                        if (seg.type === 'browser') colorClass = 'bg-amber-900/30 border-amber-800/40 text-amber-300 hover:bg-amber-900/40 hover:border-amber-600/50';
                        if (seg.type === 'app') colorClass = 'bg-pink-900/30 border-pink-800/40 text-pink-300 hover:bg-pink-900/40 hover:border-pink-600/50';

                        const isSel = selectedSegmentIdx === idx;

                        return (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.85, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.025, type: "spring", stiffness: 220, damping: 15 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            key={idx}
                            onClick={() => setSelectedSegmentIdx(idx)}
                            className={`px-2.5 py-1 rounded-md border text-left cursor-pointer transition-all ${colorClass} ${
                              isSel ? 'ring-2 ring-white border-white scale-102 font-bold shadow-[0_0_12px_rgba(255,255,255,0.15)]' : 'opacity-85 hover:opacity-100 shadow-sm'
                            }`}
                          >
                            {seg.text.trim()}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Explanatory content for active category selection */}
                    <AnimatePresence mode="wait">
                      {selectedSegmentIdx !== null ? (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-xs"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-200">
                              {parsedSegments[selectedSegmentIdx].type} segment
                            </span>
                            <span className="text-[#8b949e]">specification:</span>
                          </div>
                          <p className="text-[#c9d1d9] font-mono mb-1 text-[11px] font-bold">
                            "{parsedSegments[selectedSegmentIdx].text.trim()}"
                          </p>
                          <p className="text-[#8b949e] leading-relaxed">
                            {parsedSegments[selectedSegmentIdx].description}
                          </p>
                        </motion.div>
                      ) : (
                        <div className="text-center py-2 text-[10px] text-[#8b949e] font-mono italic">
                          💡 Click any block to decipher underlying header segments.
                        </div>
                      )}
                    </AnimatePresence>

                  </div>

                </div>

                {/* HISTORICAL LOGS SEARCH TABLE & HISTORY PANEL */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
                  
                  {/* Top Bar with actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-[#2f81f7]" />
                      <span className="text-xs font-bold font-mono tracking-wider uppercase text-[#c9d1d9]">
                        Session Generated History Stack ({historyList.length})
                      </span>
                    </div>

                    {historyList.length > 0 && (
                      <button
                        onClick={handleClearAllHistory}
                        className="text-[11px] font-mono text-[#f85149] hover:bg-[#f85149]/10 px-2 py-1 rounded border border-[#f85149]/30 transition self-end sm:self-auto cursor-pointer"
                      >
                        Scrub Session Records
                      </button>
                    )}
                  </div>

                  {/* Filter tabs */}
                  <div className="flex overflow-x-auto gap-1 py-0.5 pr-1 text-xs">
                    {['ALL', 'CHROME', 'FIREFOX', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK'].map(p => {
                      const isSel = platformFilter === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setPlatformFilter(p)}
                          className={`px-3 py-1 rounded-md border font-mono transition text-[10px] shrink-0 cursor-pointer ${
                            isSel 
                              ? 'bg-[#2f81f7]/15 border-[#2f81f7] text-[#58a6ff] font-bold' 
                              : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                          }`}
                        >
                          {p === 'ALL' ? 'Show All' : p}
                        </button>
                      );
                    })}
                  </div>

                  {/* Searching Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input
                      type="text"
                      placeholder="Search history by brand model, version code, or UA snippet..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      id="search"
                      className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#2f81f7] outline-none text-xs text-white pl-9 pr-4 py-2 rounded-lg placeholder-[#484f58]"
                    />
                  </div>

                  {/* TABLE LIST OUT */}
                  <div className="max-h-[340px] overflow-y-auto border border-[#30363d] rounded-lg bg-[#0d1117]">
                    {filteredHistory.length === 0 ? (
                      <div className="text-center py-12 text-xs text-[#8b949e] font-mono space-y-2">
                        <div>&gt;_ No matching historical entries located.</div>
                        <div className="text-[10px] opacity-70">
                          {historyList.length === 0 
                            ? 'Generate your first elite user agent header profile!' 
                            : 'Try updating your search query or platform filter tabs.'}
                        </div>
                      </div>
                    ) : (
                      <table className="w-full border-collapse text-left text-xs font-mono">
                        <thead className="bg-[#161b22] sticky top-0 border-b border-[#30363d]">
                          <tr className="text-[#8b949e]">
                            <th className="p-3 font-semibold text-[10px] uppercase">Engine Platform</th>
                            <th className="p-3 font-semibold text-[10px] uppercase">Payload Blueprint</th>
                            <th className="p-3 font-semibold text-[10px] uppercase">User-Agent Signature</th>
                            <th className="p-3 font-semibold text-[10px] uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]/60">
                          {filteredHistory.map((item) => {
                            let tagColor = 'bg-slate-900 border-slate-700/60 text-slate-300';
                            if (item.platform === 'CHROME') tagColor = 'bg-amber-950/30 border-amber-800/40 text-amber-400';
                            if (item.platform === 'FIREFOX') tagColor = 'bg-orange-950/30 border-orange-800/40 text-orange-400';
                            if (item.platform === 'FACEBOOK') tagColor = 'bg-blue-950/30 border-blue-800/40 text-blue-400';
                            if (item.platform === 'INSTAGRAM') tagColor = 'bg-pink-950/30 border-pink-800/40 text-pink-400';
                            if (item.platform === 'TIKTOK') tagColor = 'bg-teal-950/30 border-teal-800/40 text-teal-400';

                            return (
                              <motion.tr 
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                key={item.id} 
                                className="hover:bg-[#161b22]/40 transition group"
                              >
                                <td className="p-3 align-top whitespace-nowrap">
                                  <div className="flex flex-col gap-1">
                                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold text-center inline-block w-fit ${tagColor}`}>
                                      {item.platform}
                                    </span>
                                    <span className="text-[9px] text-[#8b949e]">{item.timestamp}</span>
                                  </div>
                                </td>
                                
                                <td className="p-3 align-top whitespace-nowrap max-w-[150px]">
                                  <div className="text-white font-medium text-[11px] truncate">{item.deviceName}</div>
                                  <div className="text-[9px] text-[#8b949e] mt-0.5 truncate">{item.osVersion}</div>
                                </td>

                                <td className="p-3 align-top">
                                  <p className="text-[#8b949e] hover:text-[#58a6ff] text-[11px] line-clamp-2 break-all font-mono transition pr-2 select-all leading-normal" title={item.ua}>
                                    {item.ua}
                                  </p>
                                </td>

                                <td className="p-3 align-top text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                                    <button
                                      onClick={() => {
                                        setGeneratedUA(item.ua);
                                        setDeviceMeta(item.deviceName || '');
                                        setOsMeta(item.osVersion || '');
                                        setEngineMeta(item.engineSpec || '');
                                        // Auto selection settings restore
                                        setPlatform(item.platform);
                                        setDeviceCategory(item.deviceCategory);
                                        // Scroll back up to display
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="text-[9px] bg-[#21262d] hover:bg-[#2f81f7]/10 hover:text-[#58a6ff] border border-[#30363d] px-2 py-1 rounded transition"
                                      title="Load back into generator panel"
                                    >
                                      Load
                                    </button>
                                    <button
                                      onClick={() => handleCopyToClipboard(item.ua)}
                                      className="p-1 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#3fb950] rounded transition"
                                      title="Copy signature"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLogItem(item.id)}
                                      className="p-1 bg-[#21262d] hover:bg-[#f85149]/10 border border-[#30363d] text-[#8b949e] hover:text-[#f85149] rounded transition"
                                      title="Scrub entry"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>

              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#30363d] bg-[#0d1117] mt-12 py-6 text-center text-xs text-[#8b949e] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span>Elite UA Multi-Platform Spec Matrix 2026. Custom calibrated with</span>
            <Heart className="h-3.5 w-3.5 text-[#f85149] fill-[#f85149] inline animate-xs-pulse" />
          </div>
          <div>
            Built with React 19, Tailwind CSS v4 &amp; Motion transitions.
          </div>
        </div>
      </footer>

    </div>
  );
}
