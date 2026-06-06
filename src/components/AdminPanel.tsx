import React, { useState } from "react";
import { Exercise } from "../types";
import { EXERCISE_DATABASE } from "../data/exercises";
import { Shield, PlusCircle, AlertCircle, BarChart3, Users, DollarSign, Activity, FileText } from "lucide-react";

export default function AdminPanel() {
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISE_DATABASE);
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState("Pectoraux");
  const [newExEquip, setNewExEquip] = useState("Barre");
  const [newExDiff, setNewExDiff] = useState<"Débutant" | "Intermédiaire" | "Avancé">("Intermédiaire");

  // Mock operational kpi logs
  const stats = [
    { title: "Monthly Recurring Revenue (MRR)", value: "124,530 $", change: "+14.2% ce mois", icon: <DollarSign className="w-5 h-5 text-emerald-400" /> },
    { title: "Utilisateurs Actifs Planifiés (SaaS)", value: "849,203", change: "+4.5K aujourd'hui", icon: <Users className="w-5 h-5 text-blue-400" /> },
    { title: "Active Server Nodes (AWS ECS)", value: "14 Nodes Online", change: "Ping moyen 14ms", icon: <Activity className="w-5 h-5 text-indigo-400" /> },
    { title: "Demandes de Support Clientes", value: "8 Tickets en attente", change: "Temps de rép: 8m", icon: <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" /> },
  ];

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const freshEx: Exercise = {
      id: `ex_custom_${Date.now()}`,
      name: newExName,
      description: "Exercice inséré manuellement par la console d'administration de SarcoForge.",
      difficulty: newExDiff,
      primaryMuscle: newExMuscle,
      secondaryMuscles: ["Abdominaux"],
      equipment: newExEquip,
      instructions: ["Commencez proprement.", "Réalisez l'exercice.", "Contrôlez l'extension et le tempo."],
      tips: ["Conservez le dos neutre."],
      commonMistakes: ["Utiliser de l'élan pour tricher la trajectoire."],
    };

    setExercises((prev) => [...prev, freshEx]);
    setNewExName("");
    alert(`Nouvel exercice '${newExName}' enregistré avec succès dans le back-office !`);
  };

  return (
    <div className="space-y-8 animate-fadeIn-fast">
      {/* Visual Operational Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-zinc-950/40 border border-zinc-850 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between h-36 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full"></div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="text-[10px] font-mono tracking-wider uppercase">{stat.title}</span>
              {stat.icon}
            </div>
            <div className="mt-2 text-2xl font-black text-white font-mono">{stat.value}</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Content Publisher panel: Exercises lists */}
        <div className="lg:col-span-7 bg-zinc-950/40 border border-zinc-805 rounded-3xl p-5 md:p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3.5 border-b border-zinc-900 mb-4 flex items-center gap-1.5 font-sans">
            <FileText className="w-4.5 h-4.5 text-blue-500" /> Gestionnaire d'Exercices en Base de Données
          </h3>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {exercises.map((ex) => (
              <div key={ex.id} className="bg-zinc-900/30 border border-zinc-900 p-3.5 rounded-2xl flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{ex.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-500">ID: {ex.id} &bull; {ex.primaryMuscle} &bull; {ex.equipment}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                    ex.difficulty === "Débutant" ? "bg-green-500/15 text-green-400" :
                    ex.difficulty === "Intermédiaire" ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-400"
                  }`}>
                    {ex.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action item insert new workout */}
        <div className="lg:col-span-5 bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-900 mb-4 flex items-center gap-1.5">
            <PlusCircle className="w-4.5 h-4.5 text-blue-400" /> Insérer un Exercice Professionnel
          </h3>

          <form onSubmit={handleAddExercise} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-zinc-500 uppercase text-[10px] block mb-1">Dénomination de l'exercice</label>
              <input
                type="text"
                placeholder="Ex: Curl Marteau haltères, Dips lestés..."
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-500 uppercase text-[10px] block mb-1">Muscle Cible</label>
                <select
                  value={newExMuscle}
                  onChange={(e) => setNewExMuscle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-2 px-1 focus:outline-none focus:border-blue-500"
                >
                  <option>Pectoraux</option>
                  <option>Dorsaux</option>
                  <option>Épaules / Deltoïdes</option>
                  <option>Quadriceps</option>
                  <option>Ischio-jambiers / Fessiers</option>
                  <option>Biceps / Triceps</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-500 uppercase text-[10px] block mb-1">Matériel Requis</label>
                <select
                  value={newExEquip}
                  onChange={(e) => setNewExEquip(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-2 px-1 focus:outline-none focus:border-blue-500"
                >
                  <option>Haltères</option>
                  <option>Barre olympique</option>
                  <option>Poulie réglable</option>
                  <option>Poids de corps</option>
                  <option>Bâche de rack</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-500 uppercase text-[10px] block mb-1">Complexité technique / Difficulté</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["Débutant", "Intermédiaire", "Avancé"].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setNewExDiff(diff as any)}
                    className={`py-2 px-1.5 rounded-lg border text-[10px] font-bold text-center transition-all ${
                      newExDiff === diff
                        ? "bg-blue-600/10 text-blue-400 border-blue-500"
                        : "bg-zinc-900 border-zinc-850 text-zinc-500 hover:border-zinc-800"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newExName.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer mt-4 disabled:opacity-40"
            >
              Publier l'Exercice en Prod
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
