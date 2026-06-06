import React, { useState } from "react";
import { NutritionLog } from "../types";
import { Plus, Trash2, Camera, Scale, Apple, Check, ListChecks, RefreshCw, Zap, Sparkles, AlertCircle } from "lucide-react";

interface NutritionHubProps {
  onMacrosUpdated: (calories: number, protein: number, carbs: number, lipids: number) => void;
}

export default function NutritionHub({ onMacrosUpdated }: NutritionHubProps) {
  // Configurable Target values
  const targets = {
    calories: 2350,
    proteins: 160,
    carbs: 230,
    lipids: 75,
    water: 3.0,
  };

  const [meals, setMeals] = useState<NutritionLog[]>([
    {
      id: "meal_0",
      name: "Bol d'Avoine Protéiné & Myrtilles",
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
  ]);

  // Scanner Simulator States
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{ name: string; cal: number; prot: number; carb: number; lip: number } | null>(null);

  // Manual Input Form State
  const [newMealName, setNewMealName] = useState("");
  const [newMealCal, setNewMealCal] = useState<number>(300);
  const [newMealProt, setNewMealProt] = useState<number>(20);
  const [newMealCarb, setNewMealCarb] = useState<number>(35);
  const [newMealLip, setNewMealLip] = useState<number>(8);
  const [newMealType, setNewMealType] = useState<"Petit-déjeuner" | "Déjeuner" | "Dîner" | "Encas">("Encas");

  // Water tracking
  const [waterCups, setWaterCups] = useState(4); // 4 cups = 1L (0.25L each)

  // Pre-saved dishes
  const preSavedDishes = [
    {
      name: "Omelette Anabolique (3 œufs + Blancs)",
      calories: 320,
      proteins: 30,
      carbs: 2,
      lipids: 22,
      mealType: "Petit-déjeuner" as const,
    },
    {
      name: "Sauté de Blanc Poids Plume (Poulet / Brocoli)",
      calories: 410,
      proteins: 44,
      carbs: 15,
      lipids: 8,
      mealType: "Déjeuner" as const,
    },
    {
      name: "Shaker Isolat Whey + Banane Post-Workout",
      calories: 270,
      proteins: 27,
      carbs: 32,
      lipids: 1,
      mealType: "Encas" as const,
    },
    {
      name: "Steak de Boeuf Maigre 5% & Patate Douce",
      calories: 590,
      proteins: 42,
      carbs: 65,
      lipids: 12,
      mealType: "Dîner" as const,
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

    const updatedMeals = [...meals, freshMeal];
    setMeals(updatedMeals);
    onMacrosUpdated(cal, prot, carb, lip);
  };

  const removeMeal = (id: string) => {
    const target = meals.find((m) => m.id === id);
    if (target) {
      // Subtract macros
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

  const triggerBarcodeScanner = () => {
    setScanning(true);
    setScannedResult(null);
    setTimeout(() => {
      // Simulate real laser detection after 2 seconds
      setScannedResult({
        name: "Yogourt Grec Bio Enrichi en Caséine",
        cal: 150,
        prot: 18,
        carb: 6,
        lip: 4,
      });
      setScanning(false);
    }, 2200);
  };

  const acceptScannedResult = () => {
    if (scannedResult) {
      addMeal(scannedResult.name, scannedResult.cal, scannedResult.prot, scannedResult.carb, scannedResult.lip, "Encas");
      setScannedResult(null);
    }
  };

  // Sums calculations
  const totalCal = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProt = meals.reduce((acc, m) => acc + m.proteins, 0);
  const totalCarb = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalLip = meals.reduce((acc, m) => acc + m.lipids, 0);
  const totalWater = waterCups * 0.25;

  // Grocery list
  const groceryItems = [
    { title: "Blancs de poulet fermier bio", checked: false },
    { title: "Pavés de saumon frais sauvage", checked: true },
    { title: "Flocons d'avoine complets sans gluten", checked: false },
    { title: "Riz basmati parfumé", checked: true },
    { title: "Œufs entiers plein air (poules élevées en liberté)", checked: false },
    { title: "Patates douces maraîchères", checked: false },
    { title: "Brocolis et asperges de saison", checked: false },
  ];

  const [groceries, setGroceries] = useState(groceryItems);

  const toggleGrocery = (idx: number) => {
    setGroceries((prev) => prev.map((item, i) => (i === idx ? { ...item, checked: !item.checked } : item)));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Visual Macro Progress Ring & Overview */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Scale className="w-4.5 h-4.5 text-blue-500" /> Bilan Énergétique
          </h3>

          {/* Large Ring mockup represented dynamically */}
          <div className="flex flex-col items-center py-4">
            <div className="w-36 h-36 rounded-full border-8 border-zinc-900 flex flex-col items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 rounded-full border-8 border-t-blue-500 border-r-indigo-500 border-b-indigo-400 border-l-transparent animate-spin-slow pointer-events-none"></div>
              <span className="text-2xl font-black text-white font-mono">{totalCal}</span>
              <span className="text-[10px] text-zinc-500 font-mono">sur {targets.calories} kcal</span>
            </div>
            <div className="text-center mt-4">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                totalCal > targets.calories ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
              }`}>
                {totalCal > targets.calories
                  ? `Dépassement de ${totalCal - targets.calories} kcal`
                  : `Encore ${targets.calories - totalCal} kcal de disponibles`}
              </span>
            </div>
          </div>

          {/* Small bars of sub-elements */}
          <div className="space-y-3.5 mt-2">
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                <span>Protéines</span>
                <span>{totalProt}g / {targets.proteins}g</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalProt / targets.proteins) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                <span>Glucides</span>
                <span>{totalCarb}g / {targets.carbs}g</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalCarb / targets.carbs) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                <span>Lipides</span>
                <span>{totalLip}g / {targets.lipids}g</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalLip / targets.lipids) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Water tracking widget */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-400" /> Hydratation Cellulaire
          </h3>
          <p className="text-xs text-zinc-500 mb-4">Visez un apport régulier en cours de journée pour conserver vos capacités d'élimination urique.</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: 12 }).map((_, i) => {
              const active = i < waterCups;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setWaterCups(i + 1)}
                  className={
                    active
                      ? "w-8 h-10 rounded-lg flex flex-col items-center justify-between py-1 border bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                      : "w-8 h-10 rounded-lg flex flex-col items-center justify-between py-1 border bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                  }
                >
                  <span className="text-[8px] font-mono font-bold">{i + 1}</span>
                  <div className={active ? "w-3 h-3 rounded-sm bg-blue-400" : "w-3 h-3 rounded-sm bg-zinc-800"} />
                </button>
              );
            })}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">Total consommé :</span>
            <span className="text-white font-bold">{totalWater.toFixed(2)}L / {targets.water}L</span>
          </div>
        </div>
      </div>

      {/* Roster lists, scan and customized entry */}
      <div className="lg:col-span-8 space-y-6">
        {/* barcode/OCR scanner simulator block */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4.5 h-4.5 text-blue-400" /> Analyseur Code-Barres & OCR Mobile
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Prenez en photo une étiquette d'ingrédient ou scannez un emballage produit.</p>
            </div>
            <button
              type="button"
              onClick={triggerBarcodeScanner}
              disabled={scanning}
              className="py-2 px-4 rounded-xl border border-blue-500 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold font-mono transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Scan Laser en cours..." : "Lancer le Scanner IA"}
            </button>
          </div>

          {/* scanner frame mockup */}
          {scanning && (
            <div className="h-40 bg-zinc-900/60 rounded-2xl border border-zinc-800 mt-4 overflow-hidden relative flex items-center justify-center animate-pulse">
              <div className="absolute left-4 right-4 h-0.5 bg-red-500 animate-slide-scan shadow-[0_0_10px_#ef4444]"></div>
              <div className="absolute inset-0 border-[2px] border-dashed border-blue-500/20 m-3 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] font-mono text-blue-400 bg-zinc-950 px-2 py-0.5 rounded-full">ALIGNER LE CODE PRODUCT</span>
              </div>
              <Scale className="w-10 h-10 text-zinc-700 animate-bounce" />
            </div>
          )}

          {scannedResult && !scanning && (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn-fast">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded uppercase font-mono">DÉTECTION MATCH</span>
                  <h4 className="text-xs font-bold text-white">{scannedResult.name}</h4>
                </div>
                <div className="flex gap-4 font-mono text-[10px] text-zinc-400 pt-1.5">
                  <span>Protéines: <strong className="text-blue-400">{scannedResult.prot}g</strong></span>
                  <span>Glucides: <strong className="text-indigo-400">{scannedResult.carb}g</strong></span>
                  <span>Lipides: <strong className="text-yellow-500">{scannedResult.lip}g</strong></span>
                  <span>Total: <strong className="text-white">{scannedResult.cal} kcal</strong></span>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setScannedResult(null)}
                  className="py-1.5 px-3 rounded-lg border border-zinc-800 text-zinc-500 text-xs font-semibold hover:bg-zinc-900 transition-all flex-1 md:flex-none"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={acceptScannedResult}
                  className="py-1.5 px-3.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 flex-1 md:flex-none"
                >
                  <Plus className="w-3.5 h-3.5" /> Enregistrer au Journal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pre-saved quick dishes */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Apple className="w-4.5 h-4.5 text-blue-500 animate-pulse" /> Repas Prédéfinis d'Athlètes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {preSavedDishes.map((dish, i) => (
              <div
                key={i}
                className="bg-zinc-900/30 border border-zinc-800/80 p-3.5 rounded-2xl flex justify-between items-center hover:bg-zinc-900/60 transition-all"
              >
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 block mb-0.5">{dish.mealType}</span>
                  <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{dish.name}</h4>
                  <span className="text-[10px] font-mono text-blue-400 block mt-0.5">{dish.calories} kcal &bull; {dish.proteins}g Prot</span>
                </div>
                <button
                  type="button"
                  onClick={() => addMeal(dish.name, dish.calories, dish.proteins, dish.carbs, dish.lipids, dish.mealType)}
                  className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded-xl border border-blue-500/20 transition-all font-mono text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* logged items and manual food entries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* logged list block */}
          <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md max-h-[350px] overflow-y-auto">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-900 mb-3 block">Journal du jour</h3>
            <div className="space-y-3.5">
              {meals.map((meal) => (
                <div key={meal.id} className="flex justify-between items-center gap-3 bg-zinc-900/20 border border-zinc-900 px-3.5 py-2.5 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{meal.name}</h4>
                    <span className="text-[9px] font-mono text-zinc-500">{meal.time} &bull; {meal.mealType}</span>
                    <div className="flex gap-2 text-[9px] font-mono text-zinc-400 mt-1">
                      <span>P: <strong className="text-blue-400">{meal.proteins}g</strong></span>
                      <span>G: <strong className="text-indigo-400">{meal.carbs}g</strong></span>
                      <span>L: <strong className="text-yellow-600">{meal.lipids}g</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white font-mono">{meal.calories} kcal</span>
                    <button
                      type="button"
                      onClick={() => removeMeal(meal.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {meals.length === 0 && (
                <div className="text-center py-12 text-zinc-600 text-xs">Aucun repas loggé aujourd'hui. Ajoutez-en un !</div>
              )}
            </div>
          </div>

          {/* manual food entry block */}
          <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-900 mb-3 block">Enregistrer un aliment</h3>
            <form onSubmit={handleManualAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-500 uppercase text-[10px] block mb-1">Nom du plat</label>
                <input
                  type="text"
                  placeholder="Ex: Riz Basmati Bio, Escalope de Dinde..."
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-500 uppercase text-[10px] block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={newMealCal}
                    onChange={(e) => setNewMealCal(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 uppercase text-[10px] block mb-1">Catégorie</label>
                  <select
                    value={newMealType}
                    onChange={(e) => setNewMealType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-2 px-1 focus:outline-none focus:border-blue-500 text-xs"
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
                  <label className="text-zinc-500 uppercase text-[10px] block mb-1">Prot (g)</label>
                  <input
                    type="number"
                    value={newMealProt}
                    onChange={(e) => setNewMealProt(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-1.5 px-2 focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 uppercase text-[10px] block mb-1">Glu (g)</label>
                  <input
                    type="number"
                    value={newMealCarb}
                    onChange={(e) => setNewMealCarb(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-1.5 px-2 focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 uppercase text-[10px] block mb-1">Lip (g)</label>
                  <input
                    type="number"
                    value={newMealLip}
                    onChange={(e) => setNewMealLip(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-1.5 px-2 focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newMealName.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-sans cursor-pointer transition-all disabled:opacity-40"
              >
                Ajouter au Journal
              </button>
            </form>
          </div>
        </div>

        {/* Grocery automatic Checklist */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ListChecks className="w-4.5 h-4.5 text-blue-400" /> Liste de Courses Intelligente IA
          </h3>
          <p className="text-xs text-zinc-500 mb-4">Générée automatiquement d'après vos préférences de diet et objectifs nutritionnels.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {groceries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleGrocery(idx)}
                className={`py-2 px-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  item.checked
                    ? "bg-zinc-900/30 border-zinc-900 text-zinc-500 line-through"
                    : "bg-zinc-900 hover:bg-zinc-900/80 border-zinc-800 text-white cursor-pointer"
                }`}
              >
                <span>{item.title}</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  item.checked ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-700"
                }`}>
                  {item.checked && <Check className="w-3 h-3" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
