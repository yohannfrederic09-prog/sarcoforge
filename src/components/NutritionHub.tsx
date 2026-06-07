import React, { useState, useEffect } from "react";
import { NutritionLog } from "../types";
import { 
  Plus, 
  Trash2, 
  Camera, 
  Scale, 
  Apple, 
  Check, 
  ListChecks, 
  RefreshCw, 
  Zap, 
  Sparkles, 
  AlertCircle, 
  Heart, 
  Activity, 
  Flame, 
  Cpu, 
  Database, 
  Eye, 
  Terminal, 
  Award, 
  HelpCircle, 
  ShoppingCart, 
  Trash, 
  Compass, 
  Dumbbell 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NutritionHubProps {
  onMacrosUpdated: (calories: number, protein: number, carbs: number, lipids: number) => void;
}

export default function NutritionHub({ onMacrosUpdated }: NutritionHubProps) {
  // Target constants for daily biome calibration
  const targets = {
    calories: 2350,
    proteins: 160,
    carbs: 230,
    lipids: 75,
    water: 3.0,
  };

  // 1. Unified state loaded/persistent in localStorage for complete user session permanence
  const [meals, setMeals] = useState<NutritionLog[]>(() => {
    try {
      const stored = localStorage.getItem("sarcoforge_logged_meals");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Could not load meals:", e);
    }
    return [
      {
        id: "meal_0",
        name: "Bol d'Avoine Protéiné & Myrtilles Bio",
        calories: 450,
        proteins: 35,
        carbs: 55,
        lipids: 10,
        mealType: "Petit-déjeuner",
        time: "08:15",
      },
      {
        id: "meal_1",
        name: "Pavé de Saumon Sauvage & Riz Basmati",
        calories: 680,
        proteins: 45,
        carbs: 75,
        lipids: 20,
        mealType: "Déjeuner",
        time: "13:00",
      }
    ];
  });

  // Track if current state is loaded is done, to prevent calling onMacrosUpdated repeatedly on mount
  useEffect(() => {
    localStorage.setItem("sarcoforge_logged_meals", JSON.stringify(meals));
  }, [meals]);

  // Scanner multi-mode control states
  const [scannerMode, setScannerMode] = useState<"barcode" | "vision" | "molecular">("barcode");
  const [scanning, setScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<string[]>([]);
  const [scannedResult, setScannedResult] = useState<{ 
    name: string; 
    cal: number; 
    prot: number; 
    carb: number; 
    lip: number; 
    purity: number; 
    anabolism: number; 
    isExperimental?: boolean;
    classCode?: string;
  } | null>(null);

  // Manual Food Entry state
  const [newMealName, setNewMealName] = useState("");
  const [newMealCal, setNewMealCal] = useState<number>(350);
  const [newMealProt, setNewMealProt] = useState<number>(25);
  const [newMealCarb, setNewMealCarb] = useState<number>(40);
  const [newMealLip, setNewMealLip] = useState<number>(10);
  const [newMealType, setNewMealType] = useState<"Petit-déjeuner" | "Déjeuner" | "Dîner" | "Encas">("Encas");

  // Water tracking state
  const [waterCups, setWaterCups] = useState(() => {
    try {
      const val = localStorage.getItem("sarcoforge_waterCups");
      return val ? parseInt(val, 10) : 4;
    } catch {
      return 4;
    }
  });

  useEffect(() => {
    localStorage.setItem("sarcoforge_waterCups", String(waterCups));
  }, [waterCups]);

  // Synthetic recipe generator states
  const [recipeArchetype, setRecipeArchetype] = useState<"anabolic" | "keto" | "glyco" | "fasting">("anabolic");
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthLog, setSynthLog] = useState<string[]>([]);
  const [synthesizedRecipe, setSynthesizedRecipe] = useState<{
    name: string;
    desc: string;
    calories: number;
    proteins: number;
    carbs: number;
    lipids: number;
    ingredients: string[];
    instructions: string[];
    bioScore: number;
    nanotechBoost: string;
  } | null>(null);

  // Custom grocery items
  const [groceryInput, setGroceryInput] = useState("");
  const [groceries, setGroceries] = useState(() => {
    try {
      const stored = localStorage.getItem("sarcoforge_groceries");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { title: "Blancs de poulet fermier d'élevage bio", checked: false, tag: "ANABOLIC" },
      { title: "Pavés de saumon frais riche en Omega-3", checked: true, tag: "OPTIMIZE" },
      { title: "Isolat de Whey Micro-filtrée 90%", checked: false, tag: "SUPPLEMENT" },
      { title: "Riz basmati à haute absorption digestive", checked: true, tag: "FUEL" },
      { title: "Beurre de cacahuètes pressé à froid", checked: false, tag: "LIPIDS" },
      { title: "Gingembre bio à haut rendement antioxydant", checked: false, tag: "BIO-SHIELD" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("sarcoforge_groceries", JSON.stringify(groceries));
  }, [groceries]);

  // Pre-saved Quick Dishes
  const preSavedDishes = [
    {
      name: "Omelette Anabolique (3 œufs + Blancs)",
      calories: 320,
      proteins: 32,
      carbs: 2,
      lipids: 20,
      mealType: "Petit-déjeuner" as const,
      isCyber: true,
    },
    {
      name: "Sauté de Blanc Poids Plume (Poulet / Brocoli)",
      calories: 410,
      proteins: 44,
      carbs: 15,
      lipids: 8,
      mealType: "Déjeuner" as const,
      isCyber: false,
    },
    {
      name: "Shaker Isolat Whey + Banane Post-Workout",
      calories: 270,
      proteins: 27,
      carbs: 32,
      lipids: 1,
      mealType: "Encas" as const,
      isCyber: true,
    },
    {
      name: "Steak de Boeuf Maigre 5% & Patate Douce",
      calories: 590,
      proteins: 42,
      carbs: 65,
      lipids: 12,
      mealType: "Dîner" as const,
      isCyber: false,
    }
  ];

  const addMeal = (name: string, cal: number, prot: number, carb: number, lip: number, type: any) => {
    const freshMeal: NutritionLog = {
      id: `meal_${Date.now()}`,
      name: name,
      calories: cal,
      proteins: prot,
      carbs: carb,
      lipids: lip,
      mealType: type,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMeals((prev) => [...prev, freshMeal]);
    onMacrosUpdated(cal, prot, carb, lip);
  };

  const removeMeal = (id: string) => {
    const target = meals.find((m) => m.id === id);
    if (target) {
      onMacrosUpdated(-target.calories, -target.proteins, -target.carbs, -target.lipids);
    }
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;
    addMeal(newMealName, newMealCal, newMealProt, newMealCarb, newMealLip, newMealType);
    setNewMealName("");
  };

  // Trigger Scanner Simulator
  const triggerScanner = () => {
    setScanning(true);
    setScannedResult(null);
    setScanSteps([]);

    let steps: string[] = [];
    if (scannerMode === "barcode") {
      steps = [
        "📡 Initialisation du faisceau laser rouge...",
        "🔍 Alignement automatique avec l'optique...",
        "🧬 Lecture des structures de codes bio-chimiques...",
        "🧪 Décodage réussi : Match identifié dans la base !"
      ];
    } else if (scannerMode === "vision") {
      steps = [
        "👁️ Lancement du capteur de vision holographique...",
        "📊 Cartographie géométrique volumétrique 3D...",
        "🔥 Évaluation de la masse calorique surfacique...",
        "⚡ Synthèse neuronale : Composition de l'assiette estimée !"
      ];
    } else {
      steps = [
        "🧬 Alignement du spectromètre de masse orbital...",
        "🧲 Polarisation électromagnétique transitoire...",
        "🧪 Rapatriement de la carte d'acides aminés natifs...",
        "💡 Analyseur actif : Indice de dénaturation protéique stable !"
      ];
    }

    // Interval execution of tech steps
    steps.forEach((stepText, idx) => {
      setTimeout(() => {
        setScanSteps((prev) => [...prev, stepText]);
      }, (idx + 1) * 600);
    });

    setTimeout(() => {
      // Simulate real laser detection outputs depending on active mode
      if (scannerMode === "barcode") {
        setScannedResult({
          name: "Caséine Micellaire Moléculaire (Framboise)",
          cal: 160,
          prot: 34,
          carb: 3,
          lip: 1,
          purity: 99.4,
          anabolism: 95,
          classCode: "NANOPROT-C9",
        });
      } else if (scannerMode === "vision") {
        setScannedResult({
          name: "Assiette de Poulet Rôti & Épices Anabolisantes",
          cal: 540,
          prot: 48,
          carb: 42,
          lip: 14,
          purity: 91.2,
          anabolism: 89,
          classCode: "BIOFEED-V4",
        });
      } else {
        setScannedResult({
          name: "Capsule d'Émulsion Omega-3 de Krill Synthétisé",
          cal: 45,
          prot: 0,
          carb: 0,
          lip: 5,
          purity: 99.9,
          anabolism: 75,
          isExperimental: true,
          classCode: "HYBRID-LIP9",
        });
      }
      setScanning(false);
    }, 2500);
  };

  const acceptScannedResult = () => {
    if (scannedResult) {
      addMeal(scannedResult.name, scannedResult.cal, scannedResult.prot, scannedResult.carb, scannedResult.lip, "Encas");
      setScannedResult(null);
    }
  };

  // Recipe Synthesizer Matrix
  const triggerSynthesis = () => {
    setSynthesizing(true);
    setSynthesizedRecipe(null);
    setSynthLog([]);

    const logs = [
      "📡 CONNEXION AU SYNTHÉTISEUR MOULÉ... EN LIGNE",
      "🧬 CHARGEMENT DE LA BANQUE D'INGRÉDIENTS BIO-PROPRES...",
      "⚙️ EXTRACTION DE L'ARCHETYPE METABOLIQUE SELECTIONNE...",
      "🔬 COMPILATION TRIDIMENSIONNELLE DE LA FORMULE CHIMIQUE...",
      "🔥 CALIBRAGE DU PROFIL DE THERMOGÉNÈSE ACTIVE..."
    ];

    logs.forEach((text, i) => {
      setTimeout(() => {
        setSynthLog((prev) => [...prev, text]);
      }, (i + 1) * 400);
    });

    setTimeout(() => {
      if (recipeArchetype === "anabolic") {
        setSynthesizedRecipe({
          name: "Matrice Concentrée Alpha-1 (Whey Isoler)",
          desc: "Un mix thermodynamique conçu pour inonder de leucine les récepteurs intramusculaires après un entraînement lourd.",
          calories: 450,
          proteins: 48,
          carbs: 45,
          lipids: 5,
          ingredients: [
            "40g Isolat de Sérum Nanoprotect d'assimilation rapide",
            "1 Banane grillée cryogénisée riche en potassium",
            "20g Flocons d'avoine moulus sous pression hydrogénée",
            "250ml Lait d'Amande enrichi en calcium électrolytique"
          ],
          instructions: [
            "Introduire l'isolat protéique dans un mélangeur moléculaire.",
            "Ajouter la banane cryogénisée en fines rondelles pour éviter les grumeaux.",
            "Mixer à puissance nominale (12 000 rpm) sous vide d'air pour préserver les chaînes ramifiées.",
            "Consommer délicatement dans la fenêtre d'hyperémie post-effort."
          ],
          bioScore: 98,
          nanotechBoost: "+125% Synthèse de Protéines Ribosomale"
        });
      } else if (recipeArchetype === "keto") {
        setSynthesizedRecipe({
          name: "Formule Lipolytique Cétogène Syn-K8",
          desc: "Un condensé lipidique anabolisant pur qui force le foie à libérer massivement de l'acétoacétate pour alimenter les mitochondries.",
          calories: 680,
          proteins: 42,
          carbs: 6,
          lipids: 54,
          ingredients: [
            "180g Pavé de Saumon sauvage riche en acides gras EPA/DHA",
            "1 Avocat bio bio-imprimé à point",
            "15g Huile de Coco hydro-distillée (Triglycérides MCT)",
            "30g Jeunes pousses d'épinards cultivées sous spectre lumineux stimulé"
          ],
          instructions: [
            "Poêler le saumon à feu doux pour ne pas saturer les liens double d'Oméga-3.",
            "Émulsionner la pulpe d'avocat avec l'huile MCT pour multiplier le taux de cétones hépatiques.",
            "Dresser sur le lit d'épinards riches en potassium végétal.",
            "Assaisonner d'une pincée de fleur de sel enrichie en minéraux marins."
          ],
          bioScore: 96,
          nanotechBoost: "Production de Cétones Instantanée (MCT Active)"
        });
      } else if (recipeArchetype === "glyco") {
        setSynthesizedRecipe({
          name: "Combo Carbo-Hyperdrive G-4",
          desc: "Ajuste les stocks de glycogène déchargés en forçant l'insuline à acheminer les hydrates de carbone dans le sarcoplasme musculaire.",
          calories: 610,
          proteins: 38,
          carbs: 95,
          lipids: 6,
          ingredients: [
            "140g Émincé de poulet d'élevage local cuit sous barrière de vide",
            "320g Écrasé de patate douce thermo-laminée",
            "120g Asperges forestières à fort taux hydrique et ionique",
            "10g Sirop d'Érable bio-concentré pour l'index glycémique initial"
          ],
          instructions: [
            "Chauffer l'écrasé de patate douce sous pression vapeur contrôlée.",
            "Faire dorer le poulet avec une noisette d'épices anti-inflammatoires.",
            "Napper le poulet du filet de sirop d'érable pour stimuler le pic insulinique anabolique post-workout.",
            "Servir chaud accompagné d'asperges riches en antioxydants phénoliques."
          ],
          bioScore: 93,
          nanotechBoost: "Re-synthèse de Glycogène Accélérée de 4x"
        });
      } else {
        setSynthesizedRecipe({
          name: "Infusion Électrolytique Autophagique Zen-A3",
          desc: "Zéro calorie perturbatrice. Un fluide micro-dosé pour stimuler l'autophagie et restructurer la barrière gastro-intestinale.",
          calories: 90,
          proteins: 10,
          carbs: 2,
          lipids: 4,
          ingredients: [
            "250ml Bouillon d'os déshydraté enrichi en L-Glutamine bio-active",
            "5g Extrait de racine de gingembre frais pressé à froid",
            "1g Poudre d'algue verte spiruline marine de haute pureté",
            "Jus de citron jaune ionisé pour stabiliser le pH extracellulaire"
          ],
          instructions: [
            "Faire frémir le bouillon à 78°C sous cloche étanche.",
            "Ajouter hors du feu le gingembre et la spiruline pour ne pas dénaturer les enzymes digestives.",
            "Servir dans un bol chauffant et consommer lentement par petites gorgées cellulaires."
          ],
          bioScore: 99,
          nanotechBoost: "Autophagie Cellulaire Activable Directement"
        });
      }
      setSynthesizing(false);
    }, 2200);
  };

  const addSynthRecipeToJournal = () => {
    if (synthesizedRecipe) {
      addMeal(
        synthesizedRecipe.name,
        synthesizedRecipe.calories,
        synthesizedRecipe.proteins,
        synthesizedRecipe.carbs,
        synthesizedRecipe.lipids,
        "Encas"
      );
      // Beautiful feedback effect
      alert(`Recette moléculaire "${synthesizedRecipe.name}" injectée avec succès dans votre journal de bord !`);
    }
  };

  const addSynthIngredientsToGrocery = () => {
    if (synthesizedRecipe) {
      const added = synthesizedRecipe.ingredients.map((ing) => ({
        title: ing,
        checked: false,
        tag: "SYNTH-RECIPE"
      }));
      setGroceries((prev) => [...prev, ...added]);
      alert("Composants de synthèse injectés dans votre Liste de Courses !");
    }
  };

  // Calculations for sums and metrics
  const totalCal = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProt = meals.reduce((acc, m) => acc + m.proteins, 0);
  const totalCarb = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalLip = meals.reduce((acc, m) => acc + m.lipids, 0);
  const totalWater = waterCups * 0.25;

  // Real-time glycemic impact prediction
  const glycemicImpactValue = totalCarb / Math.max(totalProt * 0.6 + totalLip * 0.9, 1);
  const glycemicLevel = 
    glycemicImpactValue < 0.8 ? { label: "STABLE (Basse)", color: "text-emerald-400 border-emerald-500/20 bg-emerald-950/10" } : 
    glycemicImpactValue < 1.6 ? { label: "MODÉRÉ (Plat)", color: "text-amber-400 border-amber-500/20 bg-amber-950/10" } :
    { label: "PICS RAPIDES (Index Élevé)", color: "text-red-400 border-red-500/20 bg-red-950/10" };

  // Biofeedback trackers dynamically computed
  const trackerSodium = Math.min((1.2 + meals.length * 0.3), 3.0);
  const trackerMagnesium = Math.min((100 + totalProt * 1.8), 450);
  const trackerFibres = Math.min((8 + totalCarb * 0.12), 40);

  // Handle adding custom grocery item
  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groceryInput.trim()) return;
    setGroceries((prev) => [
      ...prev,
      { title: groceryInput.trim(), checked: false, tag: "ATHLETE" }
    ]);
    setGroceryInput("");
  };

  const toggleGrocery = (idx: number) => {
    setGroceries((prev) => prev.map((item, i) => (i === idx ? { ...item, checked: !item.checked } : item)));
  };

  const removeCheckedGroceries = () => {
    setGroceries((prev) => prev.filter((item) => !item.checked));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* 1. VISUAL PROGRESS PANEL WITH NEON HUD */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
          
          <div className="flex items-center justify-between mb-5 border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-blue-500" /> Profil d'effort métabolique
            </h3>
            <span className="text-[8px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded uppercase font-bold">
              HUD BIO-MOTEUR
            </span>
          </div>

          {/* LARGE DYNAMIC RING */}
          <div className="flex flex-col items-center py-4 relative">
            <div className="relative w-40 h-40 rounded-full border-4 border-zinc-900/60 flex flex-col items-center justify-center shadow-2xl bg-zinc-950/50">
              {/* Outer Laser pulse ring */}
              <div 
                className="absolute inset--1.5 rounded-full border border-blue-500/15 pointer-events-none animate-pulse"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 100%)" }}
              />
              {/* Dynamic SVG stroke progress ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  className="stroke-zinc-900 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  className="stroke-blue-500 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={465}
                  strokeDashoffset={465 - (465 * Math.min(totalCal, targets.calories)) / targets.calories}
                  strokeLinecap="round"
                />
              </svg>

              {/* Inner details */}
              <span className="text-3xl font-black text-white font-mono tracking-tight">{totalCal}</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider">sur {targets.calories} kcal</span>
              <span className="text-[8px] font-mono font-bold text-blue-400/80 uppercase mt-1">ÉVALUATION ACTIVE</span>
            </div>

            <div className="text-center mt-5 w-full">
              <div className={`text-[10px] font-mono uppercase tracking-widest border px-3 py-1.5 rounded-xl font-bold transition-all ${
                totalCal > targets.calories ? "border-red-500/30 text-red-400 bg-red-950/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-emerald-500/30 text-emerald-400 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              }`}>
                {totalCal > targets.calories
                  ? `Surcharge : +${totalCal - targets.calories} kcal`
                  : `Dispo : ${targets.calories - totalCal} kcal restantes`}
              </div>
            </div>
          </div>

          {/* THREE CORE MACRO CHANNELS */}
          <div className="space-y-4.5 mt-4">
            {/* Protein bar progress */}
            <div className="p-2.5 bg-zinc-900/30 border border-zinc-850/40 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-blue-400 font-bold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> PROTEINES
                </span>
                <span className="text-zinc-400 font-medium">{totalProt}g <span className="text-zinc-650">/ {targets.proteins}g</span></span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-850">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  style={{ width: `${Math.min((totalProt / targets.proteins) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs bar progress */}
            <div className="p-2.5 bg-zinc-900/30 border border-zinc-850/40 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> GLUCIDES
                </span>
                <span className="text-zinc-400 font-medium">{totalCarb}g <span className="text-zinc-650">/ {targets.carbs}g</span></span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-850">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  style={{ width: `${Math.min((totalCarb / targets.carbs) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Lipids bar progress */}
            <div className="p-2.5 bg-zinc-900/30 border border-zinc-850/40 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-amber-500 font-bold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> LIPIDES
                </span>
                <span className="text-zinc-400 font-medium">{totalLip}g <span className="text-zinc-650">/ {targets.lipids}g</span></span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-850">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.min((totalLip / targets.lipids) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* PREDICTIVE INSULINE RESPONSE FIELD */}
          <div className="mt-5 pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono">
            <span className="text-zinc-500 block">IMPACT GLYCÉMIQUE :</span>
            <span className={`px-2 py-0.5 rounded border uppercase text-[9px] font-bold ${glycemicLevel.color} tracking-wider`}>
              {glycemicLevel.label}
            </span>
          </div>
        </div>

        {/* BIOFEEDBACK MICRO-NUTRIMENTS MATRIX */}
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Analyseur de Micro-Éléments
            </h4>
          </div>

          <p className="text-[10.5px] text-zinc-500 leading-normal">
            Calculs prédictifs dérivés en direct de vos aliments pour calibrer votre homéostasie cellulaire :
          </p>

          <div className="space-y-3 font-mono text-[10px]">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>Rapport Sodium / Osmose</span>
                <span className="text-zinc-500">{trackerSodium.toFixed(1)}g / 2.3g cible</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${Math.min((trackerSodium / 2.3) * 100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>Magnésium Neuromusculaire</span>
                <span className="text-zinc-500">{trackerMagnesium.toFixed(0)}mg / 400mg cible</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${Math.min((trackerMagnesium / 400) * 100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>Fibres Biome-Actives</span>
                <span className="text-zinc-500">{trackerFibres.toFixed(0)}g / 30g cible</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${Math.min((trackerFibres / 30) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* HYDRATION MODULE */}
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Zap className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Hydratation Intracellulaire
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            Maintenez un afflux d'eau constant pour réguler le volume plasmique et fluidifier le transport des acides aminés.
          </p>

          <div className="grid grid-cols-6 gap-2 mb-4">
            {Array.from({ length: 12 }).map((_, i) => {
              const active = i < waterCups;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setWaterCups(i + 1)}
                  className={`h-11 rounded-xl flex flex-col items-center justify-between py-1.5 border transition-all cursor-pointer ${
                    active
                      ? "bg-blue-600/15 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)] scale-[1.03]"
                      : "bg-zinc-900/50 border-zinc-850 text-zinc-650 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[8px] font-mono font-bold leading-none">{i + 1}</span>
                  <div className={`w-3.5 h-2 rounded-sm ${active ? "bg-gradient-to-t from-blue-500 to-blue-300 shadow-[0_0_4px_rgba(59,130,246,0.6)]" : "bg-zinc-800"}`} />
                </button>
              );
            })}
          </div>

          <div className="bg-zinc-900/50 border border-zinc-850 p-3 rounded-2xl flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">Total assimilé :</span>
            <span className="text-white font-black">{totalWater.toFixed(2)}L / {targets.water}L</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGS & FUTURISTIC SCANNING / SYNTHESIS CONTROLS */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* TRI-MODE BIO-SCANNER IA COMPONENT */}
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 blur-3xl rounded-full"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-zinc-900 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Camera className="w-4.5 h-4.5 text-cyan-400" /> Scanner Optique & Vision Moléculaire IA
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Choisissez votre méthode d'évaluation optique pour décoder instantanément l'énergie interne.
              </p>
            </div>

            {/* SCAN MODE BUTTONS */}
            <div className="flex gap-1.5 p-1 bg-zinc-900/50 rounded-xl border border-zinc-850 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setScannerMode("barcode")}
                className={`px-3 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  scannerMode === "barcode" ? "bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "text-zinc-500 hover:text-zinc-400"
                }`}
              >
                Code-Barres
              </button>
              <button
                type="button"
                onClick={() => setScannerMode("vision")}
                className={`px-3 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  scannerMode === "vision" ? "bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "text-zinc-500 hover:text-zinc-400"
                }`}
              >
                Vision Hologramme
              </button>
              <button
                type="button"
                onClick={() => setScannerMode("molecular")}
                className={`px-3 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  scannerMode === "molecular" ? "bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "text-zinc-500 hover:text-zinc-400"
                }`}
              >
                Spectrométrie
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-stretch">
            {/* INSTRUCTIONS / RUN SCANNER BUTTON & TERMINAL PREVIEW */}
            <div className="flex-1 space-y-4">
              <div className="text-[11px] text-zinc-400 space-y-1.5 bg-zinc-900/20 p-3 rounded-2xl border border-zinc-900">
                <span className="font-bold text-white block uppercase tracking-wide">
                  {scannerMode === "barcode" && "📊 LASER DÉTECTEUR CODE-BARRES"}
                  {scannerMode === "vision" && "📸 RECONNAISSANCE ASSIETTE VISION"}
                  {scannerMode === "molecular" && "🧬 SPECTROMÉTRIE ULTRA-HAUTE FRÉQUENCE"}
                </span>
                <p className="font-sans leading-relaxed text-zinc-500">
                  {scannerMode === "barcode" && "Alignez le laser avec l'emballage du produit. Idéal pour les barres protéinées, poudres ou suppléments calibrés."}
                  {scannerMode === "vision" && "Capturez un visuel volumétrique 3D de votre repas complet. Notre IA estime les portions et les ratios macro-cellulaires."}
                  {scannerMode === "molecular" && "Analysez la pureté de vos shakers de protéines natifs pour repérer d'éventuels écarts de dénaturation protéique."}
                </p>
              </div>

              <button
                type="button"
                onClick={triggerScanner}
                disabled={scanning}
                className="w-full py-3.5 px-4 rounded-2xl border border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-black font-mono uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)] disabled:opacity-30"
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
                {scanning ? "Séquençage IA Actif..." : "Déclencher l'Impulsion Laser"}
              </button>
            </div>

            {/* SCANNING GRAPHIC SIMULATOR */}
            <div className="flex-1 min-h-[140px] bg-zinc-950 border border-zinc-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-3.5">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-cyber-grid bg-[linear-gradient(rgba(18,18,18,0.92)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.92)_1px,transparent_1px)] bg-[size:16px_16px] opacity-25"></div>

              {scanning ? (
                <div className="absolute inset-0 flex flex-col justify-end p-4 z-10 bg-zinc-950/80">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400 animate-slide-scan shadow-[0_0_12px_#22d3ee]"></div>
                  {/* Concentric scan lines */}
                  {scannerMode === "vision" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border border-dashed border-cyan-400/40 animate-ping"></div>
                    </div>
                  )}
                  {scannerMode === "molecular" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-lg bg-cyan-500/5 border border-cyan-400/30 animate-spin-slow"></div>
                    </div>
                  )}
                  <div className="space-y-1 font-mono text-[9px]">
                    {scanSteps.map((log, sIdx) => (
                      <div key={sIdx} className="text-cyan-400/80 animate-fadeIn font-bold">
                        &gt; {log}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {!scanning && !scannedResult && (
                <div className="inset-0 flex flex-col items-center justify-center py-8 text-center text-zinc-600 font-mono space-y-2">
                  <Terminal className="w-8 h-8 text-zinc-800" />
                  <span className="text-[10px] tracking-wider uppercase font-bold text-zinc-550">SENSEUR EN ATTENTE D'IMPULSION</span>
                </div>
              )}

              {scannedResult && !scanning && (
                <div className="space-y-3 z-10 w-full animate-fadeIn-fast">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 py-0.5 px-2 rounded uppercase">
                      Code {scannedResult.classCode}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 font-semibold">
                      Pureté: {scannedResult.purity}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide truncate">{scannedResult.name}</h4>
                    <div className="grid grid-cols-4 gap-1.5 mt-2 font-mono text-[9px] text-center">
                      <div className="bg-zinc-900 border border-zinc-850 p-1.5 rounded-lg">
                        <span className="text-zinc-500 block uppercase text-[7px] leading-tight mb-0.5">Prot</span>
                        <strong className="text-blue-400 block text-xs">{scannedResult.prot}g</strong>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-850 p-1.5 rounded-lg">
                        <span className="text-zinc-500 block uppercase text-[7px] leading-tight mb-0.5">Glu</span>
                        <strong className="text-indigo-400 block text-xs">{scannedResult.carb}g</strong>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-850 p-1.5 rounded-lg">
                        <span className="text-zinc-500 block uppercase text-[7px] leading-tight mb-0.5">Lip</span>
                        <strong className="text-amber-500 block text-xs">{scannedResult.lip}g</strong>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-850 p-1.5 rounded-lg font-bold">
                        <span className="text-zinc-500 block uppercase text-[7px] leading-tight mb-0.5">Valeur</span>
                        <strong className="text-white block text-xs">{scannedResult.cal} kcal</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 font-sans">
                    <button
                      type="button"
                      onClick={() => setScannedResult(null)}
                      className="py-1.5 px-2.5 rounded-xl border border-zinc-800 text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900 text-[10px] font-bold tracking-wide uppercase transition-all flex-1 cursor-pointer"
                    >
                      Rejeter
                    </button>
                    <button
                      type="button"
                      onClick={acceptScannedResult}
                      className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-[10px] font-extrabold tracking-widest uppercase transition-all flex items-center justify-center gap-1 flex-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Injecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HIGH-PERFORMANCE SYNTHETISEUR DE RECETTES IA */}
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/5 blur-3xl rounded-full"></div>
          
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
            <Cpu className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                Synthétiseur de Nutriments Moléculaires IA
              </h3>
              <p className="text-xs text-zinc-500 font-sans">Assemblez un profil aminoacide ou glucidique pur en sélectionnant une configuration.</p>
            </div>
          </div>

          {/* CHOOSE SYSTEM ARCHETYPE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              { id: "anabolic", title: "Anabolic-Core", desc: "Acides d'Absorption", tag: "+48g Prot", glow: "border-blue-500/30 text-blue-400 bg-blue-950/10" },
              { id: "keto", title: "Neuro-Keto", desc: "Lipides Mitochondriaux", tag: "Cétolyse", glow: "border-indigo-500/30 text-indigo-400 bg-indigo-950/10" },
              { id: "glyco", title: "Glyco-Boost", desc: "Re-synthèse Glycogène", tag: "Index R", glow: "border-amber-500/30 text-amber-500 bg-amber-950/10" },
              { id: "fasting", title: "Autophagie", desc: "Régulation Biome", tag: "Bio-Shield", glow: "border-emerald-500/30 text-emerald-400 bg-emerald-950/10" }
            ].map((arch) => {
              const matches = recipeArchetype === arch.id;
              return (
                <button
                  type="button"
                  key={arch.id}
                  onClick={() => setRecipeArchetype(arch.id as any)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                    matches 
                      ? `${arch.glow} shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-[1.03] border-blue-550` 
                      : "border-zinc-850 hover:border-zinc-800 hover:bg-zinc-900/40 text-zinc-400"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block">{arch.title}</span>
                    <span className="text-[8px] text-zinc-500 mt-0.5 block font-serif italic font-medium">{arch.desc}</span>
                  </div>
                  <span className="text-[8px] font-mono uppercase bg-zinc-900 border border-zinc-850 py-0.5 px-1.5 self-start rounded text-zinc-500">
                    {arch.tag}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={triggerSynthesis}
              disabled={synthesizing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-950/20 text-white rounded-2xl text-xs font-black font-mono uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] cursor-pointer"
            >
              {synthesizing ? "Compilation Moléculaire en cours..." : "Synthétiser la Formule Diet Sélectionnée"}
            </button>

            {/* SYNTH ANIMATION AND LOG SYSTEM */}
            {synthesizing && (
              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl font-mono text-[10px] space-y-1 bg-cyber-grid pointer-events-none">
                <span className="text-zinc-600 block animate-pulse font-sans font-bold">MOTEUR SYNTHÉTISEUR : SÉQUENÇAGE EN COURS...</span>
                {synthLog.map((logLine, idx) => (
                  <div key={idx} className="text-blue-400/80">
                    &gt; {logLine}
                  </div>
                ))}
              </div>
            )}

            {/* SYNTHESIZED DISH DISPLAY */}
            {synthesizedRecipe && !synthesizing && (
              <div className="bg-zinc-900/30 border border-zinc-850/80 p-5 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-850 pb-3">
                  <div>
                    <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider block">SYNTHÈSE PARFAITE VALIDÉE 🧬</span>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">{synthesizedRecipe.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-white font-mono block">{synthesizedRecipe.calories} kcal</span>
                    <span className="text-[9px] font-mono text-zinc-500 font-semibold block">{synthesizedRecipe.nanotechBoost}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-normal font-sans">
                  {synthesizedRecipe.desc}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5 p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl">
                    <span className="text-[8.5px] font-mono uppercase text-zinc-550 block font-bold">🎯 COMPOSANTS NUTRITIFS REQUIS :</span>
                    <ul className="space-y-1 text-zinc-300">
                      {synthesizedRecipe.ingredients.map((ing, k) => (
                        <li key={k} className="flex items-center gap-2 text-[11px] font-mono leading-relaxed">
                          <span className="text-blue-500">&bull;</span> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl">
                    <span className="text-[8.5px] font-mono uppercase text-zinc-550 block font-bold">⚡ PROTOCOLE DE SYNTHÈSE :</span>
                    <ol className="space-y-1 text-zinc-300">
                      {synthesizedRecipe.instructions.map((inst, k) => (
                        <li key={k} className="text-[10px] leading-relaxed flex gap-2">
                          <span className="text-zinc-600 font-mono font-bold shrink-0">{k + 1}.</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* SYNTHESIS ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={addSynthIngredientsToGrocery}
                    className="py-2.5 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 font-bold tracking-wide uppercase transition flex-1 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-zinc-400" />
                    Bons d'achat courses (+10 XP)
                  </button>
                  <button
                    type="button"
                    onClick={addSynthRecipeToJournal}
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold tracking-widest uppercase transition-all duration-300 flex-1 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    Injecter dans la Ration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ROSTERS, LOGS MATRIX, AND DIRECT INTAKES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* JOURNAL DU JOUR (DAILY MEAL HISTORY) */}
          <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col h-[400px] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h3 className="text-xs font-black text-white uppercase tracking-widest pb-3 border-b border-zinc-900 mb-3 block">
              Journal de Ration Clinique
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {meals.map((meal) => (
                <div 
                  key={meal.id} 
                  className="flex justify-between items-center gap-3 bg-zinc-900/20 border border-zinc-900/60 px-3.5 py-2.5 rounded-2xl hover:border-zinc-800 transition"
                >
                  <div className="truncate flex-1">
                    <h4 className="text-xs font-bold text-white truncate uppercase tracking-tight">{meal.name}</h4>
                    <span className="text-[9px] font-mono text-zinc-500 block">{meal.time} &bull; {meal.mealType}</span>
                    <div className="flex gap-2.5 text-[9px] font-mono text-zinc-450 mt-1 pb-0.5">
                      <span>P: <strong className="text-blue-400">{meal.proteins}g</strong></span>
                      <span>G: <strong className="text-indigo-400">{meal.carbs}g</strong></span>
                      <span>L: <strong className="text-amber-500">{meal.lipids}g</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 select-none shrink-0">
                    <span className="text-xs font-bold text-white font-mono">{meal.calories} kcal</span>
                    <button
                      type="button"
                      onClick={() => removeMeal(meal.id)}
                      className="text-zinc-650 hover:text-red-400 p-1.5 rounded-lg border border-transparent hover:border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {meals.length === 0 && (
                <div className="text-center py-20 text-zinc-600 text-xs font-mono flex flex-col items-center justify-center gap-2">
                  <Apple className="w-8 h-8 text-zinc-800" />
                  <span>Aucun log métabolique aujourd'hui.</span>
                </div>
              )}
            </div>
          </div>

          {/* SÉCURISATION ET ADDITION DIRECTE (MANUAL DIRECT ENTRY) */}
          <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h3 className="text-xs font-black text-white uppercase tracking-widest pb-3 border-b border-zinc-900 mb-3 block">
              Enregistrer un Aliment Cyber
            </h3>

            <form onSubmit={handleManualAdd} className="space-y-3 font-mono text-[11px]">
              <div>
                <label className="text-zinc-500 uppercase text-[8.5px] block mb-1">Nom du plat d'effort</label>
                <input
                  type="text"
                  placeholder="Ex: Riz Basmati Bio, Blanc de Poulet..."
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-500 uppercase text-[8.5px] block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={newMealCal}
                    onChange={(e) => setNewMealCal(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-850 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 uppercase text-[8.5px] block mb-1">Période d'apport</label>
                  <select
                    value={newMealType}
                    onChange={(e) => setNewMealType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-850 text-white rounded-xl py-2 px-2 focus:outline-none focus:border-blue-500 text-xs font-sans"
                  >
                    <option>Petit-déjeuner</option>
                    <option>Déjeuner</option>
                    <option>Dîner</option>
                    <option>Encas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-blue-400 uppercase text-[8.5px] block mb-1 text-center font-bold">Prot (g)</label>
                  <input
                    type="number"
                    value={newMealProt}
                    onChange={(e) => setNewMealProt(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-850 text-white rounded-xl py-1.5 px-2 focus:outline-none focus:border-blue-500 text-center text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-indigo-400 uppercase text-[8.5px] block mb-1 text-center font-bold">Glu (g)</label>
                  <input
                    type="number"
                    value={newMealCarb}
                    onChange={(e) => setNewMealCarb(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-850 text-white rounded-xl py-1.5 px-2 focus:outline-none focus:border-blue-500 text-center text-xs"
                  />
                </div>
                <div>
                  <label className="text-amber-500 uppercase text-[8.5px] block mb-1 text-center font-bold">Lip (g)</label>
                  <input
                    type="number"
                    value={newMealLip}
                    onChange={(e) => setNewMealLip(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-850 text-white rounded-xl py-1.5 px-2 focus:outline-none focus:border-blue-500 text-center text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newMealName.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black font-sans uppercase tracking-widest cursor-pointer transition-all disabled:opacity-40 shadow-[0_0_12px_rgba(37,99,235,0.2)] mt-1"
              >
                Inscrire au Journal de Bord
              </button>
            </form>
          </div>
        </div>

        {/* QUICK PRE-SAVED ATHLETE DISHES */}
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-md">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Apple className="w-4.5 h-4.5 text-blue-500 animate-pulse" /> Modèles Alimentaires de Champion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {preSavedDishes.map((dish, i) => (
              <div
                key={i}
                className="bg-zinc-900/30 border border-zinc-850/60 p-4 rounded-2xl flex justify-between items-center hover:bg-zinc-900/60 transition-all border-l-2 hover:border-l-blue-500"
              >
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 block mb-0.5">{dish.mealType}</span>
                  <h4 className="text-xs font-bold text-white truncate max-w-[210px] uppercase tracking-wide">{dish.name}</h4>
                  <span className="text-[10px] font-mono text-blue-400 block mt-0.5">{dish.calories} kcal &bull; {dish.proteins}g Prot &bull; {dish.carbs}g Glu</span>
                </div>
                <button
                  type="button"
                  onClick={() => addMeal(dish.name, dish.calories, dish.proteins, dish.carbs, dish.lipids, dish.mealType)}
                  className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded-xl border border-blue-500/20 transition-all font-mono text-xs cursor-pointer hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* GROCERY CHECKLIST DETAILED BLOCK */}
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 blur-3xl rounded-full"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-900 mb-4">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ListChecks className="w-4.5 h-4.5 text-blue-400" /> Liste de Courses Intelligente IA
              </h3>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                Constituez votre coffre d'ingrédients physiologiques pour la semaine prochaine.
              </p>
            </div>

            <button
              onClick={removeCheckedGroceries}
              className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 hover:text-red-400 font-bold underline transition-colors cursor-pointer"
            >
              Éliminer les éléments cochés
            </button>
          </div>

          {/* ADD TO GROCERY FORM */}
          <form onSubmit={handleAddGrocery} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Ex: 500g Bœuf haché 5%, Shaker de Whey, Beurre de Cacahuète..."
              value={groceryInput}
              onChange={(e) => setGroceryInput(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-white font-sans font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-905 border border-zinc-800 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold transition font-mono uppercase cursor-pointer"
            >
              Ajouter
            </button>
          </form>

          {/* GROCERY RENDERING ITEMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
            <AnimatePresence>
              {groceries.map((item, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => toggleGrocery(idx)}
                  className={`py-3 px-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    item.checked
                      ? "bg-zinc-900/30 border-zinc-900/50 text-zinc-550 line-through"
                      : "bg-zinc-900/50 border-zinc-850 hover:bg-zinc-900/80 hover:border-zinc-800 text-white"
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    <span className="text-[8px] font-mono font-bold bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-850/40 uppercase mr-2 tracking-widest">
                      {item.tag || "IA"}
                    </span>
                    <span className="font-semibold text-[11px] font-sans">{item.title}</span>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    item.checked ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-700 bg-zinc-950"
                  }`}>
                    {item.checked && <Check className="w-3 h-3" strokeWidth={3} />}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
}
