import React, { useState, useEffect, useRef } from "react";
import { EXERCISE_DATABASE, PremiumExercise } from "../data/exercises";
import { Exercise, ExerciseLog, SetRecord, WorkoutSession, OnboardingData } from "../types";
import { 
  Search, Plus, Trash2, CheckCircle2, Play, Circle, PlusCircle, HelpCircle, 
  Dumbbell, Clock, Flame, Award, ChevronDown, ChevronUp, Camera, Video, 
  Volume2, VolumeX, Activity, AlertTriangle, ShieldCheck, PlayCircle, StopCircle, 
  Loader2, ThumbsUp, Sparkles, RefreshCw, ShoppingBag, MapPin, ShieldAlert, Check,
  Zap, Home, Compass, Briefcase
} from "lucide-react";

interface WorkoutTrackerProps {
  onWorkoutCompleted: (session: WorkoutSession, xpGained: number) => void;
  onboardingData?: OnboardingData | null;
  onUpdateOnboarding?: (data: OnboardingData) => void;
}

export default function WorkoutTracker({ 
  onWorkoutCompleted, 
  onboardingData, 
  onUpdateOnboarding 
}: WorkoutTrackerProps) {
  
  // 1. Unified State synchronized with Global Onboarding on mount
  const defaultLocations = onboardingData?.trainingLocations || ["Salle de sport commerciale"];
  const defaultEquipment = onboardingData?.specificEquipment || [
    "Haltères fixes", "Bandes élastiques légères", "Tapis de sol (yoga mat)"
  ];
  const defaultSpace = onboardingData?.availableSpace || "Moyen (4-9m²)";
  const defaultConstraints = onboardingData?.constraints || [];

  const [activeLocation, setActiveLocation] = useState<string>(defaultLocations[0] || "Salle de sport commerciale");
  const [activeEquipment, setActiveEquipment] = useState<string[]>(defaultEquipment);
  const [activeSpace, setActiveSpace] = useState<string>(defaultSpace);
  const [activeConstraints, setActiveConstraints] = useState<string[]>(defaultConstraints);
  const [purchaseLog, setPurchaseLog] = useState<string[]>([]);
  const [selectedRoutineTab, setSelectedRoutineTab] = useState<"elite" | "custom">("elite");
  const [trackerNotification, setTrackerNotification] = useState<{
    text: string;
    type: "success" | "warning";
  } | null>(null);

  const showNotification = (text: string, type: "success" | "warning" = "success") => {
    setTrackerNotification({ text, type });
  };

  useEffect(() => {
    if (trackerNotification) {
      const timer = setTimeout(() => setTrackerNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [trackerNotification]);

  // Web Audio Synth Chime (no assets, ultra-performance)
  const playModernChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(0.12, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      playTone(880, ctx.currentTime, 0.15); // A5 first
      playTone(1320, ctx.currentTime + 0.08, 0.25); // E6 athletic dual-chime
    } catch (e) {
      console.warn("Audio Context beep error:", e);
    }
  };

  // Real-time interactive Rest Timer States
  const [restCountdown, setRestCountdown] = useState<number>(0);
  const [restTotal, setRestTotal] = useState<number>(0);
  const [restIsActive, setRestIsActive] = useState<boolean>(false);
  const [restExerciseName, setRestExerciseName] = useState<string>("");
  const [restIsMinimized, setRestIsMinimized] = useState<boolean>(false);
  const [shareToCommunity, setShareToCommunity] = useState<boolean>(true);

  useEffect(() => {
    let intervalId: any = null;
    if (restIsActive && restCountdown > 0) {
      intervalId = setInterval(() => {
        setRestCountdown((prev) => {
          if (prev <= 1) {
            setRestIsActive(false);
            playModernChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [restIsActive, restCountdown]);

  const startRestTimer = (seconds: number, exerciseName: string) => {
    setRestCountdown(seconds);
    setRestTotal(seconds);
    setRestIsActive(true);
    setRestExerciseName(exerciseName);
    setRestIsMinimized(false);
    showNotification(`⏱️ Récupération lancée : ${seconds}s pour ${exerciseName} !`, "success");
  };

  const adjustRestTimer = (secondsToAdd: number) => {
    setRestCountdown((prev) => {
      const newVal = Math.max(0, prev + secondsToAdd);
      if (prev === 0 && secondsToAdd > 0) {
        setRestIsActive(true);
      }
      if (newVal > restTotal) {
        setRestTotal(newVal);
      }
      return newVal;
    });
  };

  // Échauffement IA module states
  const [warmupMuscleGroup, setWarmupMuscleGroup] = useState<string>("Pectoraux");
  const [warmupDuration, setWarmupDuration] = useState<number>(8);
  const [warmupLoading, setWarmupLoading] = useState<boolean>(false);
  const [warmupResult, setWarmupResult] = useState<string | null>(null);
  const [warmupError, setWarmupError] = useState<string | null>(null);
  const [showWarmupDetail, setShowWarmupDetail] = useState<boolean>(true); // True by default so users see results immediately

  // States for 100% custom exercises forged on-the-fly
  const [customExercises, setCustomExercises] = useState<PremiumExercise[]>(() => {
    try {
      const stored = localStorage.getItem("sarcoforge_custom_exercises");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showCustomExerciseForm, setShowCustomExerciseForm] = useState(false);
  const [customExerciseForm, setCustomExerciseForm] = useState({
    name: "",
    primaryMuscle: "Pectoraux",
    difficulty: "Débutant" as "Débutant" | "Intermédiaire" | "Avancé",
    equipment: "Aucun",
    description: "",
    tips: "",
    commonMistakes: ""
  });

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExerciseForm.name.trim()) return;

    const newId = `custom_ex_${Date.now()}`;
    const newEx: PremiumExercise = {
      id: newId,
      name: customExerciseForm.name,
      description: customExerciseForm.description || "Un exercice personnalisé forgé par l'athlète.",
      difficulty: customExerciseForm.difficulty,
      primaryMuscle: customExerciseForm.primaryMuscle,
      secondaryMuscles: [],
      equipment: customExerciseForm.equipment,
      instructions: [customExerciseForm.description || "Éléments d'exécution libres."],
      tips: customExerciseForm.tips ? [customExerciseForm.tips] : ["Surchargez progressivement à chaque séance."],
      commonMistakes: customExerciseForm.commonMistakes ? [customExerciseForm.commonMistakes] : ["Manque d'amplitude."],
      isCustom: true,
      emgActivation: 92,
      riskRewardRatio: "Optimal",
      minimum_space_required: "medium",
      noise_level: "low"
    };

    const updated = [...customExercises, newEx];
    setCustomExercises(updated);
    localStorage.setItem("sarcoforge_custom_exercises", JSON.stringify(updated));

    // Reset form
    setCustomExerciseForm({
      name: "",
      primaryMuscle: "Pectoraux",
      difficulty: "Débutant",
      equipment: "Aucun",
      description: "",
      tips: "",
      commonMistakes: ""
    });
    setShowCustomExerciseForm(false);
    showNotification(`🔥 Mouvement "${newEx.name}" forgé et ajouté à la bibliothèque avec succès !`, "success");
  };

  // State for user-defined reusable workout templates
  const [customRoutines, setCustomRoutines] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("sarcoforge_custom_routines");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Combine static and custom exercises
  const mergedExercises = [...EXERCISE_DATABASE, ...customExercises];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("Tous");
  
  const [activeSession, setActiveSession] = useState<WorkoutSession>({
    id: `session_${Date.now()}`,
    name: "Entraînement Dynamique SarcoForge",
    date: new Date().toLocaleDateString("fr-FR"),
    logs: [],
    completed: false,
  });

  const [expandedExerciseTips, setExpandedExerciseTips] = useState<string | null>(null);

  // AI Vision Coach modal/view state
  const [visionCoachActive, setVisionCoachActive] = useState(false);
  const [visionExercise, setVisionExercise] = useState<PremiumExercise | null>(null);
  const [visionAnalyzing, setVisionAnalyzing] = useState(false);
  const [visionReps, setVisionReps] = useState(0);
  const [visionScore, setVisionScore] = useState(95);
  const [visionFeedback, setVisionFeedback] = useState("Placez-vous bien en face de la caméra...");
  const [visionVoiceEnabled, setVisionVoiceEnabled] = useState(true);
  const [spineAngle, setSpineAngle] = useState(178);
  const [kneeAngle, setKneeAngle] = useState(175);
  const [jointOffset, setJointOffset] = useState(0);
  const [isGoingDown, setIsGoingDown] = useState(true);

  const analysisInterval = useRef<NodeJS.Timeout | null>(null);

  // Sync state upward when local switches are changed
  useEffect(() => {
    if (onboardingData && onUpdateOnboarding) {
      onUpdateOnboarding({
        ...onboardingData,
        trainingLocations: [activeLocation],
        specificEquipment: activeEquipment,
        availableSpace: activeSpace,
        constraints: activeConstraints
      });
    }
  }, [activeLocation, activeEquipment, activeSpace, activeConstraints]);

  // Auto-detect the muscle targeted by the chosen workout session
  useEffect(() => {
    if (activeSession.logs.length > 0) {
      // Find muscles worked in active session
      const detectedMuscles = activeSession.logs.map((log) => {
        const matchingEx = EXERCISE_DATABASE.find((e) => e.id === log.exerciseId);
        return matchingEx ? matchingEx.primaryMuscle : null;
      }).filter((m): m is string => m !== null);

      if (detectedMuscles.length > 0) {
        // Pre-select the primary muscle of the first active exercise as default
        setWarmupMuscleGroup(detectedMuscles[0]);
      }
    }
  }, [activeSession.logs.length]);

  const generateAIWarmup = async () => {
    setWarmupLoading(true);
    setWarmupError(null);
    setWarmupResult(null);

    const activeExercises = activeSession.logs.map((log) => log.exerciseName);

    try {
      const response = await fetch("/api/warmup-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          muscleGroup: warmupMuscleGroup,
          durationMin: warmupDuration,
          exercises: activeExercises
        }),
      });

      if (!response.ok) {
        throw new Error("L'évaluation cinétique de l'échauffement a échoué.");
      }

      const data = await response.json();
      setWarmupResult(data.text);
      showNotification(`⚡ Échauffement Élite "${warmupMuscleGroup}" calibré ! +100 XP de Prévention Articulaire !`, "success");
    } catch (err: any) {
      console.error(err);
      setWarmupError("Le serveur d'analyse biomécanique a mis trop de temps à répondre. Veuillez réessayer ou lancer en mode local.");
    } finally {
      setWarmupLoading(false);
    }
  };

  const boldWarmupText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part));
  };

  const renderWarmupMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-xs font-bold text-blue-400 mt-4 mb-2 first:mt-0 font-sans uppercase tracking-wider">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-sm font-bold text-white mt-5 mb-2.5 first:mt-0 font-sans uppercase tracking-wider">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-base font-bold text-white mt-6 mb-3 first:mt-0 font-sans uppercase tracking-wider">{line.replace("# ", "")}</h2>;
      }
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const cleanContent = line.replace(/^\s*[\*\-]\s+/, "");
        return (
          <li key={idx} className="ml-5 list-disc text-[11.5px] text-zinc-300 leading-relaxed mb-1.5 font-sans">
            {boldWarmupText(cleanContent)}
          </li>
        );
      }
      if (/^\d+\.\s+/.test(line.trim())) {
        const cleanContent = line.replace(/^\s*\d+\.\s+/, "");
        const num = line.match(/^\s*(\d+)/)?.[0] || "1";
        return (
          <li key={idx} className="ml-5 list-decimal text-[11.5px] text-zinc-300 leading-relaxed mb-1.5 font-sans">
            <span className="font-bold text-blue-400 mr-1">{num}.</span> {boldWarmupText(cleanContent)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2.5" />;
      }
      return <p key={idx} className="text-[11.5px] text-zinc-300 leading-relaxed mb-2 font-sans">{boldWarmupText(line)}</p>;
    });
  };

  // Available muscles based on the newly expanded database
  const muscles = [
    "Tous", 
    "Pectoraux", 
    "Quadriceps", 
    "Ischio-jambiers / Fessiers", 
    "Grand Dorsal", 
    "Deltoïdes", 
    "Deltoïdes (faisceau postérieur)", 
    "Triceps", 
    "Abdominaux"
  ];

  // 2. Real-time Compatibility Scoring algorithm
  const computeCompatibility = (ex: PremiumExercise) => {
    // If location is full commercial gym, compatibility is 100%
    const isGym = activeLocation === "Salle de sport commerciale" || activeLocation === "Salle complète";
    
    // Check if equipment is owned
    const required = ex.equipment_required || [];
    const alternatives = ex.equipment_alternatives || [];
    
    if (required.length === 0 || required.includes("Aucun")) {
      return { score: 100, status: "Compatible", color: "text-green-400 bg-green-500/10 border-green-500/20" };
    }

    if (isGym) {
      return { score: 100, status: "Compatible (En Salle)", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    }

    // Check if user has all required equipment items
    const hasRequired = required.every(item => 
      activeEquipment.some(activeItem => activeItem.toLowerCase().includes(item.toLowerCase()))
    );

    if (hasRequired) {
      return { score: 100, status: "Compatible (Équipé)", color: "text-green-400 bg-green-500/10 border-green-500/20" };
    }

    // Check if user has alternative items
    const hasAlternative = alternatives.some(alt => 
      activeEquipment.some(activeItem => activeItem.toLowerCase().includes(alt.toLowerCase()))
    );

    if (hasAlternative) {
      return { score: 85, status: "Adapté (Alternative)", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }

    // If there is any alternative that could be unlocked with a budget
    if (ex.no_equipment_version) {
      return { score: 60, status: "Alternative Corps possible", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
    }

    return { score: 20, status: "Incompatible (Matériel manquant)", color: "text-red-400 bg-red-500/10 border-red-500/20" };
  };

  // Safe exercise list builder with computed scores (using merged list)
  const exercisesWithScores = mergedExercises.map(ex => {
    const premEx = ex as PremiumExercise;
    const compat = computeCompatibility(premEx);
    return {
      ...premEx,
      compatibilityScore: compat.score,
      compatibilityStatus: compat.status,
      compatibilityColor: compat.color
    };
  });

  // Filter based on input search, selected muscle and order by compatibility score descending
  const filteredExercises = exercisesWithScores.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ex.primaryMuscle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === "Tous" || ex.primaryMuscle === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Dynamic on-the-fly replacement technique for bodyweight exercises (V4.0 Part 3)
  const swapWithBodyweightVersion = (exId: string) => {
    let alternateExId = "ex_pushup_standard"; // fallback
    const originalEx = mergedExercises.find(e => e.id === exId);
    if (!originalEx) return;

    if (originalEx.primaryMuscle === "Pectoraux") {
      alternateExId = "ex_pushup_standard";
    } else if (originalEx.primaryMuscle === "Quadriceps") {
      alternateExId = "ex_bodyweight_squat";
    } else if (originalEx.primaryMuscle === "Ischio-jambiers / Fessiers") {
      alternateExId = "ex_glute_bridge";
    } else if (originalEx.primaryMuscle === "Deltoïdes") {
      alternateExId = "ex_pike_push_up";
    } else if (originalEx.primaryMuscle === "Grand Dorsal" || originalEx.primaryMuscle?.includes("Dorsal")) {
      alternateExId = "ex_table_row";
    } else if (originalEx.primaryMuscle === "Abdominaux") {
      alternateExId = "ex_plank";
    }

    const alternateEx = mergedExercises.find(e => e.id === alternateExId);
    if (!alternateEx) {
      showNotification("La variante corps libre pour cet exercice n'a pas pu être géolocalisée. Essayez de l'ajouter manuellement.", "warning");
      return;
    }

    // Replace in active workspace session
    setActiveSession((prev) => {
      const logsUpdated = prev.logs.map(log => {
        if (log.exerciseId === exId) {
          return {
            ...log,
            exerciseId: alternateEx.id,
            exerciseName: alternateEx.name,
            notes: `Auto-adapté au poids de corps de transition en remplacement de ${originalEx.name}.`
          };
        }
        return log;
      });
      return { ...prev, logs: logsUpdated };
    });

    setExpandedExerciseTips(null);
    showNotification(`🔄 "${originalEx.name}" remplacé par "${alternateEx.name}" au poids du corps d'élite ! Compatibilité de séance maximisée.`, "success");
  };

  // Simulated Pro Store equipment unlocked actions (V4.0 Part 4)
  const buyAndUnlockEquipment = (equipmentName: string, price: number) => {
    if (activeEquipment.includes(equipmentName)) return;
    
    // Add to list, reward XP bonus
    setActiveEquipment((prev) => [...prev, equipmentName]);
    setPurchaseLog((prev) => [...prev, equipmentName]);
    showNotification(`🛍️ Équipement acheté: "${equipmentName}" ! +150 XP de Progrès matériel & 8 exercices débloqués !`, "success");
  };

  const addExerciseToRoutine = (ex: Exercise) => {
    if (activeSession.logs.some((l) => l.exerciseId === ex.id)) return;

    const newLog: ExerciseLog = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: [
        {
          id: `set_${Date.now()}_0`,
          setNumber: 1,
          weight: ex.primaryMuscle === "Quadriceps" || ex.primaryMuscle === "Ischio-jambiers / Fessiers" ? 80 : 50,
          reps: 10,
          rpe: 8,
          completed: false,
        },
      ],
      tempo: "3-0-1-0",
      restTime: ex.primaryMuscle === "Pectoraux" || ex.primaryMuscle === "Quadriceps" ? 120 : 90,
      notes: "Sensation de contraction optimale",
    };

    setActiveSession((prev) => ({
      ...prev,
      logs: [...prev.logs, newLog],
    }));
  };

  const removeExerciseFromRoutine = (exerciseId: string) => {
    setActiveSession((prev) => ({
      ...prev,
      logs: prev.logs.filter((l) => l.exerciseId !== exerciseId),
    }));
  };

  const addSetToExercise = (exerciseId: string) => {
    setActiveSession((prev) => {
      const updatedLogs = prev.logs.map((log) => {
        if (log.exerciseId === exerciseId) {
          const nextSetNum = log.sets.length + 1;
          const lastSet = log.sets[log.sets.length - 1];
          const newSet: SetRecord = {
            id: `set_${Date.now()}_${log.sets.length}`,
            setNumber: nextSetNum,
            weight: lastSet ? lastSet.weight : 50,
            reps: lastSet ? lastSet.reps : 10,
            rpe: lastSet ? lastSet.rpe : 8,
            completed: false,
          };
          return {
            ...log,
            sets: [...log.sets, newSet],
          };
        }
        return log;
      });
      return { ...prev, logs: updatedLogs };
    });
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    setActiveSession((prev) => {
      const updatedLogs = prev.logs.map((log) => {
        if (log.exerciseId === exerciseId) {
          const filteredSets = log.sets.filter((s) => s.id !== setId).map((s, idx) => ({
            ...s,
            setNumber: idx + 1,
          }));
          return { ...log, sets: filteredSets };
        }
        return log;
      });
      return { ...prev, logs: updatedLogs };
    });
  };

  const updateSetRecord = (exerciseId: string, setId: string, field: keyof SetRecord, value: any) => {
    setActiveSession((prev) => {
      const updatedLogs = prev.logs.map((log) => {
        if (log.exerciseId === exerciseId) {
          const updatedSets = log.sets.map((set) => {
            if (set.id === setId) {
              if (field === "completed" && value === true && !set.completed) {
                const restSeconds = log.restTime ?? 90;
                startRestTimer(restSeconds, log.exerciseName);
              }
              return { ...set, [field]: value };
            }
            return set;
          });
          return { ...log, sets: updatedSets };
        }
        return log;
      });
      return { ...prev, logs: updatedLogs };
    });
  };

  const updateLogMeta = (exerciseId: string, field: "tempo" | "notes" | "restTime", value: any) => {
    setActiveSession((prev) => {
      const updatedLogs = prev.logs.map((log) => {
        if (log.exerciseId === exerciseId) {
          return { ...log, [field]: value };
        }
        return log;
      });
      return { ...prev, logs: updatedLogs };
    });
  };

  // Math helper of Epley 1RM Max Calculator
  const calculate1RM = (weight: number, reps: number): number => {
    if (reps <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  // Compute live cumulative totals
  let completedSetsCount = 0;
  let cumulativeTonnage = 0;
  activeSession.logs.forEach((log) => {
    log.sets.forEach((set) => {
      if (set.completed) {
        completedSetsCount++;
        cumulativeTonnage += set.weight * set.reps;
      }
    });
  });

  const handleFinishWorkout = () => {
    if (activeSession.logs.length === 0) {
      showNotification("Ajoutez au moins un exercice avant de finaliser l'entraînement !", "warning");
      return;
    }

    const finalSession: WorkoutSession = {
      ...activeSession,
      completed: true,
      duration: 45, // default duration
      totalTonnage: cumulativeTonnage,
      totalVolume: completedSetsCount,
    };

    // Calculate core XP reward: base 100 XP + bonuses
    const xpReward = 150 + Math.floor(cumulativeTonnage / 30);

    // If community sharing toggled, add to sarcoforge_shared_workouts_queue in localStorage
    if (shareToCommunity) {
      const formattedTonnage = cumulativeTonnage.toLocaleString("fr-FR");
      const postContent = `Séance complétée avec succès : "${finalSession.name}" ! J'ai bravé ${completedSetsCount} séries d'acier pour un tonnage de ${formattedTonnage} kg. La forge continue de gronder ! 🦾⚡`;
      
      const sharedPost = {
        id: `post_workout_${Date.now()}`,
        authorName: "Yohann-Athlète",
        authorAvatar: "YA",
        timeAgo: "À l'instant",
        content: postContent,
        likes: 0,
        comments: 0,
        likedByMe: false,
        tags: ["Entraînement", "Performance"],
        attachedWorkout: `${finalSession.name} &bull; ${completedSetsCount} séries validées &bull; Tonnage : ${formattedTonnage} kg`,
      };

      try {
        const queueRaw = localStorage.getItem("sarcoforge_shared_workouts_queue") || "[]";
        const queue = JSON.parse(queueRaw);
        queue.push(sharedPost);
        localStorage.setItem("sarcoforge_shared_workouts_queue", JSON.stringify(queue));
      } catch (err) {
        console.warn("Could not save shared workout to community queue:", err);
      }
    }

    onWorkoutCompleted(finalSession, xpReward);

    // Reset active session
    setActiveSession({
      id: `session_${Date.now()}`,
      name: "Nouvelle Routine SarcoForge",
      date: new Date().toLocaleDateString("fr-FR"),
      logs: [],
      completed: false,
    });
  };

  // Text-to-speech feedback using Browser Speech synthesis
  const speakFeedback = (text: string) => {
    if (!visionVoiceEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 1.05;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS Error: ", e);
    }
  };

  // Start computer vision live training simulation
  const startVisionDiagnosis = (ex: PremiumExercise) => {
    setVisionExercise(ex);
    setVisionCoachActive(true);
    setVisionAnalyzing(true);
    setVisionReps(0);
    setVisionScore(96);
    setVisionFeedback("Amorçage de la caméra 1080p... Cadrez votre profil complet.");
    setJointOffset(0);
    setIsGoingDown(true);

    setTimeout(() => {
      setVisionFeedback("Vecteurs cinématiques calibrés ! Débutez votre première répétition.");
      speakFeedback("Vecteurs calibrés. Débutez votre mouvement.");
    }, 2000);
  };

  // Repetition simulation loop logic (representing live AI analysis)
  useEffect(() => {
    if (visionAnalyzing && visionCoachActive) {
      analysisInterval.current = setInterval(() => {
        setJointOffset((prev) => {
          let nextVal = prev;
          if (isGoingDown) {
            nextVal += 5;
            if (nextVal >= 55) {
              setIsGoingDown(false);
              // Bottom of execution triggers custom cues based on the exercise
              if (visionExercise?.id === "ex_back_squat") {
                setKneeAngle(82);
                setVisionFeedback("Rupture de parallèle validée (Amplitude excellente) ! Remontez...");
                speakFeedback("Rupture de parallèle validée. Remontez.");
              } else if (visionExercise?.id === "ex_bench_press") {
                setVisionFeedback("Barre au contact sternal validé. Poussez !");
                speakFeedback("Contact sternal validé, poussez.");
              } else if (visionExercise?.id === "ex_deadlift") {
                setSpineAngle(174);
                setVisionFeedback("Tension lombaire saine. Impulsion jambes amorcée !");
              } else {
                setVisionFeedback("Portion basse atteinte. Maintenez le tempo !");
              }
              setVisionScore(Math.round(92 + Math.random() * 8));
            }
          } else {
            nextVal -= 5;
            if (nextVal <= 0) {
              setIsGoingDown(true);
              setVisionReps((r) => {
                const updatedReps = r + 1;
                // Success rep verbal triggers
                setVisionFeedback(`Répétition ${updatedReps} complète ! Surcharge progressive stable.`);
                speakFeedback(`Répétition ${updatedReps} validée.`);
                
                // Add mini RPE bonus points
                if (updatedReps === 5 && visionVoiceEnabled) {
                  setTimeout(() => {
                    setVisionFeedback("Forme athlétique parfaite. Stabilité de la colonne à de 99%.");
                    speakFeedback("Forme impeccable, conservez cette trajectoire.");
                  }, 1200);
                }
                return updatedReps;
              });
              
              if (visionExercise?.id === "ex_back_squat") {
                setKneeAngle(175);
              } else {
                setSpineAngle(179);
              }
            }
          }

          // Fluctuate spine/knees slightly to simulate raw computer vision noise
          setSpineAngle((prevSpine) => {
            const delta = Math.random() > 0.5 ? 1 : -1;
            return Math.max(172, Math.min(180, prevSpine + delta));
          });

          return nextVal;
        });
      }, 180);
    }

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, [visionAnalyzing, visionCoachActive, isGoingDown, visionExercise]);

  const stopVisionDiagnosis = () => {
    setVisionAnalyzing(false);
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
    }
    setVisionFeedback("Analyse interrompue par l'athlète.");
    speakFeedback("Analyse terminée.");
  };

  const isAppartement = activeConstraints.some(c => c.toLowerCase().includes("bruit"));

  // Elite predefined coaching routines (V4.0 Part 4)
  const ELITE_PROGRAMS = [
    {
      id: "prog_a",
      name: "Prog A : Zéro Matériel (Débutant)",
      category: "Élite Poids du Corps (Zéro Matériel)",
      frequency: "3x / semaine",
      description: "Leviers de force clinique pour s'entraîner n'importe où.",
      exercises: [
        { id: "ex_pushup_standard", sets_count: 3, base_weight: 0, base_reps: 10, tempo: "3-0-1-0", notes: "Alignement de la colonne parfait" },
        { id: "ex_diamond_push_up", sets_count: 3, base_weight: 0, base_reps: 8, tempo: "3-0-1-0", notes: "Tension triceps" },
        { id: "ex_pike_push_up", sets_count: 3, base_weight: 0, base_reps: 8, tempo: "2-0-1-0", notes: "Focalisation deltoïdes" },
        { id: "ex_plank", sets_count: 3, base_weight: 0, base_reps: 30, tempo: "DURÉE", notes: "Gainage spinal de maintien" },
        { id: "ex_bodyweight_squat", sets_count: 3, base_weight: 0, base_reps: 15, tempo: "3-1-1-0", notes: "Talons ancrés" },
        { id: "ex_glute_bridge", sets_count: 3, base_weight: 0, base_reps: 20, tempo: "2-0-1-2", notes: "Serrer fessiers en haut" }
      ]
    },
    {
      id: "prog_b",
      name: "Prog B : Zéro Matériel (Avancé)",
      category: "Calisthénics Athlétique",
      frequency: "5x / semaine",
      description: "Amplitudes explosives et denses pour repousser ses limites métaboliques.",
      exercises: [
        { id: "ex_pushup_standard", sets_count: 4, base_weight: 0, base_reps: 25, tempo: "3-0-1-0", notes: "Rythme tendineux rapide" },
        { id: "ex_diamond_push_up", sets_count: 4, base_weight: 0, base_reps: 15, tempo: "3-0-1-0", notes: "Finition triceps" },
        { id: "ex_pike_push_up", sets_count: 4, base_weight: 0, base_reps: 12, tempo: "3-0-1-0", notes: "Intensité deltoïdes" },
        { id: "ex_glute_bridge", sets_count: 4, base_weight: 0, base_reps: 25, tempo: "2-0-1-2", notes: "Travail unilatéral d'ischio" },
        { id: "ex_bodyweight_squat", sets_count: 5, base_weight: 0, base_reps: 30, tempo: "3-0-1-0", notes: "Profondeur maximale" },
        { id: "ex_burpee", sets_count: 4, base_weight: 0, base_reps: 12, tempo: "EXPLOSIF", notes: "Saut maximal" }
      ]
    },
    {
      id: "prog_c",
      name: "Prog C : Home Gym Haltères",
      category: "Hypertrophie Totale avec Poids Libres",
      frequency: "4x / semaine",
      description: "Progression linéaire d'intensity et tension mécanique accrue.",
      exercises: [
        { id: "ex_bench_press", sets_count: 4, base_weight: 20, base_reps: 10, tempo: "3-1-1-0", notes: "Couché d'épaule ou sol" },
        { id: "ex_back_squat", sets_count: 4, base_weight: 30, base_reps: 12, tempo: "3-1-1-0", notes: "Goblet avec haltère" },
        { id: "ex_deadlift", sets_count: 4, base_weight: 40, base_reps: 10, tempo: "2-1-1-0", notes: "Hinge dos plat" },
        { id: "ex_dumbbell_lateral_raise", sets_count: 3, base_weight: 8, base_reps: 15, tempo: "2-0-1-1", notes: "Tension deltoïde médian" }
      ]
    },
    {
      id: "prog_d",
      name: "Prog D : Barre de Traction Solide",
      category: "Tirage & Dos en V d'Élite",
      frequency: "3x / semaine",
      description: "Concentration ultime sur la largeur dorsale et le déblocage cinétique.",
      exercises: [
        { id: "ex_pull_up", sets_count: 4, base_weight: 0, base_reps: 8, tempo: "3-0-1-0", notes: "Traction pronation stricte" },
        { id: "ex_table_row", sets_count: 4, base_weight: 0, base_reps: 12, tempo: "2-0-1-1", notes: "En rameur sous table solide" },
        { id: "ex_plank", sets_count: 3, base_weight: 0, base_reps: 45, tempo: "DURÉE", notes: "Intégration du transverse" }
      ]
    }
  ];

  const loadPredefinedProgram = (progId: string) => {
    const prog = [...ELITE_PROGRAMS, ...customRoutines].find(p => p.id === progId);
    if (!prog) return;

    const newLogs: ExerciseLog[] = [];
    prog.exercises.forEach((progEx) => {
      const dbEx = mergedExercises.find(e => e.id === progEx.id);
      if (!dbEx) return;

      const sets: SetRecord[] = [];
      for (let i = 0; i < progEx.sets_count; i++) {
        sets.push({
          id: `set_${Date.now()}_${progEx.id}_${i}`,
          setNumber: i + 1,
          weight: progEx.base_weight,
          reps: progEx.base_reps,
          rpe: 8,
          completed: false
        });
      }

      newLogs.push({
        exerciseId: dbEx.id,
        exerciseName: dbEx.name,
        sets: sets,
        tempo: progEx.tempo,
        restTime: dbEx.primaryMuscle === "Pectoraux" || dbEx.primaryMuscle === "Quadriceps" ? 120 : 90,
        notes: progEx.notes
      });
    });

    setActiveSession({
      id: `session_${Date.now()}`,
      name: prog.category === "Routine Personnalisée" ? prog.name : `🔥 ${prog.name}`,
      date: new Date().toLocaleDateString("fr-FR"),
      logs: newLogs,
      completed: false
    });

    showNotification(`⚙️ Routine "${prog.name}" calibrée à 100% dans votre routine ! En avant athlète !`, "success");
  };

  const handleSaveAsCustomRoutine = (routineName: string) => {
    if (activeSession.logs.length === 0) {
      showNotification("Ajoutez au moins un exercice avant de sauvegarder le modèle !", "warning");
      return;
    }
    const finalName = routineName.trim() || `Routine Perso #${customRoutines.length + 1}`;
    const newRoutine = {
      id: `custom_prog_${Date.now()}`,
      name: finalName,
      category: "Routine Personnalisée",
      frequency: "Libre",
      description: `Créé sur-mesure d'après vos préférences de musculation.`,
      exercises: activeSession.logs.map(log => ({
        id: log.exerciseId,
        sets_count: log.sets.length,
        base_weight: log.sets[0]?.weight || 0,
        base_reps: log.sets[0]?.reps || 10,
        tempo: log.tempo || "3-0-1-0",
        notes: log.notes || ""
      }))
    };

    const updated = [...customRoutines, newRoutine];
    setCustomRoutines(updated);
    localStorage.setItem("sarcoforge_custom_routines", JSON.stringify(updated));
    showNotification(`✨ Le modèle de séance "${finalName}" a été sauvegardé dans vos routines !`, "success");
  };

  const handleDeleteCustomRoutine = (progId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the routine when clicking delete
    const updated = customRoutines.filter(p => p.id !== progId);
    setCustomRoutines(updated);
    localStorage.setItem("sarcoforge_custom_routines", JSON.stringify(updated));
    showNotification(`🗑️ Modèle de routine supprimé.`, "warning");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      
      {/* BONUS XP / WARNING NOTIFICATION AREA */}
      {trackerNotification && (
        <div className={`fixed bottom-6 right-6 z-50 bg-zinc-950 border-2 ${
          trackerNotification.type === "warning" ? "border-red-500/50" : "border-emerald-500/50"
        } text-white p-5 rounded-2xl flex items-center gap-3.5 shadow-2xl animate-slideDown max-w-sm transition-all duration-300`}>
          <div className={`p-2.5 rounded-xl border ${
            trackerNotification.type === "warning" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            {trackerNotification.type === "warning" ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5 animate-spin" />}
          </div>
          <div>
            <span className={`text-xs font-bold ${
              trackerNotification.type === "warning" ? "text-red-400" : "text-emerald-400"
            } uppercase tracking-widest font-mono`}>
              {trackerNotification.type === "warning" ? "Attention" : "Notification"}
            </span>
            <p className="text-[12px] text-zinc-300 leading-normal mt-0.5">{trackerNotification.text}</p>
          </div>
        </div>
      )}

      {/* AI Vision Coach Floating Viewport Overlay if Active */}
      {visionCoachActive && visionExercise && (
        <div className="fixed inset-0 bg-[#040405]/95 z-50 flex items-center justify-center p-4 backdrop-blur-xl animate-fadeIn">
          <div className="bg-[#0c0c10] border border-zinc-800 rounded-3xl w-full max-w-4xl p-6 relative flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
            
            <button 
              onClick={() => {
                stopVisionDiagnosis();
                setVisionCoachActive(false);
              }}
              className="absolute top-4 right-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs transition-all cursor-pointer"
            >
              Fermer la Vision IA
            </button>

            <div className="flex flex-col lg:flex-row gap-6 mt-4">
              <div className="flex-1 space-y-4">
                <div className="bg-zinc-950 rounded-2xl border border-zinc-800 aspect-video relative overflow-hidden flex items-center justify-center shadow-inner">
                  {visionAnalyzing && (
                    <div className="absolute inset-x-0 h-[2px] bg-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scanLine pointer-events-none"></div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80">
                      <rect x="50" y="40" width="300" height="220" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5 5" className="opacity-25" />
                      <circle cx="200" cy={`${80 + jointOffset * 0.4}`} r="6" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" className="animate-pulse" />
                      <circle cx="200" cy={`${110 + jointOffset * 0.5}`} r="8" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                      <circle cx="160" cy={`${135 + jointOffset * 0.8}`} r="7" fill="#60a5fa" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="200" cy={`${180 + jointOffset * 0.2}`} r="8" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                      <circle cx={`${220 + jointOffset * 0.3}`} cy={`${210 + jointOffset * 0.9}`} r="8" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                      <circle cx="220" cy="260" r="8" fill="#1d4ed8" stroke="#fff" strokeWidth="2" />

                      <line x1="200" y1={`${80 + jointOffset * 0.4}`} x2="200" y2={`${110 + jointOffset * 0.5}`} stroke="#60a5fa" strokeWidth="3" />
                      <line x1="200" y1={`${110 + jointOffset * 0.5}`} x2="160" y2={`${135 + jointOffset * 0.8}`} stroke="#3b82f6" strokeWidth="3" />
                      <line x1="200" y1={`${110 + jointOffset * 0.5}`} x2="200" y2={`${180 + jointOffset * 0.2}`} stroke="#60a5fa" strokeWidth="3" />
                      <line x1="200" y1={`${180 + jointOffset * 0.2}`} x2={`${220 + jointOffset * 0.3}`} y2={`${210 + jointOffset * 0.9}`} stroke="#3b82f6" strokeWidth="3.5" strokeDasharray="1 1" />
                      <line x1={`${220 + jointOffset * 0.3}`} y1={`${210 + jointOffset * 0.9}`} x2="220" y2="260" stroke="#3b82f6" strokeWidth="3.5" />

                      <path d="M 20,20 L 50,20 M 20,20 L 20,50" stroke="#fff" strokeWidth="2" fill="none" className="opacity-45" />
                      <path d="M 380,20 L 350,20 M 380,20 L 380,50" stroke="#fff" strokeWidth="2" fill="none" className="opacity-45" />
                      <path d="M 20,280 L 50,280 M 20,280 L 20,250" stroke="#fff" strokeWidth="2" fill="none" className="opacity-45" />
                      <path d="M 380,280 L 350,280 M 380,280 L 380,250" stroke="#fff" strokeWidth="2" fill="none" className="opacity-45" />
                    </svg>
                  </div>

                  <div className="absolute top-4 left-4 bg-black/60 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-white uppercase tracking-wider">MOCK CAMERA STREAM - ACTIVE</span>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl flex flex-wrap gap-4 text-[10px] font-mono text-zinc-400">
                    <div>
                      <span className="block text-zinc-500 font-black">SPINE ANGLE</span>
                      <strong className="text-white text-xs">{spineAngle}°</strong>
                    </div>
                    <div>
                      <span className="block text-zinc-500 font-black">KNEE ANGLE</span>
                      <strong className="text-white text-xs">{kneeAngle}°</strong>
                    </div>
                    <div>
                      <span className="block text-zinc-500 font-black">REPETITIONS</span>
                      <strong className="text-blue-400 text-xs">{visionReps} / 10</strong>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-blue-900/40 border border-blue-500/25 px-3 py-1.5 rounded-xl text-[10px] font-mono text-blue-300">
                    Target: {visionExercise.primaryMuscle}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className={`w-5 h-5 ${visionAnalyzing ? "text-blue-400 animate-pulse" : "text-zinc-500"}`} />
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Audio & Coach Message</span>
                      <p className="text-sm font-bold text-white leading-tight">{visionFeedback}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setVisionVoiceEnabled(!visionVoiceEnabled);
                      speakFeedback("Option vocale recalculée.");
                    }}
                    className={`p-2.5 rounded-xl transition-all border ${
                      visionVoiceEnabled 
                        ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    {visionVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Calibrages Scientifiques</h4>
                  <div className="space-y-3 font-mono text-xs text-zinc-400">
                    <div className="flex justify-between pb-1.5 border-b border-zinc-800/60">
                      <span>Recrutement EMG :</span>
                      <span className="text-white font-bold">{visionExercise.emgActivation}%</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-zinc-800/60">
                      <span>Bruit Emission :</span>
                      <span className="text-pink-400 font-bold">{visionExercise.noise_level}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-zinc-800/60">
                      <span>Espace requis :</span>
                      <span className="text-white font-bold">{visionExercise.minimum_space_required}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ratio Risque/Bénéfice :</span>
                      <span className="text-emerald-400 font-bold">{visionExercise.riskRewardRatio}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">SCORE TECHNIQUE</span>
                  <div className="inline-flex items-center justify-center p-3.5 bg-zinc-950 border border-zinc-800 rounded-full w-20 h-20 mt-2">
                    <div>
                      <span className="text-xl font-black font-mono text-emerald-400">{visionScore}</span>
                      <span className="text-[9px] text-zinc-500 block">/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-zinc-800/80 mt-6 justify-between items-center bg-[#0a0a0d] p-4.5 rounded-2xl">
              <button
                onClick={() => {
                  if (visionAnalyzing) stopVisionDiagnosis();
                  else setVisionAnalyzing(true);
                }}
                className={`px-5 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                  visionAnalyzing ? "bg-red-600 border-red-500 text-white" : "bg-blue-600 border-blue-500 text-white"
                }`}
              >
                {visionAnalyzing ? <StopCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                {visionAnalyzing ? "Interrompre l'Analyse" : "Relancer l'Analyse"}
              </button>
              <span className="text-[10px] text-zinc-500 font-mono text-right max-w-xs block">
                La vision computationnelle SarcoForge assure une exécution de force d'élite de calibre clinique et prévient 100% des blessures.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Exercises Selector Panel */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* ELITE ROUTINES BANNER PANEL (V4.0 Part 4) */}
        <div className="bg-gradient-to-b from-blue-950/20 to-zinc-950/80 border border-zinc-800 p-5 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase block tracking-wider">Planification</span>
                <h3 className="text-xs font-black text-white uppercase mt-0.5">Mes Routines & Programmes</h3>
              </div>
            </div>
            
            {/* Tab Swapper */}
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedRoutineTab("elite")}
                className={`text-[9px] uppercase font-mono px-2 py-1 rounded font-bold transition-all ${
                  selectedRoutineTab !== "custom" ? "bg-zinc-855 text-white bg-zinc-800" : "text-zinc-550 hover:text-zinc-350"
                }`}
              >
                Élite
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoutineTab("custom")}
                className={`text-[9px] uppercase font-mono px-2 py-1 rounded font-bold transition-all ${
                  selectedRoutineTab === "custom" ? "bg-zinc-855 text-white bg-zinc-800" : "text-zinc-550 hover:text-zinc-350"
                }`}
              >
                Forgées ({customRoutines.length})
              </button>
            </div>
          </div>
          
          <p className="text-[10px] text-zinc-400 leading-normal font-sans">
            {selectedRoutineTab === "custom" 
              ? "Accédez ou supprimez vos routines sur-mesure enregistrées à la Forge." 
              : "Sélectionnez l'une de nos configurations d'entraînement cultes d'athlète. Les volumes se configurent de manière adaptative."}
          </p>

          <div className="grid grid-cols-1 gap-2.5 pt-1.5 max-h-[300px] overflow-y-auto pr-1">
            {selectedRoutineTab === "custom" ? (
              customRoutines.length === 0 ? (
                <div className="text-center py-6 text-zinc-650 font-mono text-[10px] border border-dashed border-zinc-850 rounded-2xl">
                  Aucun modèle personnalisé.<br/>Sauvegardez votre séance active avec le bouton "Sauver en Modèle" à droite !
                </div>
              ) : (
                customRoutines.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => loadPredefinedProgram(prog.id)}
                    className="group w-full text-left bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 hover:border-blue-500/40 p-3 rounded-2xl transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <span className="text-[10.5px] font-bold text-white group-hover:text-blue-400 transition-colors block">{prog.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{prog.exercises.length} exercices &bull; {prog.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleDeleteCustomRoutine(prog.id, e)}
                          className="p-1 rounded bg-red-950/20 text-red-400 hover:bg-red-950 border border-red-900/30 hover:border-red-900/60 transition-all cursor-pointer"
                          title="Supprimer la routine"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="text-[8.5px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-1.5 py-0.5 rounded font-mono shrink-0 uppercase tracking-wider">Charger</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              ELITE_PROGRAMS.map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => loadPredefinedProgram(prog.id)}
                  className="group w-full text-left bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 hover:border-blue-500/40 p-3 rounded-2xl transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <span className="text-[10.5px] font-bold text-white group-hover:text-blue-400 transition-colors block">{prog.name}</span>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{prog.category} &bull; {prog.frequency}</span>
                    </div>
                    <span className="text-[8.5px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-1.5 py-0.5 rounded font-mono shrink-0 uppercase tracking-wider">Charger</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-normal mt-1.5 group-hover:text-zinc-300 font-sans">{prog.description}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* PHYSICAL ZONE CONTROL SIDEBAR (V4.0 Part 3 on-the-fly customization) */}   {/* PHYSICAL ZONE CONTROL SIDEBAR (V4.0 Part 3 on-the-fly customization) */}
        <div className="bg-zinc-950/70 border border-zinc-850 p-5 rounded-3xl space-y-4 backdrop-blur-md">
          <div className="border-b border-zinc-850 pb-2 flex justify-between items-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Ajustements Logistiques Instantanés</span>
            <span className="bg-blue-500/10 text-blue-400 font-mono text-[9px] px-2 py-0.5 rounded border border-blue-500/15">Hybride</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Lieu Actif</label>
              <select
                value={activeLocation}
                onChange={(e) => setActiveLocation(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-[11px] py-1.5 px-2 rounded-lg focus:outline-none focus:border-blue-500 font-sans"
              >
                <option value="Salle complète">Salle de sport complète</option>
                <option value="Home Gym">Home Gym</option>
                <option value="Extérieur / Parc">Extérieur / Parc</option>
                <option value="Hôtel / Voyage">Hôtel / Voyage</option>
                <option value="Bureau / Travail">Bureau / Travail</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Espace Dispo</label>
              <select
                value={activeSpace}
                onChange={(e) => setActiveSpace(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-[11px] py-1.5 px-2 rounded-lg focus:outline-none focus:border-blue-500 font-sans"
              >
                <option value="Très petit (moins de 2m²)">Très petit (&lt;2m²)</option>
                <option value="Petit (2-4m²)">Petit (2-4m²)</option>
                <option value="Moyen (4-9m²)">Moyen (4-9m²)</option>
                <option value="Grand (9m²+)外部">Grand (9m²+ / Ext)</option>
              </select>
            </div>
          </div>

          <div>
            <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Options Équipement & Domicile</span>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
              {[
                "Haltères fixes", "Haltères réglables", "Kettlebell", "Barre de tractions", 
                "TRX / Sangles", "Bandes élastiques légères", "Bandes élastiques lourdes", 
                "Banc réglable", "Tapis de sol (yoga mat)", "Corde à sauter"
              ].map((eq) => {
                const hasItem = activeEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => {
                      if (hasItem) {
                        setActiveEquipment((prev) => prev.filter(x => x !== eq));
                      } else {
                        setActiveEquipment((prev) => [...prev, eq]);
                      }
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      hasItem 
                        ? "bg-blue-600/10 text-blue-400 border-blue-500/40" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {eq} {hasItem ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Noise limits toggle switches */}
          <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-pink-400" />
              <div>
                <span className="text-[11px] font-bold text-white block">Appartement / Voisins sensibles</span>
                <span className="text-[9px] text-zinc-500 block">Filtre et alerte en cas de bruits élevés</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAppartement}
              onChange={(e) => {
                if (e.target.checked) {
                  setActiveConstraints((prev) => [...prev, "Bruit limité (Voisins / Appartement)"]);
                } else {
                  setActiveConstraints((prev) => prev.filter(x => !x.includes("Bruit")));
                }
              }}
              className="rounded accent-pink-500 border-zinc-800 bg-zinc-950 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* LIBRARY PANEL */}
        <div className="bg-zinc-950/40 rounded-3xl border border-zinc-800 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bibliothèque Sportive</h3>
            </div>
            <button
              onClick={() => setShowCustomExerciseForm(!showCustomExerciseForm)}
              className="text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              {showCustomExerciseForm ? "Fermer ×" : "+ Forger Mouvement"}
            </button>
          </div>

          {showCustomExerciseForm && (
            <form onSubmit={handleCreateCustomExercise} className="mb-5 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-3 animate-fadeIn">
              <span className="text-[10px] font-mono text-blue-400 font-bold block uppercase tracking-wider">🛠️ Forger un nouvel exercice</span>
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-400 uppercase block">Nom du mouvement</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leg Press Incliné, Tirage Poulie haute..."
                  value={customExerciseForm.name}
                  onChange={(e) => setCustomExerciseForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block">Muscle Principal</label>
                  <select
                    value={customExerciseForm.primaryMuscle}
                    onChange={(e) => setCustomExerciseForm(prev => ({ ...prev, primaryMuscle: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl py-2 px-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pectoraux">Pectoraux</option>
                    <option value="Quadriceps">Quadriceps</option>
                    <option value="Ischio-jambiers / Fessiers">Ischio-jambiers / Fessiers</option>
                    <option value="Grand Dorsal">Grand Dorsal</option>
                    <option value="Deltoïdes">Deltoïdes</option>
                    <option value="Triceps">Triceps</option>
                    <option value="Abdominaux">Abdominaux</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block">Difficulté</label>
                  <select
                    value={customExerciseForm.difficulty}
                    onChange={(e) => setCustomExerciseForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl py-2 px-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block">Équipement requis</label>
                  <input
                    type="text"
                    placeholder="Ex: Aucun, Haltères, Élastique..."
                    value={customExerciseForm.equipment}
                    onChange={(e) => setCustomExerciseForm(prev => ({ ...prev, equipment: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block">Description / Note</label>
                  <input
                    type="text"
                    placeholder="Ex: Isolation des quads..."
                    value={customExerciseForm.description}
                    onChange={(e) => setCustomExerciseForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono pt-1">
                <div className="space-y-1">
                  <label className="text-zinc-500 uppercase block">Conseil Pro</label>
                  <input
                    type="text"
                    placeholder="Garder le buste droit..."
                    value={customExerciseForm.tips}
                    onChange={(e) => setCustomExerciseForm(prev => ({ ...prev, tips: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded-xl py-1.5 px-2 px-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 uppercase block">Erreur Commune</label>
                  <input
                    type="text"
                    placeholder="Arrondir le bas du dos..."
                    value={customExerciseForm.commonMistakes}
                    onChange={(e) => setCustomExerciseForm(prev => ({ ...prev, commonMistakes: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded-xl py-1.5 px-2 px-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] block text-center cursor-pointer mt-1"
              >
                Intégrer le mouvement au catalogue
              </button>
            </form>
          )}

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Rechercher un exercice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-blue-500 font-sans"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-4 scrollbar-none border-b border-zinc-850/60">
            {muscles.map((muscle) => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscleFilter(muscle)}
                className={`text-[10px] px-2.5 py-1.5 rounded-full shrink-0 border transition-all ${
                  selectedMuscleFilter === muscle
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {muscle === "Tous" ? "Tous" : muscle}
              </button>
            ))}
          </div>

          {/* Exercise item render items list */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {filteredExercises.map((ex) => {
              const isCompatible = ex.compatibilityScore >= 80;
              return (
                <div
                  key={ex.id}
                  className="group bg-zinc-900/40 hover:bg-zinc-900/80 rounded-2xl border border-zinc-850/80 p-3.5 transition-all flex flex-col gap-2 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${ex.compatibilityColor}`}>
                          {ex.compatibilityScore}% {ex.compatibilityStatus}
                        </span>
                        
                        {isAppartement && ex.noise_level?.toLowerCase() === "élevé" && (
                          <span className="text-[9px] font-mono bg-red-950/30 text-red-400 border border-red-900/35 px-1.5 py-0.5 rounded">
                            ⚠️ Bruit Élastique (Bruit Léger) optimal pour Appartement (Étape 7)
                          </span>
                        )}

                        {ex.no_equipment_version && ex.compatibilityScore < 85 && (
                          <span className="text-[9px] font-mono bg-purple-950/20 text-purple-400 px-1 py-0.5 rounded border border-purple-900/20">
                            Poids de corps possible
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white mt-1.5 group-hover:text-blue-400 transition-colors uppercase tracking-wide">{ex.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-500 leading-tight mt-0.5 block">
                        {ex.primaryMuscle}
                        {((activeLocation === "Chez moi" || activeLocation === "Petite salle de sport") && ex.equipment_required && ex.equipment_required.length > 0) ? (
                          <> &bull; Matos requis: {ex.equipment_required.join(", ")}</>
                        ) : null}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addExerciseToRoutine(ex)}
                      className="bg-blue-600/90 hover:bg-blue-500 text-white p-1 rounded-lg transition-transform hover:scale-105"
                      title="Ajouter au workout"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bodyweight fallback button logic (V4.0 Part 3) */}
                  {ex.compatibilityScore < 85 && ex.no_equipment_version && (
                    <div className="mt-1 flex items-center justify-between bg-purple-950/5 p-2 rounded-xl border border-purple-900/10">
                      <span className="text-[9px] text-purple-300 font-mono">Possibilité de substitution</span>
                      <button
                        type="button"
                        onClick={() => swapWithBodyweightVersion(ex.id)}
                        className="text-[9px] font-bold bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-500/20 transition-all cursor-pointer"
                      >
                        🔄 Passer au poids de corps d'élite
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedExerciseTips(expandedExerciseTips === ex.id ? null : ex.id)}
                    className="text-left text-[9px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mt-1 font-bold"
                  >
                    <span>Fiche technique scientifique</span>
                    {expandedExerciseTips === ex.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {expandedExerciseTips === ex.id && (
                    <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 mt-1 space-y-2">
                      <p className="text-zinc-500 leading-normal">{ex.description}</p>
                      
                      <div className="space-y-1">
                        <span className="font-bold text-white block">Alternatives acceptées :</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {ex.equipment_alternatives?.map((alt, id) => (
                            <span key={id} className="bg-zinc-900 text-zinc-400 font-mono rounded px-1.5 py-0.5 border border-zinc-800">{alt}</span>
                          )) || "Aucun"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 font-mono text-[9px]">
                        <div>
                          <span className="font-bold text-blue-400 block uppercase">CONSEIL PRO</span>
                          <span className="text-zinc-500 mt-0.5 block leading-relaxed">{ex.tips[0]}</span>
                        </div>
                        <div>
                          <span className="font-bold text-red-400 block uppercase">ERREUR COMMUNE</span>
                          <span className="text-zinc-500 mt-0.5 block leading-relaxed">{ex.commonMistakes[0]}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. PRO INVESTMENT EQUIPMENT SHOPPING CART (V4.0 Part 4) */}
        <div className="bg-gradient-to-br from-zinc-950/50 via-zinc-950/70 to-zinc-950/40 border border-zinc-800 p-5 rounded-3xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-2xl pointer-events-none rounded-full"></div>
          
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">Achat Recommandé Intelligent (ROI)</span>
              <h4 className="text-xs font-black text-white uppercase mt-0.5">Maximisez vos Équipements</h4>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-normal mb-4 font-sans">
            Gagnez du muscle à moindres frais ! Investissez intelligemment pour débloquer de nouveaux parcours d'exercices à domicile.
          </p>

          <div className="space-y-3">
            {[
              {
                name: "Bandes élastiques premium",
                price: 29,
                exercisesCount: 8,
                benefit: "Permet les tirages horizontaux et le travail unilatéral d'isolation dos/épaules.",
                color: "border-blue-500/20 text-blue-400 bg-blue-950/10"
              },
              {
                name: "Haltères réglables 2-32kg",
                price: 199,
                exercisesCount: 15,
                benefit: "Remplace 16 paires d'haltères standard pour surcharger progressivement à vie.",
                color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/10"
              }
            ].map((prod) => {
              const alreadyOwned = activeEquipment.includes(prod.name);
              return (
                <div 
                  key={prod.name} 
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    alreadyOwned 
                      ? "bg-zinc-900/40 border-zinc-800 opacity-60" 
                      : "bg-zinc-950 border-zinc-850"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-white block">{prod.name}</span>
                      <span className="text-[9px] text-emerald-400 font-mono block mt-0.5 font-bold">{prod.price}€ TTC &bull; Unlocks +{prod.exercisesCount} exercices</span>
                    </div>
                    {alreadyOwned ? (
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> Acquis
                      </span>
                    ) : (
                      <button
                        onClick={() => buyAndUnlockEquipment(prod.name, prod.price)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-[10px] px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-103"
                      >
                        Acheter (PRO Sim)
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 font-sans">{prod.benefit}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Routine Tracker Form */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* V6.0 RAPID LOCATION SWITCHER & EQUIPMENT REFINEMENT */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 p-5 rounded-3xl space-y-4 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block">Ajustement Géolocalisé Instantané</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5 font-sans">Tu t'entraînes où aujourd'hui ?</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Adapte instantanément la séance</span>
          </div>

          {/* 4 smart locations list */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { id: "Salle de sport commerciale", label: "Salle commerciale", icon: <Dumbbell className="w-3.5 h-3.5" /> },
              { id: "Petite salle de sport", label: "Petite salle", icon: <Dumbbell className="w-3.5 h-3.5 text-indigo-400" /> },
              { id: "Chez moi", label: "Chez moi", icon: <Home className="w-3.5 h-3.5" /> },
              { id: "Dehors / Parc", label: "Dehors / Parc", icon: <Compass className="w-3.5 h-3.5" /> },
            ].map((loc) => {
              const isSelected = activeLocation === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    setActiveLocation(loc.id);
                    // Generate minor feedback toast
                    showNotification(`📍 Lieu d'entraînement mis à jour : "${loc.id}" ! Programme et compatibilités ajustés.`, "success");
                  }}
                  className={`py-2.5 px-3 rounded-2xl border text-left text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? "bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)] glow-md" 
                      : "bg-zinc-900/40 border-zinc-850 hover:border-zinc-800 text-zinc-400"
                  }`}
                >
                  {loc.icon}
                  <span className="font-semibold">{loc.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Post-Selection Equipment Checklist for Chez moi and Petite salle de sport */}
          {(activeLocation === "Chez moi" || activeLocation === "Petite salle de sport") && (
            <div className="bg-zinc-900/40 border border-zinc-850/60 p-4 rounded-2xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tu as du matériel à disposition ?</h4>
                  <p className="text-[10px] text-zinc-500">Sélectionne tes équipements disponibles pour adapter tes mouvements :</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 font-sans">
                {[
                  { label: "Haltères", value: "Haltères fixes", synonyms: ["Haltères fixes", "Haltères réglables"] },
                  { label: "Barre de traction", value: "Barre de tractions", synonyms: ["Barre de tractions"] },
                  { label: "Bandes élastiques", value: "Bandes élastiques légères", synonyms: ["Bandes élastiques légères", "Bandes élastiques lourdes"] },
                  { label: "Kettlebells", value: "Kettlebell", synonyms: ["Kettlebell"] },
                ].map((item) => {
                  const hasEquip = activeEquipment.includes(item.value);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (hasEquip) {
                          // Remove all synonyms
                          setActiveEquipment((prev) => prev.filter((eq) => !item.synonyms.includes(eq)));
                          showNotification(`⚙️ Matériel désactivé : "${item.label}".`, "warning");
                        } else {
                          // Add all synonyms
                          setActiveEquipment((prev) => [...prev, ...item.synonyms]);
                          showNotification(`💪 Matériel activé : "${item.label}" + exercices débloqués !`, "success");
                        }
                      }}
                      className={`text-[11px] px-3.5 py-2 rounded-full border transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                        hasEquip 
                          ? "bg-green-600/15 text-green-400 border-green-500/40" 
                          : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-400"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span>{hasEquip ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ÉCHAUFFEMENT IA (MOBILITY ENGINE) MODULE */}
        {(() => {
          const detectedMuscles = Array.from(new Set(activeSession.logs.map((log) => {
            const matchingEx = EXERCISE_DATABASE.find((e) => e.id === log.exerciseId);
            return matchingEx ? matchingEx.primaryMuscle : null;
          }).filter((m): m is string => m !== null)));

          return (
            <div id="ai-warmup-module" className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Préparation Articulaire & Mobilité</span>
                    <h3 className="text-sm font-black text-white uppercase mt-0.5">Échauffement IA Spécifique</h3>
                  </div>
                </div>
                
                {warmupResult && (
                  <button
                    type="button"
                    onClick={() => setShowWarmupDetail(!showWarmupDetail)}
                    className="text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    {showWarmupDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {showWarmupDetail ? "Masquer" : "Afficher"}
                  </button>
                )}
              </div>

              <p className="text-[11.5px] text-zinc-400 leading-normal">
                Générez dynamiquement un protocole d'échauffement myofascial, de mobilité active et d'activation nerveuse sur-mesure d'élite ciblé sur vos groupes musculaires du jour.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
                {/* Muscle Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Groupe Musculaire Cible</label>
                  <div className="relative">
                    <select
                      value={warmupMuscleGroup}
                      onChange={(e) => setWarmupMuscleGroup(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-805 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-sans appearance-none cursor-pointer"
                    >
                      {["Pectoraux", "Quadriceps", "Ischio-jambiers / Fessiers", "Grand Dorsal", "Deltoïdes", "Triceps", "Abdominaux"].map((muscle) => (
                        <option key={muscle} value={muscle}>
                          {muscle}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  {/* Info text if auto-detected */}
                  {detectedMuscles.length > 0 && detectedMuscles.includes(warmupMuscleGroup) ? (
                    <span className="text-[9.5px] font-semibold text-emerald-400/90 flex items-center gap-1 mt-1 font-sans">
                      ✓ Auto-détecté d'après votre séance active
                    </span>
                  ) : detectedMuscles.length > 0 ? (
                    <span className="text-[9.5px] text-zinc-500 flex items-center gap-1 mt-1 font-sans">
                      Séance repérée : {detectedMuscles.join(", ")}
                    </span>
                  ) : (
                    <span className="text-[9.5px] text-zinc-500 flex items-center gap-1 mt-1 font-sans">
                      Sélectionnez pour modeler l'échauffement
                    </span>
                  )}
                </div>

                {/* Duration Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Durée de l'Échauffement</label>
                  <div className="relative">
                    <select
                      value={warmupDuration}
                      onChange={(e) => setWarmupDuration(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-805 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-sans appearance-none cursor-pointer"
                    >
                      {[5, 8, 10, 12, 15].map((duration) => (
                        <option key={duration} value={duration}>
                          ⏱️ {duration} minutes ({duration < 8 ? "Rapide" : duration > 10 ? "Complet" : "Standard"})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={generateAIWarmup}
                  disabled={warmupLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.008] duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
                >
                  {warmupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Conception biomécanique en cours...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
                      <span>Générer l'Échauffement IA pour {warmupMuscleGroup}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Warmup output result block */}
              {warmupLoading && (
                <div className="border border-zinc-800 bg-zinc-950/40 p-6 rounded-2xl animate-pulse space-y-3.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block animate-pulse">Calcul de la synergie cinétique...</span>
                  </div>
                  <div className="h-2 bg-zinc-850 rounded w-3/4"></div>
                  <div className="h-2 bg-zinc-850 rounded w-5/6"></div>
                  <div className="h-2 bg-zinc-850 rounded w-2/3"></div>
                </div>
              )}

              {warmupError && (
                <div className="bg-red-500/10 border border-red-500/25 p-3.5 rounded-xl text-xs text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
                  <span>{warmupError}</span>
                </div>
              )}

              {warmupResult && showWarmupDetail && !warmupLoading && (
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4.5 text-zinc-350 max-h-[480px] overflow-y-auto space-y-1 backdrop-blur-sm animate-fadeIn relative text-left">
                  <div className="sticky top-0 right-0 float-right z-10">
                    <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">Plan Élite</span>
                  </div>
                  <div className="leading-relaxed text-zinc-300 select-text font-sans">
                    {renderWarmupMarkdown(warmupResult)}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Workout session header */}
        <div className="bg-zinc-950/40 rounded-3xl border border-zinc-800 p-5 flex flex-col justify-between gap-4 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <input
                type="text"
                value={activeSession.name}
                onChange={(e) => setActiveSession((prev) => ({ ...prev, name: e.target.value }))}
                className="text-lg font-bold text-white bg-transparent border-b border-transparent focus:border-zinc-700 focus:outline-none hover:border-zinc-800 w-full md:w-96 text-ellipsis font-sans uppercase tracking-tight"
                title="Renommer la séance"
              />
              <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 text-blue-400 font-bold uppercase"><Clock className="w-3.5 h-3.5" /> Séance :</span>
                
                <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 uppercase">Date:</span>
                  <input
                    type="text"
                    value={activeSession.date}
                    onChange={(e) => setActiveSession((prev) => ({ ...prev, date: e.target.value }))}
                    className="bg-transparent text-white w-20 text-center font-mono focus:outline-none focus:text-blue-400"
                  />
                </div>

                <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 uppercase">Durée:</span>
                  <input
                    type="number"
                    value={activeSession.duration || 45}
                    onChange={(e) => setActiveSession((prev) => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
                    className="bg-transparent text-white w-10 text-center font-mono focus:outline-none focus:text-blue-400"
                  />
                  <span className="text-[9.5px] text-zinc-500">m</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <div className="bg-zinc-900 border border-zinc-805 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">VOLUME FÉLIX</span>
                <span className="text-xs font-bold text-white font-mono flex items-center justify-center gap-1 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {completedSetsCount} séries</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-805 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">TONNAGE</span>
                <span className="text-xs font-bold text-blue-400 font-mono flex items-center justify-center gap-1 mt-0.5"><Flame className="w-3.5 h-3.5 text-amber-500" /> {cumulativeTonnage.toLocaleString("fr-FR")} kg</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-900 mt-2.5">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Enregistreur de routine :</span>
            <input
              type="text"
              id="custom-routine-name-input"
              placeholder="Nom du modèle (ex: Pectoraux Intensité)..."
              className="bg-zinc-900 border border-zinc-800 text-[10.5px] text-white rounded-lg px-2.5 py-1 w-60 focus:outline-none focus:border-blue-500 font-sans"
            />
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("custom-routine-name-input") as HTMLInputElement;
                handleSaveAsCustomRoutine(el?.value || "");
                if (el) el.value = "";
              }}
              className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer"
            >
              💾 Sauver en Modèle
            </button>
          </div>
        </div>

        {/* Routine Exercises Logs List */}
        <div className="space-y-5">
          {activeSession.logs.map((log) => {
            const correspondingEx = EXERCISE_DATABASE.find(e => e.id === log.exerciseId);
            return (
              <div
                key={log.exerciseId}
                className="bg-zinc-950/65 border border-zinc-800 rounded-3xl p-5 shadow-lg relative overflow-hidden"
              >
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-zinc-800 pb-3.5 mb-4 font-sans">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                      {log.exerciseName}
                    </h4>
                    <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">Chrono repos: {log.restTime}s &bull; Tempo: {log.tempo}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 ml-auto">
                    {/* Launch AI Vision Button */}
                    {correspondingEx && (
                      <button
                        type="button"
                        onClick={() => startVisionDiagnosis(correspondingEx)}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 border border-blue-500/15 duration-100 transition-all cursor-pointer shadow-sm shadow-blue-500/5 animate-pulse"
                      >
                        <Camera className="w-4.5 h-4.5 text-blue-400" />
                        <span>IA Vision Forme</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeExerciseFromRoutine(log.exerciseId)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Set log Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono text-zinc-300">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 w-12 text-center font-bold">N°</th>
                        <th className="py-2.5">Charge (kg)</th>
                        <th className="py-2.5">Répétitions</th>
                        <th className="py-2.5 w-20">RPE (1-10)</th>
                        <th className="py-2.5">1RM Estimé</th>
                        <th className="py-2.5 w-16 text-center">Validé</th>
                        <th className="py-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {log.sets.map((set) => (
                        <tr
                          key={set.id}
                          className={`border-b border-zinc-900/50 hover:bg-zinc-900/20 transition-all ${
                            set.completed ? "bg-green-500/5 text-green-300 pointer-events-none" : ""
                          }`}
                        >
                          <td className="py-2 font-bold text-center text-zinc-400">{set.setNumber}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) => updateSetRecord(log.exerciseId, set.id, "weight", parseFloat(e.target.value) || 0)}
                              className="bg-zinc-900 border border-zinc-800 text-white rounded px-2 py-1 w-14 text-center"
                              disabled={set.completed}
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => updateSetRecord(log.exerciseId, set.id, "reps", parseInt(e.target.value) || 0)}
                              className="bg-zinc-900 border border-zinc-800 text-white rounded px-2 py-1 w-12 text-center"
                              disabled={set.completed}
                            />
                          </td>
                          <td className="py-2">
                            <select
                              value={set.rpe}
                              onChange={(e) => updateSetRecord(log.exerciseId, set.id, "rpe", parseInt(e.target.value) || 1)}
                              className="bg-zinc-900 border border-zinc-800 text-white rounded px-1 py-1 w-14 text-center focus:outline-none"
                              disabled={set.completed}
                            >
                              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 font-black text-white">
                            {calculate1RM(set.weight, set.reps)} kg
                          </td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                updateSetRecord(log.exerciseId, set.id, "completed", !set.completed);
                              }}
                              className="focus:outline-none cursor-pointer"
                            >
                              {set.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                              ) : (
                                <Circle className="w-5 h-5 text-zinc-650 hover:text-blue-500 mx-auto" />
                              )}
                            </button>
                          </td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeSetFromExercise(log.exerciseId, set.id)}
                              className="text-zinc-600 hover:text-red-400 disabled:opacity-40"
                              disabled={set.completed}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-3.5 pt-3 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => addSetToExercise(log.exerciseId)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all pointer-events-auto cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-blue-400" /> Ajouter Série
                  </button>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Tempo (ex: 3-0-1-0)"
                      value={log.tempo}
                      onChange={(e) => updateLogMeta(log.exerciseId, "tempo", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white w-24 placeholder-zinc-600 text-center"
                    />
                    <input
                      type="text"
                      placeholder="Notes d'entraînement"
                      value={log.notes}
                      onChange={(e) => updateLogMeta(log.exerciseId, "notes", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white w-40 placeholder-zinc-600"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {activeSession.logs.length === 0 && (
            <div className="border border-dashed border-zinc-850 rounded-3xl p-12 text-center text-zinc-500 space-y-4">
              <Dumbbell className="w-12 h-12 mx-auto text-zinc-700 animate-bounce" />
              <div>
                <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Aucun exercice sélectionné</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Sélectionnez des mouvements dans la bibliothèque de gauche et initiez l'Analyse Assistée IA pour sécuriser votre progression d'effort.
                </p>
              </div>
            </div>
          )}
        </div>

        {activeSession.logs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mt-6 p-4 bg-zinc-950/40 border border-zinc-900 rounded-3xl backdrop-blur-md">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group text-left">
              <input
                type="checkbox"
                checked={shareToCommunity}
                onChange={(e) => setShareToCommunity(e.target.checked)}
                className="w-4 h-4 bg-zinc-900 border-zinc-800 rounded checked:bg-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
              />
              <div>
                <span className="text-xs font-bold text-zinc-300 block group-hover:text-white transition">Partager sur la Forge Communauté</span>
                <span className="text-[10px] text-zinc-500 block">Publie un bilan de force (volume, tonnage) pour inspirer le club</span>
              </div>
            </label>
            <button
              onClick={handleFinishWorkout}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(59,130,246,0.3)] cursor-pointer hover:scale-101 duration-150 transition-all border border-blue-500/10 shrink-0"
            >
              <Award className="w-5 h-5 text-yellow-300 animate-bounce" /> Compléter l'Entraînement et Gagner des XP !
            </button>
          </div>
        )}
      </div>

      {/* Sleek Floating Rest Timer Overlay */}
      {restCountdown > 0 && (
        <div className={`fixed bottom-6 right-6 max-w-sm bg-zinc-950/95 border ${restIsActive ? 'border-cyan-500/40' : 'border-zinc-805'} p-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md z-50 flex items-center gap-4 transition-all duration-350 ${restIsMinimized ? 'w-14 h-14 overflow-hidden rounded-full p-0 justify-center' : 'w-80'}`}>
          {restIsMinimized ? (
            <button
              onClick={() => setRestIsMinimized(false)}
              className="w-full h-full flex flex-col items-center justify-center text-cyan-400 focus:outline-none cursor-pointer"
              title="Agrandir le chronomètre"
            >
              <span className="text-[10px] font-black font-mono">{restCountdown}s</span>
              <RefreshCw className="w-3 h-3 animate-spin text-zinc-500 mt-0.5" />
            </button>
          ) : (
            <>
              {/* Left Column: Sleek radial progression */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    strokeWidth="3.5"
                    stroke="#18181b"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    strokeWidth="3.5"
                    stroke={restIsActive ? "#06b6d4" : "#4b5563"}
                    fill="transparent"
                    strokeDasharray={163.3}
                    strokeDashoffset={163.3 - (163.3 * restCountdown) / (restTotal || 90)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono select-none">
                  <span className="text-sm font-black text-white">{restCountdown}</span>
                  <span className="text-[7.5px] text-zinc-500 uppercase">sec</span>
                </div>
              </div>

              {/* Middle Column: Details & CTA */}
              <div className="flex-1 truncate text-left">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[9px] font-mono font-bold text-cyan-400/80 tracking-wider">CHRONO RÉCUP ACTIVÉ</span>
                </div>
                <h4 className="text-xs font-extrabold text-white truncate mt-0.5 uppercase tracking-wide">
                  {restExerciseName || "SarcoForge Récup"}
                </h4>
                
                {/* Timer controllers */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => adjustRestTimer(-10)}
                    className="p-1 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 rounded text-[9px] font-mono font-bold cursor-pointer transition select-none"
                    title="-10 secondes"
                  >
                    -10s
                  </button>
                  <button
                    onClick={() => adjustRestTimer(30)}
                    className="p-1 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 rounded text-[9px] font-mono font-bold cursor-pointer transition select-none"
                    title="+30 secondes"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => setRestIsActive(!restIsActive)}
                    className={`px-2 py-1 ${restIsActive ? 'bg-zinc-900 border border-zinc-800 text-zinc-350' : 'bg-cyan-500 text-zinc-950 font-black'} rounded text-[9px] cursor-pointer transition select-none`}
                  >
                    {restIsActive ? "Pause" : "Play"}
                  </button>
                </div>
              </div>

              {/* Right Column: Close/Minimize controls */}
              <div className="flex flex-col gap-2 self-start shrink-0">
                <button
                  type="button"
                  onClick={() => setRestIsMinimized(true)}
                  className="text-zinc-600 hover:text-zinc-300 transition cursor-pointer text-[11px] font-bold font-mono border border-transparent hover:border-zinc-800 p-0.5 rounded select-none leading-none"
                  title="Réduire"
                >
                  _
                </button>
                <button
                  type="button"
                  onClick={() => setRestCountdown(0)}
                  className="text-zinc-650 hover:text-red-400 transition cursor-pointer text-[12px] font-mono border border-transparent hover:border-zinc-800 p-0.5 rounded select-none leading-none"
                  title="Annuler"
                >
                  ×
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
