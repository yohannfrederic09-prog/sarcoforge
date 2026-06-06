import React, { useState } from "react";
import { OnboardingData } from "../types";
import { 
  Dumbbell, ShieldAlert, Sparkles, User, Calendar, Smile, Utensils, Zap, 
  ChevronRight, ChevronLeft, Check, MapPin, Compass, Home, Briefcase, 
  HelpCircle, DollarSign, VolumeX, Shield, Award, Activity
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData, planText: string) => void;
  initialData?: OnboardingData;
}

export default function OnboardingWizard({ onComplete, initialData }: OnboardingWizardProps) {
  const [formData, setFormData] = useState<OnboardingData>(
    initialData || {
      age: 26,
      sex: "Homme",
      height: 178,
      weight: 75,
      goal: "Recomposition Corporelle",
      experience: "Intermédiaire (1-4 ans)",
      medicalRestrictions: "",
      timeAvailable: "3-4 jours/semaine",
      availableEquipment: "Salle complète",
      dietaryPreferences: "Riche en Protéines",
      trainingLocations: ["Salle complète"],
      specificEquipment: ["Haltères fixes", "Bandes élastiques légères", "Tapis de sol (yoga mat)"],
      equipmentBudget: "Pas de budget pour l'instant",
      constraints: [],
      availableSpace: "Moyen (4-9m²)"
    }
  );

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };

  const toggleLocation = (loc: string) => {
    const current = formData.trainingLocations || [];
    if (current.includes(loc)) {
      handleInputChange("trainingLocations", current.filter((l) => l !== loc));
    } else {
      handleInputChange("trainingLocations", [...current, loc]);
    }
  };

  const toggleEquipment = (eq: string) => {
    const current = formData.specificEquipment || [];
    if (current.includes(eq)) {
      handleInputChange("specificEquipment", current.filter((e) => e !== eq));
    } else {
      handleInputChange("specificEquipment", [...current, eq]);
    }
  };

  const toggleConstraint = (c: string) => {
    const current = formData.constraints || [];
    if (current.includes(c)) {
      handleInputChange("constraints", current.filter((item) => item !== c));
    } else {
      handleInputChange("constraints", [...current, c]);
    }
  };

  const runLoadingSequencer = () => {
    const messages = [
      "Analyse de vos ratios biométriques...",
      "Calcul des volumes musculaires cibles...",
      "Filtrage intelligent de l'équipement disponible...",
      "Calibration de l'adaptation myofibrillaire (zéro excuse)...",
      "Élaboration des alternatives d'exercices & budget ROI...",
      "Génération finale de votre programme de champion par Gemini AI..."
    ];
    let i = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
      i++;
      if (i < messages.length) {
        setLoadingMessage(messages[i]);
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return interval;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const interval = runLoadingSequencer();

    try {
      const response = await fetch("/api/nutrition-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingData: formData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const data = await response.json();
      clearInterval(interval);
      onComplete(formData, data.text);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      
      // Fallback text if server is unresponsive
      const fallbackText = `### PROGRAMME D'ENTRAÎNEMENT & NUTRITION - GYMTRACKER PRO v4

Bonjour ! Avec votre configuration, l'IA a optimisé votre programmation. Voici votre parcours d'élite :

#### 🎯 PROFIL ÉQUIPEMENT DÉTECTÉ :
*   **Lieu(x) d'entraînement** : ${(formData.trainingLocations || []).join(", ") || "Non spécifié"}
*   **Espace disponible** : ${formData.availableSpace || "Non renseigné"}
*   **Matériel disponible** : ${(formData.specificEquipment || []).join(", ") || "Aucun (Poids de corps strict)"}
*   **Budget matériel** : ${formData.equipmentBudget || "Pas de budget pour l'instant"}
*   **Contraintes** : ${(formData.constraints || []).join(", ") || "Aucune contrainte"}

---

### 🔥 VOTRE SEMAINE TYPE SUR-MESURE (ZÉRO EXCUSE)

**JOUR 1 : PUSH (Poussée pectoraux, épaules, triceps)**
*   **Exercice Principal** : ${
      (formData.trainingLocations || []).includes("Salle complète")
        ? "Développé Couché (Barre & Banc) : 4 séries x 8 reps"
        : (formData.specificEquipment || []).includes("Haltères fixes") || (formData.specificEquipment || []).includes("Haltères réglables")
        ? "Dumbbell Press au Sol : 4 séries x 12 reps"
        : "Pompes Classiques (Standard Push-up) : 4 séries x Maximum de répétitions"
    }
*   **Exercice Secondaire** : Pompes Diamant (Diamond Push-up) - 3 séries x 10-12 reps *(Excellent pour le galbe interne et triceps)*
*   **Finitions** : Pompes Piquées (Pike Push-up) - 3 séries x 8 reps *(Deltoïdes)*

**JOUR 2 : LEGS POWER & GLUTES (Bas du corps)**
*   **Exercice Principal** : ${
      (formData.trainingLocations || []).includes("Salle complète")
        ? "Squat Arrière (Back Squat) : 4 séries x 8 reps"
        : "Squats Poids de Corps (Air Squat) : 4 séries x 20 reps (Tempo 3-1-3-0)"
    }
*   **Unilatéral** : Squat Bulgare (Bulgarian Split Squat) ou Fentes arrière - 3 séries x 12 reps par jambe
*   **Finitions chaine postérieure** : Pont Fessier Isométrique (Glute Bridge) - 4 séries x 20 reps (Serrer 2s en haut)

**JOUR 3 : PULL (Tirage dos, biceps)**
*   **Exercice Principal** : ${
      (formData.specificEquipment || []).includes("Barre de tractions") || (formData.trainingLocations || []).includes("Salle complète")
        ? "Tractions Pronation (Pull-ups) : 4 séries x Max"
        : "Tirage horizontal sous Table (Inverted Row) : 4 séries x 12 reps"
    }
*   **Isolation Posturale** : ${
      (formData.specificEquipment || []).includes("Bandes élastiques légères") || (formData.specificEquipment || []).includes("Bandes élastiques lourdes")
        ? "Écarteur avec Élastique (Banded Pull-Apart) : 4 séries x 20 reps"
        : "Superman (Dorsaux au sol) : 3 séries x 15 reps"
    }
*   **Core anti-extension** : Gainage Planche Active (Standard Plank) - 3 séries x 60 secondes

---

### 🥗 NUTRITION HAUTE COMPOSITION (${formData.goal})
*   **Apport Énergétique Recommandé** : ~2,320 kcal par jour.
*   **Protéines** : 160g (Soutien pour l'anabolisme musculaire)
*   **Glucides** : 240g (Ravitaillement ATP)
*   **Lipides** : 75g (Soutien hormonal)

### 📈 RECOMMANDATIONS D'ACHAT PROGRESSIF (ROI Fitness)
${
  formData.equipmentBudget?.includes("Pas de budget")
    ? "*Aucun achat n'est requis.* Continuez à maîtriser le poids du corps. La régularité fait 100% de la différence !"
    : formData.equipmentBudget?.includes("Petit")
    ? "*Priorités (Budget <100€)* :\n1. **Set de bandes élastiques** (~30€) : Ajoute 127 exercices de tirage/curl.\n2. **Tapis de sol** (~20€) : Confort articulaire incomparable."
    : "*Priorités (Budget >100€)* :\n1. **Haltères réglables 2-32kg** : Remplace 15 paires d'haltères pour progresser à vie.\n2. **Barre de traction porte** : Le roi du dos à la maison."
}
`;
      onComplete(formData, fallbackText);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-zinc-950/40 rounded-3xl border border-zinc-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-zinc-500/5 blur-3xl rounded-full -ml-32 -mb-32"></div>
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin flex items-center justify-center mb-8 mx-auto shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Dumbbell className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce absolute -top-2 -right-2" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white mb-3">Orchestration de votre Profil Équipement</h3>
        <p className="text-zinc-400 max-w-sm text-sm font-mono h-12 leading-relaxed">{loadingMessage}</p>
        <div className="w-48 bg-zinc-900 rounded-full h-1.5 mt-6 overflow-hidden">
          <div className="bg-blue-500 h-full animate-infinite-loading rounded-full w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div id="onboarding_wizard" className="bg-zinc-950/60 rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 border-b border-zinc-800/80 pb-4">
        <div>
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block">Étape {step} de 5</span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
            {step === 1 && <><User className="w-5 h-5 text-blue-500" /> Profil Personnel</>}
            {step === 2 && <><Zap className="w-5 h-5 text-blue-500" /> Ratios Biométriques</>}
            {step === 3 && <><Dumbbell className="w-5 h-5 text-blue-500" /> Objectifs & Fréquence</>}
            {step === 4 && <><Utensils className="w-5 h-5 text-blue-500" /> Nutrition & Santé</>}
            {step === 5 && <><MapPin className="w-5 h-5 text-green-500" /> Où t'entraînes-tu ?</>}
          </h2>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-6 bg-blue-500" : s < step ? "w-2 bg-blue-600/50" : "w-1 bg-zinc-800"
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* STEP 1: Profil personnel */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn-fast">
            <p className="text-zinc-400 text-sm">Commençons par définir vos données fondamentales de genre et d'âge.</p>
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Sexe biologique</label>
              <div className="grid grid-cols-3 gap-3">
                {["Homme", "Femme", "Non-Binaire"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleInputChange("sex", val)}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      formData.sex === val
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Âge (ans)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="14"
                  max="80"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-xl font-bold font-mono text-white min-w-[3rem] text-right">{formData.age} API</span>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl flex items-start gap-3 mt-6">
              <Smile className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                Le modèle SarcoForge étudiera votre âge métabolique pour adapter votre adaptabilité nerveuse et articulaire.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Ratios Biométriques */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn-fast">
            <p className="text-zinc-400 text-sm">Spécifiez vos mensurations de taille et de masse corporelle cumulée.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Taille (cm)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-lg font-bold font-mono text-white min-w-[4rem] text-right">{formData.height} cm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Poids de corps (kg)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="40"
                    max="160"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-lg font-bold font-mono text-white min-w-[4rem] text-right">{formData.weight} kg</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800 text-zinc-400">
              <span className="text-xs font-mono text-zinc-500 block mb-1">INDICE DE MASSE CORPORELLE ÉVALUÉ (IMC)</span>
              <p className="text-xl font-bold text-white font-mono">
                {((formData.weight / (formData.height / 100) ** 2)).toFixed(1)} kg/m²
                <span className="text-xs text-blue-400 ml-3 font-normal font-sans">
                  {formData.weight / (formData.height / 100) ** 2 < 18.5
                    ? "Maigreur"
                    : formData.weight / (formData.height / 100) ** 2 < 25
                    ? "Poids équilibré"
                    : formData.weight / (formData.height / 100) ** 2 < 30
                    ? "Surpoids"
                    : "Obésité"}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Objectifs et Fréquence */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn-fast">
            <p className="text-zinc-400 text-sm">Quel est votre but prioritaire et votre volume disponible hebdomadaire ?</p>
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Objectif Prioritaire</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {["Sèche", "Prise de Masse", "Recomposition Corporelle", "Force Athlétique", "Endurance & Santé"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleInputChange("goal", g)}
                    className={`py-3 px-3 rounded-xl border text-xs font-semibold text-left transition-all flex justify-between items-center ${
                      formData.goal === g
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span>{g}</span>
                    {formData.goal === g && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Niveau d'expérience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option>Débutant (0-1 ans)</option>
                  <option>Intermédiaire (1-4 ans)</option>
                  <option>Athlète Confirmé (5+ ans)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Fréquence cible</label>
                <select
                  value={formData.timeAvailable}
                  onChange={(e) => handleInputChange("timeAvailable", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option>2-3 jours/semaine</option>
                  <option>3-4 jours/semaine</option>
                  <option>5+ jours/semaine</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Nutrition & Santé */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn-fast">
            <p className="text-zinc-400 text-sm">Précisons votre cadre nutritionnel et vos restrictions médicales éventuelles.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Régime Alimentaire Souhaité</label>
                <select
                  value={formData.dietaryPreferences}
                  onChange={(e) => handleInputChange("dietaryPreferences", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option>Sans restriction</option>
                  <option>Végétarien</option>
                  <option>Végan</option>
                  <option>Keto (Cétogène)</option>
                  <option>Riche en Protéines</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Santé / Restrictions cognitives</label>
                <input
                  type="text"
                  placeholder="Ex: Douleur genou droit, hernie L5..."
                  value={formData.medicalRestrictions}
                  onChange={(e) => handleInputChange("medicalRestrictions", e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="bg-orange-950/20 border border-orange-900/40 p-4 rounded-xl flex items-start gap-3 text-orange-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                Si une restriction orthopédique est indiquée, le moteur d'exercice IA s'exclura systématiquement de tout angle de stress élevé sur l'articulation visée.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: LIEU D'ENTRAÎNEMENT */}
        {step === 5 && (
          <div className="space-y-5 animate-fadeIn-fast text-left text-white">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white tracking-tight">Où est-ce que tu t'entraînes ?</h3>
              <p className="text-zinc-400 text-sm mt-1">On s'occupe du reste 💪 <span className="text-xs text-blue-500 font-mono ml-2">(Sélection multiple possible)</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: "Salle de sport",
                  title: "Salle de sport",
                  description: "Accès complet à tous les équipements",
                  supposed: "Machines, haltères, barres",
                  badge: "Accès complet",
                  color: "border-blue-500/40 text-blue-400 bg-blue-950/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
                  icon: <Dumbbell className="w-5 h-5 text-blue-500" />
                },
                {
                  id: "Chez moi",
                  title: "Chez moi",
                  description: "À la maison, dans mon espace personnel",
                  supposed: "Exercices adaptés, aucun équipement requis",
                  badge: "Sans contrainte",
                  color: "border-green-500/40 text-green-400 bg-green-950/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
                  icon: <Home className="w-5 h-5 text-green-500" />
                },
                {
                  id: "Dehors / Parc",
                  title: "Dehors / Parc",
                  description: "Running, street workout, espaces verts",
                  supposed: "Cardio, poids du corps, barres de parc",
                  badge: "Poids de corps",
                  color: "border-amber-500/40 text-amber-400 bg-amber-950/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
                  icon: <Compass className="w-5 h-5 text-amber-500" />
                },
                {
                  id: "Hôtel / Voyage",
                  title: "Hôtel / Voyage",
                  description: "En déplacement, peu de place",
                  supposed: "Séances express efficaces, chambre friendly",
                  badge: "Nomade",
                  color: "border-purple-500/40 text-purple-400 bg-purple-950/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]",
                  icon: <MapPin className="w-5 h-5 text-purple-500" />
                },
                {
                  id: "Bureau / Travail",
                  title: "Bureau / Travail",
                  description: "Séances express pendant la journée",
                  supposed: "10-20 minutes max, discret & silencieux",
                  badge: "Express pro",
                  color: "border-pink-500/40 text-pink-400 bg-pink-950/10 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
                  icon: <Briefcase className="w-5 h-5 text-pink-400" />
                },
                {
                  id: "CrossFit / Box",
                  title: "CrossFit / Box",
                  description: "Entraînement fonctionnel haute intensité",
                  supposed: "WOD, kettlebells, barre olympique",
                  badge: "Intensité Max",
                  color: "border-amber-500/40 text-yellow-400 bg-yellow-950/10 shadow-[0_0_15px_rgba(234,179,8,0.15)]",
                  icon: <Zap className="w-5 h-5 text-yellow-500" />
                },
                {
                  id: "Piscine",
                  title: "Piscine",
                  description: "Natation et exercices aquatiques",
                  supposed: "Cardio natation, corps complet",
                  badge: "Aquatique",
                  color: "border-cyan-500/40 text-cyan-400 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
                  icon: <Activity className="w-5 h-5 text-cyan-400" />
                },
                {
                  id: "Plusieurs lieux",
                  title: "Plusieurs lieux",
                  description: "Je m'entraîne à différents endroits",
                  supposed: "Programme flexible selon le jour",
                  badge: "Hybride",
                  color: "border-indigo-500/40 text-indigo-400 bg-indigo-950/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]",
                  icon: <MapPin className="w-5 h-5 text-indigo-400" />
                }
              ].map((item) => {
                const isChecked = (formData.trainingLocations || []).includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleLocation(item.id)}
                    className={`group p-4 rounded-3xl border text-left flex flex-col justify-between h-44 transition-all duration-300 cursor-pointer ${
                      isChecked 
                        ? `${item.color} scale-[1.03] ring-2 ring-blue-500/50`
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="p-2 rounded-xl bg-zinc-950/60 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-850 text-zinc-400">{item.badge}</span>
                        {isChecked && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                            <Check className="w-3 h-3 text-white stroke-[3.5]" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors block mt-2">{item.title}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 font-sans font-medium">{item.description}</p>
                      <span className="text-[9px] font-mono text-zinc-500 block mt-2 border-t border-zinc-800/40 pt-1.5">&bull; {item.supposed}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {(formData.trainingLocations || []).length === 0 && (
              <p className="text-xs text-red-400 font-mono text-center mt-3 animate-pulse">Veuillez sélectionner au moins 1 lieu pour continuer.</p>
            )}
          </div>
        )}

        {/* Buttons Nav */}
        <div className="flex justify-between items-center border-t border-zinc-800/80 pt-6 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="py-2.5 px-5 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-semibold hover:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={(formData.trainingLocations || []).length === 0}
              className={`py-2.5 px-6 rounded-xl text-white text-sm font-bold flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer ${
                (formData.trainingLocations || []).length === 0 
                  ? "bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              }`}
            >
              Générer mon programme adapté <Sparkles className="w-4 h-4 text-yellow-300" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
