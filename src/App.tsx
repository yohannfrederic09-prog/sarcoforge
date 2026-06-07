import React, { useState, useEffect } from "react";
import { OnboardingData, WorkoutSession, Challenge, Badge, LeaderboardUser } from "./types";
import OnboardingWizard from "./components/OnboardingWizard";
import WorkoutTracker from "./components/WorkoutTracker";
import AICoachChat from "./components/AICoachChat";
import NutritionHub from "./components/NutritionHub";
import AdvancedAnalytics from "./components/AdvancedAnalytics";
import CommunityFeed from "./components/CommunityFeed";
import GamificationCenter from "./components/GamificationCenter";
import AdminPanel from "./components/AdminPanel";
import DevOpsConsole from "./components/DevOpsConsole";
import AccountSection from "./components/AccountSection";
import CyberModal from "./components/CyberModal";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import {
  Sparkles,
  Dumbbell,
  MessageSquare,
  Utensils,
  BarChart3,
  Users,
  Trophy,
  Shield,
  Terminal,
  LogOut,
  ChevronRight,
  Flame,
  Award,
  BookOpen,
  DollarSign,
  Heart,
  UserCheck,
  User,
  CloudCheck,
  RefreshCw,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Menu,
  X
} from "lucide-react";

export default function App() {
  // Theme Mode preferences (Sombre, Clair ou Automatique/Système)
  type ThemeMode = "dark" | "light" | "auto";
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("sarcoforge_theme_preference") as ThemeMode) || "auto";
  });
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const handleThemeChange = () => {
      if (themeMode === "auto") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(systemPrefersDark);
      } else {
        setIsDark(themeMode === "dark");
      }
    };

    handleThemeChange();

    if (themeMode === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_theme_preference", themeMode);
    if (isDark) {
      document.documentElement.classList.remove("theme-light");
      document.documentElement.classList.add("theme-dark");
    } else {
      document.documentElement.classList.remove("theme-dark");
      document.documentElement.classList.add("theme-light");
    }
  }, [themeMode, isDark]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("sarcoforge_activeTab") || "onboarding";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem("sarcoforge_onboardingCompleted") === "true";
  });
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(() => {
    const raw = localStorage.getItem("sarcoforge_onboardingData");
    return raw ? JSON.parse(raw) : null;
  });
  const [aiPlanText, setAiPlanText] = useState<string | null>(() => {
    return localStorage.getItem("sarcoforge_aiPlanText") || null;
  });

  // Core Gamification levels state
  const [level, setLevel] = useState<number>(() => {
    const val = localStorage.getItem("sarcoforge_level");
    return val ? parseInt(val, 10) : 1;
  });
  const [xp, setXp] = useState<number>(() => {
    const val = localStorage.getItem("sarcoforge_xp");
    return val ? parseInt(val, 10) : 350;
  });
  const [xpNeeded, setXpNeeded] = useState<number>(() => {
    const val = localStorage.getItem("sarcoforge_xpNeeded");
    return val ? parseInt(val, 10) : 1000;
  });
  const [showLevelUpToast, setShowLevelUpToast] = useState(false);

  // Unified CyberModal global configuration state
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm" | "success" | "info";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert"
  });

  const showModal = (options: {
    title: string;
    message: string;
    type?: "alert" | "confirm" | "success" | "info";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }) => {
    setModalConfig({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || "alert",
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      onConfirm: options.onConfirm
    });
  };

  // Global Workout state logs
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    const raw = localStorage.getItem("sarcoforge_sessions");
    return raw ? JSON.parse(raw) : [];
  });

  // Daily dynamic macro consumption state
  const [consumedCal, setConsumedCal] = useState<number>(() => {
    const val = localStorage.getItem("sarcoforge_consumedCal");
    return val ? parseInt(val, 10) : 1130;
  });
  const [consumedProt, setConsumedProt] = useState<number>(() => {
    const val = localStorage.getItem("sarcoforge_consumedProt");
    return val ? parseInt(val, 10) : 80;
  });
  const [consumedCarb, setConsumedCarb] = useState<number>(() => {
    const val = localStorage.getItem("sarcoforge_consumedCarb");
    return val ? parseInt(val, 10) : 130;
  });
  const [consumedLip, setConsumedLip] = useState<number>(() => {
    const val = localStorage.getItem("sarcoforge_consumedLip");
    return val ? parseInt(val, 10) : 30;
  });

  // Challenges array state linking progress to physical achievements
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const raw = localStorage.getItem("sarcoforge_challenges");
    if (raw) return JSON.parse(raw);
    return [
      {
        id: "ch_water",
        title: "Optimisation de l'Hydratation",
        description: "Buvez au moins 2.5L d'eau aujourd'hui pour soutenir vos fonctions cellulaires.",
        category: "Nutrition",
        targetValue: 2.5,
        currentValue: 1.0, // linked to water cups
        unit: "L",
        xpReward: 100,
        completed: false,
        claimed: false,
      },
      {
        id: "ch_sets",
        title: "Entêtement musculaire de Force",
        description: "Valisez au moins 3 séries d'exercices complétées dans votre journal actif.",
        category: "Workout",
        targetValue: 3,
        currentValue: 0,
        unit: "séries",
        xpReward: 150,
        completed: false,
        claimed: false,
      },
      {
        id: "ch_tonnage",
        title: "Somme de Fonte (Tonnage)",
        description: "Atteignez un volume cumulé de 3,000kg de fonte soulevée sur la semaine.",
        category: "Workout",
        targetValue: 3000,
        currentValue: 0,
        unit: "kg",
        xpReward: 300,
        completed: false,
        claimed: false,
      }
    ];
  });

  // Achievements array state
  const [badges, setBadges] = useState<Badge[]>(() => {
    const raw = localStorage.getItem("sarcoforge_badges");
    if (raw) return JSON.parse(raw);
    return [
      { id: "bdg_0", title: "Tonne d'Acier", description: "Soulever 5,000kg de tonnage cumulé sur une séance.", icon: "Flame", unlocked: false, xpValue: 150 },
      { id: "bdg_1", title: "Sorcier de la Macro", description: "Enregistrer vos premiers repas du jour dans le Nutrition Center.", icon: "Award", unlocked: true, xpValue: 100 },
      { id: "bdg_2", title: "Onboardé d'Élite", description: "Compléter le diagnostic biométrique et calibrer les métabolismes.", icon: "Check", unlocked: true, xpValue: 100 },
      { id: "bdg_3", title: "Compagnon du Coach", description: "Dialoguer avec le Coach IA SarcoForge pour briser un plateau.", icon: "Sparkles", unlocked: false, xpValue: 150 },
    ];
  });

  // Global ranking leaders containing ONLY real registered users
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Firebase Auto Sync & Realtime Auth Tracker state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cloudLoading, setCloudLoading] = useState<boolean>(false);
  const [cloudToast, setCloudToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem("sarcoforge_activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_onboardingCompleted", String(onboardingCompleted));
  }, [onboardingCompleted]);

  useEffect(() => {
    if (onboardingData) {
      localStorage.setItem("sarcoforge_onboardingData", JSON.stringify(onboardingData));
    } else {
      localStorage.removeItem("sarcoforge_onboardingData");
    }
  }, [onboardingData]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_aiPlanText", aiPlanText || "");
  }, [aiPlanText]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_level", String(level));
  }, [level]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_xp", String(xp));
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_xpNeeded", String(xpNeeded));
  }, [xpNeeded]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_consumedCal", String(consumedCal));
  }, [consumedCal]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_consumedProt", String(consumedProt));
  }, [consumedProt]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_consumedCarb", String(consumedCarb));
  }, [consumedCarb]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_consumedLip", String(consumedLip));
  }, [consumedLip]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_challenges", JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem("sarcoforge_badges", JSON.stringify(badges));
  }, [badges]);

  // Auth monitoring and automatic background cloud restore/save logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setCloudLoading(true);
        const userPath = `users/${user.uid}`;
        try {
          const docRef = doc(db, "users", user.uid);
          let docSnap;
          try {
            docSnap = await getDoc(docRef);
          } catch (err: any) {
            handleFirestoreError(err, OperationType.GET, userPath);
            throw err;
          }

          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Re-hydrate local values if they exist on the user's secure account
            if (data.level) setLevel(data.level);
            if (data.xp !== undefined) setXp(data.xp);
            if (data.xpNeeded) setXpNeeded(data.xpNeeded);
            if (data.onboardingData) {
              setOnboardingData(data.onboardingData);
              setOnboardingCompleted(true);
            }
            if (data.aiPlanText) setAiPlanText(data.aiPlanText);
            if (data.sessions) setSessions(data.sessions);
            if (data.consumedCal !== undefined) setConsumedCal(data.consumedCal);
            if (data.consumedProt !== undefined) setConsumedProt(data.consumedProt);
            if (data.consumedCarb !== undefined) setConsumedCarb(data.consumedCarb);
            if (data.consumedLip !== undefined) setConsumedLip(data.consumedLip);
            if (data.challenges) setChallenges(data.challenges);
            if (data.badges) setBadges(data.badges);

            // Navigate securely to dashboard if already completed
            if (data.onboardingData && activeTab === "onboarding") {
              setActiveTab("dashboard");
            }

            setCloudToast({
              message: "🪐 Profil synchronisé ! Données restaurées depuis la base sécurisée SarcoForge Cloud.",
              type: "success"
            });
            setTimeout(() => setCloudToast(null), 5000);
          } else {
            // First login ever: safely backup existing local states to the new cloud account
            const payload = {
              userId: user.uid,
              displayName: user.displayName || "Athlète SarcoForge",
              email: user.email || "",
              photoURL: user.photoURL || "",
              level: level,
              xp: xp,
              xpNeeded: xpNeeded,
              onboardingData: onboardingData,
              aiPlanText: aiPlanText,
              sessions: sessions,
              consumedCal: consumedCal,
              consumedProt: consumedProt,
              consumedCarb: consumedCarb,
              consumedLip: consumedLip,
              challenges: challenges,
              badges: badges,
              lastSyncedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            try {
              await setDoc(docRef, payload);
            } catch (err: any) {
              handleFirestoreError(err, OperationType.CREATE, userPath);
              throw err;
            }
            setCloudToast({
              message: "☁️ Première synchronisation ! Profil local et sauvegardes sécurisés sur votre compte Cloud.",
              type: "info"
            });
            setTimeout(() => setCloudToast(null), 5000);
          }
        } catch (err: any) {
          console.error("Cloud synchronization mismatch error:", err);
          setCloudToast({
            message: "⚠️ Alerte de synchronisation: l'accès aux règles de sécurité a restreint la synchronisation cloud automatique.",
            type: "error"
          });
          setTimeout(() => setCloudToast(null), 4000);
        } finally {
          setCloudLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Debounced Cloud Autosave listener whenever core states of work modification are applied
  useEffect(() => {
    if (!currentUser) return;

    const debounceSave = setTimeout(async () => {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const payload = {
          userId: currentUser.uid,
          displayName: currentUser.displayName || "Athlète SarcoForge",
          email: currentUser.email || "",
          photoURL: currentUser.photoURL || "",
          level: level,
          xp: xp,
          xpNeeded: xpNeeded,
          onboardingData: onboardingData,
          aiPlanText: aiPlanText,
          sessions: sessions,
          consumedCal: consumedCal,
          consumedProt: consumedProt,
          consumedCarb: consumedCarb,
          consumedLip: consumedLip,
          challenges: challenges,
          badges: badges,
          lastSyncedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, payload);
      } catch (err) {
        console.warn("Silent background save delayed or security rule block:", err);
      }
    }, 2000); // 2 second throttle/debounce to preserve write quotas

    return () => clearTimeout(debounceSave);
  }, [onboardingData, aiPlanText, level, xp, xpNeeded, sessions, consumedCal, consumedProt, consumedCarb, consumedLip, challenges, badges, currentUser]);

  // Load real leaderboard from Firestore containing ONLY users with actual accounts
  const fetchRealLeaderboard = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList: LeaderboardUser[] = [];
      
      querySnapshot.forEach((docSnap) => {
        const val = docSnap.data();
        if (val.userId && (val.displayName || val.email)) { // must be a real account user
          usersList.push({
            rank: 0,
            name: val.displayName || "Athlète SarcoForge",
            avatar: val.displayName ? val.displayName.substring(0, 2).toUpperCase() : "AT",
            level: val.level || 1,
            xp: val.xp || 0,
            isCurrentUser: currentUser && val.userId === currentUser.uid
          });
        }
      });

      // If current user is not in the list (e.g. they aren't logged in, or local state is primary), make sure we add them!
      const userExistsInCloud = currentUser && usersList.some(u => u.isCurrentUser);
      if (!userExistsInCloud) {
        usersList.push({
          rank: 0,
          name: currentUser?.displayName || "Mon Profil (Local)",
          avatar: currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "MO",
          level: level,
          xp: xp,
          isCurrentUser: true
        });
      }

      // Sort by Level first, then XP descending
      usersList.sort((a, b) => {
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        return b.xp - a.xp;
      });

      // Re-assign correct ranks
      const rankedList = usersList.map((usr, index) => ({
        ...usr,
        rank: index + 1
      }));

      setLeaderboard(rankedList);
    } catch (err) {
      console.warn("Could not load full cloud leaderboard, defaulting to active local user:", err);
      // Fallback: only show the current active user to eliminate any fake/mock user records
      setLeaderboard([
        {
          rank: 1,
          name: currentUser?.displayName || "Mon Profil (Local)",
          avatar: currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "MO",
          level: level,
          xp: xp,
          isCurrentUser: true
        }
      ]);
    }
  };

  useEffect(() => {
    fetchRealLeaderboard();
  }, [currentUser, level, xp]);

  // Callback when Onboarding concludes
  const handleOnboardingComplete = (data: OnboardingData, planText: string) => {
    setOnboardingData(data);
    setAiPlanText(planText);
    setOnboardingCompleted(true);
    setActiveTab("dashboard");

    // Award initial setup XP (150XP)
    addXP(150);
  };

  // Helper sync update to unlock premium dashboards after restore
  const handleUpdateOnboarding = (data: OnboardingData) => {
    setOnboardingData(data);
    if (data) {
      setOnboardingCompleted(true);
    }
  };

  // Helper handling progressive RPG levels experience thresholds
  const addXP = (amount: number) => {
    setXp((prevXP) => {
      let targetXP = prevXP + amount;
      let targetLevel = level;
      let targetNeeded = xpNeeded;

      while (targetXP >= targetNeeded) {
        targetXP -= targetNeeded;
        targetLevel += 1;
        targetNeeded = targetLevel * 1000;
        setShowLevelUpToast(true);
        setTimeout(() => setShowLevelUpToast(false), 5200);
      }

      setLevel(targetLevel);
      setXpNeeded(targetNeeded);

      // Update current user rank inside leaderboard
      setLeaderboard((prev) =>
        prev
          .map((user) => {
            if (user.isCurrentUser) {
              return { ...user, level: targetLevel, xp: user.xp + amount };
            }
            return user;
          })
          .sort((a, b) => {
            if (b.level !== a.level) {
              return b.level - a.level;
            }
            return b.xp - a.xp;
          })
          .map((user, idx) => ({ ...user, rank: idx + 1 }))
      );

      return targetXP;
    });
  };

  // Callback: sets logging complete
  const handleWorkoutCompleted = (session: WorkoutSession, xpReward: number) => {
    setSessions((prev) => [session, ...prev]);

    // Update challenge parameters for 'sets completed' and 'tonnage sum'
    setChallenges((prevChallenges) =>
      prevChallenges.map((ch) => {
        if (ch.id === "ch_sets") {
          const val = ch.currentValue + (session.totalVolume || 0);
          const completed = val >= ch.targetValue;
          return { ...ch, currentValue: val, completed };
        }
        if (ch.id === "ch_tonnage") {
          const val = ch.currentValue + (session.totalTonnage || 0);
          const completed = val >= ch.targetValue;
          return { ...ch, currentValue: val, completed };
        }
        return ch;
      })
    );

    // Unlock badge 'Tonne d'Acier' if session tonnage >= 5000kg
    if ((session.totalTonnage || 0) >= 4000) {
      setBadges((prev) =>
        prev.map((b) => (b.id === "bdg_0" ? { ...b, unlocked: true } : b))
      );
    }

    addXP(xpReward);
  };

  // Callback: nutrition intake metrics addition
  const handleMacrosUpdated = (calories: number, protein: number, carbs: number, lipids: number) => {
    setConsumedCal((prev) => prev + calories);
    setConsumedProt((prev) => prev + protein);
    setConsumedCarb((prev) => prev + carbs);
    setConsumedLip((prev) => prev + lipids);

    // Update water challenges progress if calories represent liquid
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === "ch_water") {
          const val = Math.min(ch.currentValue + 0.25, ch.targetValue);
          const completed = val >= ch.targetValue;
          return { ...ch, currentValue: val, completed };
        }
        return ch;
      })
    );
  };

  // Claim XP callback
  const handleClaimXP = (challengeId: string, xpReward: number) => {
    setChallenges((prev) =>
      prev.map((ch) => (ch.id === challengeId ? { ...ch, claimed: true } : ch))
    );
    addXP(xpReward);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col font-sans relative selection:bg-blue-500/35 selection:text-white antialiased">
      {/* Background visual accents */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none"></div>

      {/* Level-Up Toast Notification */}
      {showLevelUpToast && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-500 to-amber-600 border border-yellow-400 text-zinc-950 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4.5 animate-fadeIn-fast">
          <div className="w-12 h-12 bg-zinc-950 text-yellow-400 rounded-full flex items-center justify-center font-black border border-yellow-400/40 relative animate-pulse">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base uppercase tracking-tight">LEVEL UP !</h4>
            <p className="text-xs font-semibold text-zinc-900">Félicitations, vous passez au **Niveau {level}** ! Accès étendu disponible.</p>
          </div>
        </div>
      )}

      {/* Cloud Sync Status Toast Notification */}
      {cloudToast && (
        <div className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md animate-fadeIn-fast ${
          cloudToast.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/20 text-emerald-300" 
            : cloudToast.type === "error"
            ? "bg-red-950/90 border-red-500/20 text-red-300"
            : "bg-blue-950/90 border-blue-500/20 text-blue-300"
        }`}>
          {cloudLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <User className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-[11px] font-semibold">{cloudToast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-45 px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 rounded-xl bg-zinc-900/30 border border-zinc-900/55 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all md:hidden cursor-pointer"
            title="Menu global"
            id="mobile-drawer-toggle"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-red-400 animate-fadeIn" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>

          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.35)]">
            <Dumbbell className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-md font-black tracking-wider uppercase font-mono text-white">Sarco<span className="text-blue-500">Forge</span></span>
        </div>

        <div className="flex items-center gap-4">
          {/* Cloud Synchronization Indicator */}
          {currentUser ? (
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1">Données Sécurisées: {currentUser.displayName || currentUser.email || "Athlète"}</span>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab("account")}
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">Sauvegarde Locale (Compte non lié)</span>
            </button>
          )}

          {/* Global Athlete Progress Bar in Header */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 block">ATHLÈTE RANG</span>
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wide">Niveau {level}</span>
            </div>
            <div className="w-40 bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-850 relative">
              <div
                className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round((xp / xpNeeded) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-zinc-400 font-mono">{Math.round((xp / xpNeeded) * 100)}%</span>
          </div>

          {/* Automatic Theme & Dark/Light Mode Selector */}
          <div className="flex items-center gap-1 bg-zinc-950/90 border border-zinc-800 p-1 rounded-2xl shadow-lg relative shrink-0">
            <button
              type="button"
              onClick={() => setThemeMode("light")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                themeMode === "light"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.05]"
                  : "text-zinc-500 hover:text-zinc-350"
              }`}
              title="Thème Clair Cyber"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("dark")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                themeMode === "dark"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.05]"
                  : "text-zinc-500 hover:text-zinc-350"
              }`}
              title="Thème Sombre Élite"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("auto")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 px-2.5 ${
                themeMode === "auto"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.05]"
                  : "text-zinc-500 hover:text-zinc-350"
              }`}
              title="Automatique (Détecte le système)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase hidden sm:inline">Auto</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main workspace (Sidebar + viewport container) */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Navigation panel Sidebar (Desktop/Tablet Only) */}
        <aside className="hidden md:flex w-full md:w-64 border-r border-zinc-900 bg-[#0a0a0c] p-4 flex-col gap-1 shrink-0">
          <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest px-3 mb-2.5 block">ESPACE ATHLÈTE</span>

          <button
            onClick={() => {
              if (onboardingCompleted) setActiveTab("dashboard");
              else setActiveTab("onboarding");
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "onboarding" || activeTab === "dashboard"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Diagnostics & IA Plan</span>
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "account"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mon Compte Cloud</span>
          </button>

          <button
            onClick={() => {
              if (onboardingCompleted) setActiveTab("workouts");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Veuillez compléter votre diagnostic d'onboarder biométrique ('Diagnostics & IA Plan') afin de déverrouiller le suivi intelligent de vos séances.",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "workouts"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Suivi d'Entraînement</span>
          </button>

          <button
            onClick={() => {
              if (onboardingCompleted) setActiveTab("coach");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Le module Coach IA Ultra Avancé a besoin de calibrer vos données physiologiques avant de lancer l'analyse biomécanique en temps réel. Complétez votre onboarding !",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "coach"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Coach IA Ultra Avancé</span>
          </button>

          <button
            onClick={() => {
              if (onboardingCompleted) setActiveTab("nutrition");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "L'indice d'absorption moléculaire, le plan nutritionnel et l'accès à la base d'aliments de pointe requièrent l'évaluation initiale d'onboarding.",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "nutrition"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <Utensils className="w-4 h-4" />
            <span>Nutrition & Tracker</span>
          </button>

          <button
            onClick={() => {
              if (onboardingCompleted) setActiveTab("analytics");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Les graphiques prévisionnels et l'analyseur de tonnages attendent l'évaluation biométrique pour commencer à modéliser vos projections de force.",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analyses & Projections</span>
          </button>

          <button
            onClick={() => {
              if (onboardingCompleted) setActiveTab("community");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Pour préserver la qualité de la communauté d'élite, vous devez valider vos calibrages biométriques de départ. Rejoignez la forge !",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "community"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <Users className="w-4 h-4" />
            <span>Club Communauté</span>
          </button>

          <button
            onClick={() => {
              if (onboardingCompleted) setActiveTab("gamification");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Votre feuille de personnage de force (Feuille d'Athlète RPG) et le suivi des quêtes de tonnage s'activent après complétion du diagnostic.",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "gamification"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <Trophy className="w-4 h-4" />
            <span>Quêtes & Défis RPG</span>
          </button>

          <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest px-3 mt-6 mb-2.5 block">SYSTÈME ET TECH</span>

          <button
            onClick={() => setActiveTab("admin")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Back Office Admin</span>
          </button>

          <button
            onClick={() => setActiveTab("devops")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "devops"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Architect Console</span>
          </button>

          {/* Reset button to clear onboarding memory */}
          {onboardingCompleted && (
            <button
              onClick={() => {
                showModal({
                  title: "Réinitialisation Algorithmique",
                  message: "Attention, cette action est irréversible. Tout l'historique de votre biométrie, vos repas, vos quêtes actives, et vos séances seront définitivement détruits du stockage local.",
                  type: "confirm",
                  confirmText: "Tout effacer",
                  cancelText: "Conserver",
                  onConfirm: () => {
                    setOnboardingCompleted(false);
                    setOnboardingData(null);
                    setActiveTab("onboarding");
                    setLevel(1);
                    setXp(350);
                    localStorage.removeItem("sarcoforge_onboardingCompleted");
                    localStorage.removeItem("sarcoforge_onboardingData");
                    localStorage.removeItem("sarcoforge_sessions");
                    localStorage.removeItem("sarcoforge_logged_meals");
                  }
                });
              }}
              className="mt-auto w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-red-500 hover:bg-red-500/5 hover:text-red-400 transition-all border border-transparent cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Réinitialiser Diagnos</span>
            </button>
          )}
        </aside>

        {/* Mobile Sliding Drawer Backdrop overlay */}
        <div 
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Sliding Drawer Sidebar Sheet */}
        <aside 
          className={`fixed top-16 left-0 bottom-0 w-72 bg-[#09090b] border-r border-zinc-900 px-4 py-6 flex flex-col gap-1 z-45 md:hidden transition-transform duration-300 transform overflow-y-auto pb-28 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest px-3 mb-2.5 block">ESPACE ATHLÈTE</span>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onboardingCompleted) setActiveTab("dashboard");
              else setActiveTab("onboarding");
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "onboarding" || activeTab === "dashboard"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Diagnostics & IA Plan</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveTab("account");
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "account"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mon Compte Cloud</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onboardingCompleted) setActiveTab("workouts");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Veuillez compléter votre diagnostic d'onboarder biométrique ('Diagnostics & IA Plan') afin de déverrouiller le suivi intelligent de vos séances.",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "workouts"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Suivi d'Entraînement</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onboardingCompleted) setActiveTab("coach");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Le module Coach IA Ultra Avancé a besoin de calibrer vos données physiologiques avant de lancer l'analyse biomécanique en temps réel. Complétez votre onboarding !",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "coach"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Coach IA Ultra Avancé</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onboardingCompleted) setActiveTab("nutrition");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "L'indice d'absorption moléculaire, le plan nutritionnel et l'accès à la base d'aliments de pointe requièrent l'évaluation initiale d'onboarding.",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "nutrition"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <Utensils className="w-4 h-4" />
            <span>Nutrition & Tracker</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onboardingCompleted) setActiveTab("analytics");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Les graphiques prévisionnels et l'analyseur de tonnages attendent l'évaluation biométrique pour commencer à modéliser vos projections de force.",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analyses & Projections</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onboardingCompleted) setActiveTab("community");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Pour préserver la qualité de la communauté d'élite, vous devez valider vos calibrages biométriques de départ. Rejoignez la forge !",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "community"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <Users className="w-4 h-4" />
            <span>Club Communauté</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onboardingCompleted) setActiveTab("gamification");
              else {
                showModal({
                  title: "Accès Restreint - Diagnostic Requis",
                  message: "Votre feuille de personnage de force (Feuille d'Athlète RPG) et le suivi des quêtes de tonnage s'activent après complétion du diagnostic.",
                  type: "info"
                });
              }
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "gamification"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-60" : ""}`}
          >
            <Trophy className="w-4 h-4" />
            <span>Quêtes & Défis RPG</span>
          </button>

          <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest px-3 mt-6 mb-2.5 block">SYSTÈME ET TECH</span>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveTab("admin");
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Back Office Admin</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveTab("devops");
            }}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "devops"
                ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Architect Console</span>
          </button>

          {/* Reset button to clear onboarding memory */}
          {onboardingCompleted && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                showModal({
                  title: "Réinitialisation Algorithmique",
                  message: "Attention, cette action est irréversible. Tout l'historique de votre biométrie, vos repas, vos quêtes actives, et vos séances seront définitivement détruits du stockage local.",
                  type: "confirm",
                  confirmText: "Tout effacer",
                  cancelText: "Conserver",
                  onConfirm: () => {
                    setOnboardingCompleted(false);
                    setOnboardingData(null);
                    setActiveTab("onboarding");
                    setLevel(1);
                    setXp(350);
                    localStorage.removeItem("sarcoforge_onboardingCompleted");
                    localStorage.removeItem("sarcoforge_onboardingData");
                    localStorage.removeItem("sarcoforge_sessions");
                    localStorage.removeItem("sarcoforge_logged_meals");
                  }
                });
              }}
              className="mt-6 w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-red-500 hover:bg-red-500/5 hover:text-red-400 transition-all border border-transparent cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Réinitialiser Diagnos</span>
            </button>
          )}
        </aside>

        {/* Viewport content layout - snubbier padding on mobile/tablet */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6 pb-24 md:pb-8">
          {/* Onboarding Wizard view */}
          {activeTab === "onboarding" && !onboardingCompleted && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-3 pb-4">
                <span className="text-xs font-mono font-bold text-blue-500 bg-blue-500/10 py-1 px-3 rounded-full uppercase tracking-widest leading-none">SarcoForge Connecté</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Calibrez votre potentiel grâce à l'IA Coaching
                </h1>
                <p className="text-xs text-zinc-400 leading-normal">
                  Remplissez votre diagnostic d'onboarder pour générer un programme de musculation sur-mesure, vos cibles métaboliques et vos projections physiologiques à 12 mois.
                </p>
              </div>
              <OnboardingWizard onComplete={handleOnboardingComplete} />
            </div>
          )}

          {/* Onboarding results & general dashboard wrapper */}
          {(activeTab === "onboarding" || activeTab === "dashboard") && onboardingCompleted && (
            <div className="space-y-8 animate-fadeIn">
              {/* Dynamic summary banner */}
              <div className="bg-gradient-to-r from-blue-950/40 via-zinc-950/80 to-zinc-950/80 rounded-3xl border border-zinc-800 p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="space-y-1.5 flex-1">
                  <span className="text-xs font-mono text-zinc-500 uppercase">SYNTHÈSE DE PROFIL ATHLÈTE</span>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                    Optimisations Sport IA <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse animate-bounce" />
                  </h2>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-zinc-400 pt-2 leading-relaxed">
                    <span>Objectif: <strong className="text-white font-bold">{onboardingData?.goal}</strong></span>
                    <span>Niveau: <strong className="text-white font-bold">{onboardingData?.experience}</strong></span>
                    <span>Taille/Poids: <strong className="text-white font-bold">{onboardingData?.height}cm / {onboardingData?.weight}kg</strong></span>
                    <span>Régime: <strong className="text-white font-bold">{onboardingData?.dietaryPreferences}</strong></span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-900 mt-1.5">
                    <span>Lieux: <strong className="text-emerald-400 font-bold">{(onboardingData?.trainingLocations || []).join(", ") || "Salle de sport"}</strong></span>
                    <span>Équipes: <strong className="text-blue-400 font-semibold">{(onboardingData?.specificEquipment || []).join(", ") || "Zéro Matériel (Corps)"}</strong></span>
                    <span>Budget: <strong className="text-yellow-400">{onboardingData?.equipmentBudget || "Aucun"}</strong></span>
                    <span>Espace: <strong className="text-indigo-400">{onboardingData?.availableSpace || "Standard"}</strong></span>
                  </div>
                </div>

                {/* Live calories check boxes */}
                <div className="flex gap-4.5">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center min-w-[7rem]">
                    <span className="text-[10px] font-mono text-zinc-500 block">PROTEINES JOURNALIERES</span>
                    <span className="text-xl font-bold font-mono text-blue-400 tracking-tight block mt-0.5">{consumedProt}g</span>
                    <span className="text-[9px] text-zinc-500 font-mono block">sur 160g</span>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center min-w-[7rem]">
                    <span className="text-[10px] font-mono text-zinc-500 block font-bold block">CALORIES REQUISES (kcal)</span>
                    <span className="text-xl font-bold font-mono text-indigo-400 tracking-tight block mt-0.5">{consumedCal}</span>
                    <span className="text-[9px] text-zinc-500 font-mono block">sur 2350 kcal</span>
                  </div>
                </div>
              </div>

              {/* Generated AI Sports Plan Text */}
              {aiPlanText && (
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 blur-3xl rounded-full"></div>
                  <h3 className="text-base font-black tracking-tight text-white mb-4 border-b border-zinc-800 pb-3 flex items-center gap-1.5 uppercase font-sans">
                    <UserCheck className="w-5 h-5 text-blue-500" /> Plan Physiologique Généré par l'IA Gemini
                  </h3>
                  <div className="text-[12.5px] text-zinc-300 leading-relaxed space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                    <div className="prose prose-invert prose-xs text-xs">
                      {/* Simple visual render of raw Markdown from Gemini */}
                      {aiPlanText.split("\n").map((line, idx) => {
                        if (line.startsWith("### ")) return <h4 key={idx} className="text-sm font-bold text-blue-400 mt-4 mb-2 first:mt-0 font-sans tracking-tight">{line.replace("### ", "")}</h4>;
                        if (line.startsWith("## ")) return <h3 key={idx} className="text-base font-bold text-white mt-5 mb-2.5 first:mt-0 font-sans tracking-tight">{line.replace("## ", "")}</h3>;
                        if (line.startsWith("# ")) return <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-3 first:mt-0 font-sans tracking-tight">{line.replace("# ", "")}</h2>;
                        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                          const clean = line.replace(/^\s*[\*\-]\s+/, "");
                          return <li key={idx} className="ml-5 list-disc text-xs text-zinc-350 mb-1.5 leading-relaxed">{clean}</li>;
                        }
                        if (line.trim() === "") return <div key={idx} className="h-2" />;
                        return <p key={idx} className="mb-2 text-zinc-350 leading-relaxed font-sans">{line}</p>;
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Core routines planner view */}
          {activeTab === "workouts" && onboardingCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">ENTRAÎNEMENT CONNECTÉ</span>
                <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Routines d'Entraînement Actives</h1>
              </div>
              <WorkoutTracker 
                onWorkoutCompleted={handleWorkoutCompleted} 
                onboardingData={onboardingData} 
                onUpdateOnboarding={setOnboardingData} 
              />
            </div>
          )}

          {/* AI Coach chat workspace */}
          {activeTab === "coach" && onboardingCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">INTELLIGENCE SPORTIVE IA</span>
                <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Coach IA Ultra Avancé</h1>
              </div>
              <AICoachChat />
            </div>
          )}

          {/* Nutrition logs view */}
          {activeTab === "nutrition" && onboardingCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">DÉTÉCTION GOURMET & MACROS</span>
                <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Nutrition Hub & Barcode Scanner</h1>
              </div>
              <NutritionHub onMacrosUpdated={handleMacrosUpdated} />
            </div>
          )}

          {/* Progress Analytics views */}
          {activeTab === "analytics" && onboardingCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">MODÈLES PRÉDICTIFS ET STATS</span>
                <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Progression & Projections</h1>
              </div>
              <AdvancedAnalytics dataPoints={[]} />
            </div>
          )}

          {/* Community social forum */}
          {activeTab === "community" && onboardingCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">RESEAU SOCIAL DU CLUB</span>
                <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Fil d'Activité Communautaire</h1>
              </div>
              <CommunityFeed />
            </div>
          )}

          {/* Gamified RPG progress levels */}
          {activeTab === "gamification" && onboardingCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">RANGS ET RECOMPENSES ATHLÈTE</span>
                <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Gamification Rôles & Niveaux</h1>
              </div>
              <GamificationCenter
                currentLevel={level}
                currentXP={xp}
                xpNeededForNextLevel={xpNeeded}
                challenges={challenges}
                badges={badges}
                leaderboard={leaderboard}
                onClaimXP={handleClaimXP}
              />
            </div>
          )}

          {/* Account Section view */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <AccountSection 
                onboardingData={onboardingData} 
                onUpdateOnboarding={handleUpdateOnboarding} 
                sessions={sessions}
                onUpdateSessions={setSessions}
                level={level}
                onUpdateLevel={setLevel}
                xp={xp}
                onUpdateXp={setXp}
              />
            </div>
          )}

          {/* Operations Admin Back Office */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">GESTION DES OPERATIONS SAAS</span>
                <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Espace Administration & KPI Business</h1>
              </div>
              <AdminPanel />
            </div>
          )}

          {/* Technical Specs console DevOps tab */}
          {activeTab === "devops" && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">SYSTEM ENGINEERING SHEETS</span>
                <h1 className="text-2xl font-black text-white mt-1 tracking-tight">Console de Spécifications Système</h1>
              </div>
              <DevOpsConsole />
            </div>
          )}
        </main>
      </div>

      {/* Humble professional UI footer */}
      <footer className="border-t border-zinc-950 bg-[#060608] py-5 px-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-600 font-mono mt-auto gap-3.5 pb-24 md:pb-5">
        <span>© 2026 SarcoForge AI Fitness Platform. Tous droits réservés.</span>
        <div className="flex gap-4">
          <span>SaaS Edition: Production-v1.2</span>
          <span>AWS Cluster: On-Grid</span>
          <span>Database status: Connected postgresql</span>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#08080a]/95 border-t border-zinc-900/90 backdrop-blur-md flex items-center justify-around px-2 z-40 md:hidden pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (onboardingCompleted) setActiveTab("dashboard");
            else setActiveTab("onboarding");
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-center transition-all cursor-pointer ${
            activeTab === "onboarding" || activeTab === "dashboard"
              ? "text-blue-400 font-bold"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-semibold tracking-tight">Diagnostics</span>
        </button>

        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (onboardingCompleted) setActiveTab("workouts");
            else {
              showModal({
                title: "Accès Restreint",
                message: "Veuillez compléter votre diagnostic d'onboarder biométrique d'abord.",
                type: "info"
              });
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-center transition-all cursor-pointer ${
            activeTab === "workouts"
              ? "text-blue-400 font-bold"
              : "text-zinc-400 hover:text-zinc-350"
          } ${!onboardingCompleted ? "opacity-50" : ""}`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[9px] font-semibold tracking-tight">Séances</span>
        </button>

        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (onboardingCompleted) setActiveTab("coach");
            else {
              showModal({
                title: "Accès Restreint",
                message: "Veuillez compléter votre diagnostic d'onboarder biométrique d'abord.",
                type: "info"
              });
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-center transition-all cursor-pointer ${
            activeTab === "coach"
              ? "text-blue-400 font-bold"
              : "text-zinc-400 hover:text-zinc-350"
          } ${!onboardingCompleted ? "opacity-50" : ""}`}
        >
          <MessageSquare className="w-5 h-5 flex-shrink-0" />
          <span className="text-[9px] font-semibold tracking-tight">Coach IA</span>
        </button>

        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (onboardingCompleted) setActiveTab("nutrition");
            else {
              showModal({
                title: "Accès Restreint",
                message: "Veuillez compléter votre diagnostic d'onboarder biométrique d'abord.",
                type: "info"
              });
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-center transition-all cursor-pointer ${
            activeTab === "nutrition"
              ? "text-blue-400 font-bold"
              : "text-zinc-400 hover:text-zinc-350"
          } ${!onboardingCompleted ? "opacity-50" : ""}`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[9px] font-semibold tracking-tight">Nutrition</span>
        </button>

        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            setActiveTab("account");
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-center transition-all cursor-pointer ${
            activeTab === "account"
              ? "text-blue-400 font-bold"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-semibold tracking-tight">Mon Compte</span>
        </button>
      </nav>

      {/* Futuristic Cybernetic Dialog Systems overlay */}
      <CyberModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
