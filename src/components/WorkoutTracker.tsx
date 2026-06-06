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
  const defaultLocations = onboardingData?.trainingLocations || ["Salle complète"];
  const defaultEquipment = onboardingData?.specificEquipment || [
    "Haltères fixes", "Bandes élastiques légères", "Tapis de sol (yoga mat)"
  ];
  const defaultSpace = onboardingData?.availableSpace || "Moyen (4-9m²)";
  const defaultConstraints = onboardingData?.constraints || [];

  const [activeLocation, setActiveLocation] = useState<string>(defaultLocations[0] || "Salle complète");
  const [activeEquipment, setActiveEquipment] = useState<string[]>(defaultEquipment);
  const [activeSpace, setActiveSpace] = useState<string>(defaultSpace);
  const [activeConstraints, setActiveConstraints] = useState<string[]>(defaultConstraints);
  const [purchaseLog, setPurchaseLog] = useState<string[]>([]);
  const [bonusXpAlert, setBonusXpAlert] = useState<string | null>(null);

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
    // If location is full commercial gym, compatibility is 100% except for space/noise if strict
    const isGym = activeLocation === "Salle complète";
    
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

  // Safe exercise list builder with computed scores
  const exercisesWithScores = EXERCISE_DATABASE.map(ex => {
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
    const originalEx = EXERCISE_DATABASE.find(e => e.id === exId);
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

    const alternateEx = EXERCISE_DATABASE.find(e => e.id === alternateExId);
    if (!alternateEx) {
      alert("La variante corps libre pour cet exercice n'a pas pu être géolocalisée. Essayez de l'ajouter manuellement.");
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
    setBonusXpAlert(`🔄 "${originalEx.name}" remplacé par "${alternateEx.name}" au poids du corps d'élite ! Compatibilité de séance maximisée.`);
    setTimeout(() => setBonusXpAlert(null), 4000);
  };

  // Simulated Pro Store equipment unlocked actions (V4.0 Part 4)
  const buyAndUnlockEquipment = (equipmentName: string, price: number) => {
    if (activeEquipment.includes(equipmentName)) return;
    
    // Add to list, reward XP bonus
    setActiveEquipment((prev) => [...prev, equipmentName]);
    setPurchaseLog((prev) => [...prev, equipmentName]);
    setBonusXpAlert(`🛍️ Équipement acheté: "${equipmentName}" ! +150 XP de Progrès matériel & 8 exercices débloqués !`);
    
    setTimeout(() => {
      setBonusXpAlert(null);
    }, 5000);
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
      alert("Ajoutez au moins un exercice avant de finaliser l'entraînement !");
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
    const prog = ELITE_PROGRAMS.find(p => p.id === progId);
    if (!prog) return;

    const newLogs: ExerciseLog[] = [];
    prog.exercises.forEach((progEx) => {
      const dbEx = EXERCISE_DATABASE.find(e => e.id === progEx.id);
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
      name: `🔥 ${prog.name}`,
      date: new Date().toLocaleDateString("fr-FR"),
      logs: newLogs,
      completed: false
    });

    setBonusXpAlert(`⚙️ Programme d'Élite "${prog.name}" calibré à 100% dans votre routine ! En avant athlète !`);
    setTimeout(() => setBonusXpAlert(null), 5000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      
      {/* BONUS XP NOTIFICATION AREA */}
      {bonusXpAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 border-2 border-emerald-500/50 text-white p-5 rounded-2xl flex items-center gap-3.5 shadow-2xl animate-slideDown max-w-sm">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Succès Sportif</span>
            <p className="text-[12px] text-zinc-300 leading-normal mt-0.5">{bonusXpAlert}</p>
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
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase block tracking-wider">Planification en 1 Clic</span>
              <h3 className="text-xs font-black text-white uppercase mt-0.5">Programmes d'Élite V4.0</h3>
            </div>
          </div>
          
          <p className="text-[10px] text-zinc-400 leading-normal font-sans">
            Sélectionnez l'une de nos configurations d'entraînement cultes d'athlète. Les volumes et charges se configurent de manière adaptative.
          </p>

          <div className="grid grid-cols-1 gap-2.5 pt-1.5">
            {ELITE_PROGRAMS.map((prog) => (
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
            ))}
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
            <span className="font-mono text-xs text-zinc-500">{filteredExercises.length} Mouvements</span>
          </div>

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
                      <p className="text-[10px] font-mono text-zinc-500 leading-tight mt-0.5 mt-0.5 block">{ex.primaryMuscle} &bull; Matos requis: {ex.equipment_required?.join(", ") || "Aucun"}</p>
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

          {/* 8 locations list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "Salle de sport", label: "Salle de sport", icon: <Dumbbell className="w-3.5 h-3.5" /> },
              { id: "Chez moi", label: "Chez moi", icon: <Home className="w-3.5 h-3.5" /> },
              { id: "Dehors / Parc", label: "Dehors / Parc", icon: <Compass className="w-3.5 h-3.5" /> },
              { id: "Hôtel / Voyage", label: "Hôtel", icon: <MapPin className="w-3.5 h-3.5" /> },
              { id: "Bureau / Travail", label: "Bureau", icon: <Briefcase className="w-3.5 h-3.5" /> },
              { id: "CrossFit / Box", label: "CrossFit Box", icon: <Zap className="w-3.5 h-3.5" /> },
              { id: "Piscine", label: "Piscine", icon: <Activity className="w-3.5 h-3.5" /> },
              { id: "Plusieurs lieux", label: "Multi-lieux", icon: <MapPin className="w-3.5 h-3.5" /> },
            ].map((loc) => {
              const isSelected = activeLocation === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    setActiveLocation(loc.id);
                    // Generate minor feedback toast
                    setBonusXpAlert(`📍 Lieu d'entraînement mis à jour : "${loc.id}" ! Programme et compatibilités ajustés.`);
                    setTimeout(() => setBonusXpAlert(null), 3000);
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

          {/* Dynamic Post-Selection Equipment Checklist for Chez moi as per V6.0 */}
          {activeLocation === "Chez moi" && (
            <div className="bg-zinc-900/40 border border-zinc-850/60 p-4 rounded-2xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tu as du matériel chez toi ?</h4>
                  <p className="text-[10px] text-zinc-500">Coche ce que tu as sous la main pour affiner ton programme libre :</p>
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
                          setBonusXpAlert(`⚙️ Matériel désactivé : "${item.label}".`);
                        } else {
                          // Add all synonyms
                          setActiveEquipment((prev) => [...prev, ...item.synonyms]);
                          setBonusXpAlert(`💪 Matériel activé : "${item.label}" + exercices débloqués !`);
                        }
                        setTimeout(() => setBonusXpAlert(null), 3000);
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

        {/* Workout session header */}
        <div className="bg-zinc-950/40 rounded-3xl border border-zinc-800 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div>
            <input
              type="text"
              value={activeSession.name}
              onChange={(e) => setActiveSession((prev) => ({ ...prev, name: e.target.value }))}
              className="text-lg font-bold text-white bg-transparent border-b border-transparent focus:border-zinc-700 focus:outline-none hover:border-zinc-800 w-full md:w-96 text-ellipsis"
            />
            <div className="flex flex-wrap items-center gap-4 mt-2 font-mono text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" /> Séance active</span>
              <span>{activeSession.date}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">VOLUME EFFECTUÉ</span>
              <span className="text-sm font-bold text-white font-mono flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-400" /> {completedSetsCount} séries</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">TONNAGE TOTAL</span>
              <span className="text-xs font-bold text-blue-400 font-mono flex items-center justify-center gap-1"><Flame className="w-4 h-4 text-amber-500" /> {cumulativeTonnage.toLocaleString("fr-FR")} kg</span>
            </div>
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
          <div className="flex justify-end mt-4">
            <button
              onClick={handleFinishWorkout}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-[0_4px_15px_rgba(59,130,246,0.3)] cursor-pointer hover:scale-101 duration-150 transition-all border border-blue-500/10"
            >
              <Award className="w-5 h-5 text-yellow-300 animate-bounce" /> Compléter l'Entraînement et Gagner des XP !
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
