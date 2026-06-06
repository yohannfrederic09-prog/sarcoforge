import React, { useState } from "react";
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
  UserCheck
} from "lucide-react";

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>("onboarding");
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [aiPlanText, setAiPlanText] = useState<string | null>(null);

  // Core Gamification levels state
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(350);
  const [xpNeeded, setXpNeeded] = useState(1000);
  const [showLevelUpToast, setShowLevelUpToast] = useState(false);

  // Global Workout state logs
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  // Daily dynamic macro consumption state
  const [consumedCal, setConsumedCal] = useState(1130);
  const [consumedProt, setConsumedProt] = useState(80);
  const [consumedCarb, setConsumedCarb] = useState(130);
  const [consumedLip, setConsumedLip] = useState(30);

  // Challenges array state linking progress to physical achievements
  const [challenges, setChallenges] = useState<Challenge[]>([
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
      description: "Validez au moins 3 séries d'exercices complétées dans votre journal actif.",
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
  ]);

  // Achievements array state
  const [badges, setBadges] = useState<Badge[]>([
    { id: "bdg_0", title: "Tonne d'Acier", description: "Soulever 5,000kg de tonnage cumulé sur une séance.", icon: "Flame", unlocked: false, xpValue: 150 },
    { id: "bdg_1", title: "Sorcier de la Macro", description: "Enregistrer vos premiers repas du jour dans le Nutrition Center.", icon: "Award", unlocked: true, xpValue: 100 },
    { id: "bdg_2", title: "Onboardé d'Élite", description: "Compléter le diagnostic biométrique et calibrer les métabolismes.", icon: "Check", unlocked: true, xpValue: 100 },
    { id: "bdg_3", title: "Compagnon du Coach", description: "Dialoguer avec le Coach IA SarcoForge pour briser un plateau.", icon: "Sparkles", unlocked: false, xpValue: 150 },
  ]);

  // Global ranking leaders mockup
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([
    { rank: 1, name: "Lucas 'Viking'", avatar: "LV", level: 12, xp: 12450 },
    { rank: 2, name: "Sophie Martinez", avatar: "SM", level: 8, xp: 8400 },
    { rank: 3, name: "Yohann-Athlète", avatar: "YA", level: 1, xp: 350, isCurrentUser: true },
    { rank: 4, name: "Marc Vacher", avatar: "MV", level: 4, xp: 3900 },
  ]);

  // Callback when Onboarding concludes
  const handleOnboardingComplete = (data: OnboardingData, planText: string) => {
    setOnboardingData(data);
    setAiPlanText(planText);
    setOnboardingCompleted(true);
    setActiveTab("dashboard");

    // Award initial setup XP (150XP)
    addXP(150);
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
          .sort((a, b) => b.xp - a.xp)
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

      {/* Header Bar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.35)]">
            <Dumbbell className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-md font-black tracking-wider uppercase font-mono text-white">Sarco<span className="text-blue-500">Forge</span></span>
        </div>

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
      </header>

      {/* Main workspace (Sidebar + viewport container) */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Navigation panel Sidebar */}
        <aside className="w-full md:w-64 border-r border-zinc-900 bg-[#0a0a0c] p-4 flex flex-col gap-1 shrink-0">
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
            onClick={() => onboardingCompleted ? setActiveTab("workouts") : alert("Veuillez d'abord compléter l'Onboarding IA pour déverrouiller la plateforme.")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "workouts"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={!onboardingCompleted}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Suivi d'Entraînement</span>
          </button>

          <button
            onClick={() => onboardingCompleted ? setActiveTab("coach") : alert("Veuillez d'abord compléter l'Onboarding IA pour déverrouiller la plateforme.")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "coach"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={!onboardingCompleted}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Coach IA Ultra Avancé</span>
          </button>

          <button
            onClick={() => onboardingCompleted ? setActiveTab("nutrition") : alert("Veuillez d'abord compléter l'Onboarding IA pour déverrouiller la plateforme.")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "nutrition"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={!onboardingCompleted}
          >
            <Utensils className="w-4 h-4" />
            <span>Nutrition & Tracker</span>
          </button>

          <button
            onClick={() => onboardingCompleted ? setActiveTab("analytics") : alert("Veuillez d'abord compléter l'Onboarding IA pour déverrouiller la plateforme.")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={!onboardingCompleted}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analyses & Projections</span>
          </button>

          <button
            onClick={() => onboardingCompleted ? setActiveTab("community") : alert("Veuillez d'abord compléter l'Onboarding IA pour déverrouiller la plateforme.")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "community"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={!onboardingCompleted}
          >
            <Users className="w-4 h-4" />
            <span>Club Communauté</span>
          </button>

          <button
            onClick={() => onboardingCompleted ? setActiveTab("gamification") : alert("Veuillez d'abord compléter l'Onboarding IA pour déverrouiller la plateforme.")}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "gamification"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/15"
                : "text-zinc-400 hover:text-white border border-transparent"
            } ${!onboardingCompleted ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={!onboardingCompleted}
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
                if (confirm("Réinitialiser l'application ? Tout l'historique sera effacé.")) {
                  setOnboardingCompleted(false);
                  setOnboardingData(null);
                  setActiveTab("onboarding");
                  setLevel(1);
                  setXp(350);
                }
              }}
              className="mt-auto w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-red-500 hover:bg-red-500/5 hover:text-red-400 transition-all border border-transparent"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Réinitialiser Diagnos</span>
            </button>
          )}
        </aside>

        {/* Viewport content layout */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
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
      <footer className="border-t border-zinc-950 bg-[#060608] py-5 px-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-600 font-mono mt-auto gap-3.5">
        <span>© 2026 SarcoForge AI Fitness Platform. Tous droits réservés.</span>
        <div className="flex gap-4">
          <span>SaaS Edition: Production-v1.2</span>
          <span>AWS Cluster: On-Grid</span>
          <span>Database status: Connected postgresql</span>
        </div>
      </footer>
    </div>
  );
}
