import React, { useState } from "react";
import { AnalyticsDataPoint } from "../types";
import { 
  Calendar, TrendingUp, Sparkles, Scale, Percent, Dumbbell, Zap, 
  PlaySquare, Heart, Moon, ShieldAlert, Sliders, RefreshCw, Unlink, Link2, CheckCircle2 
} from "lucide-react";

interface AdvancedAnalyticsProps {
  dataPoints: AnalyticsDataPoint[];
}

export default function AdvancedAnalytics({ dataPoints }: AdvancedAnalyticsProps) {
  const [selectedChartType, setSelectedChartType] = useState<"weight" | "fat" | "strength">("weight");
  
  // Interactive Wearable integration states
  const [wearableConnected, setWearableConnected] = useState(false);
  const [activeWearable, setActiveWearable] = useState<"whoop" | "oura" | null>(null);
  const [hrvValue, setHrvValue] = useState(74); // ms
  const [sleepQuality, setSleepQuality] = useState(88); // %
  const [readinessScore, setReadinessScore] = useState(91); // %
  const [isSyncingWearable, setIsSyncingWearable] = useState(false);

  // AI Periodization states
  const [macrocycleGoal, setMacrocycleGoal] = useState<"hypertrophy" | "strength" | "peaking">("hypertrophy");
  const [volumeSlider, setVolumeSlider] = useState(75); // %
  const [intensitySlider, setIntensitySlider] = useState(80); // %
  const [cycleWeeks, setCycleWeeks] = useState(12);

  // Sample data points if initial is low
  const basePoints: AnalyticsDataPoint[] = dataPoints.length >= 4 ? dataPoints : [
    { date: "Jan", weight: 79.5, muscleMass: 35.1, bodyFatPercentage: 19.5, benchPressMax: 85, squatMax: 110, deadliftMax: 130 },
    { date: "Fév", weight: 78.4, muscleMass: 35.3, bodyFatPercentage: 18.2, benchPressMax: 90, squatMax: 115, deadliftMax: 135 },
    { date: "Mar", weight: 77.2, muscleMass: 35.6, bodyFatPercentage: 16.9, benchPressMax: 92, squatMax: 120, deadliftMax: 140 },
    { date: "Avr", weight: 76.1, muscleMass: 35.9, bodyFatPercentage: 15.6, benchPressMax: 95, squatMax: 125, deadliftMax: 145 },
    { date: "Mai", weight: 75.2, muscleMass: 36.2, bodyFatPercentage: 14.5, benchPressMax: 100, squatMax: 130, deadliftMax: 155 },
    { date: "Juin", weight: 75.0, muscleMass: 36.5, bodyFatPercentage: 13.8, benchPressMax: 102, squatMax: 135, deadliftMax: 160 },
  ];

  // Helper to extract values
  const getValuesForType = () => {
    switch (selectedChartType) {
      case "fat":
        return {
          title: "Masse Grasse (%)",
          color: "#f59e0b",
          yMin: 10,
          yMax: 22,
          suffix: "%",
          icon: <Percent className="w-5 h-5 text-amber-500 animate-pulse" />,
          data: basePoints.map((p) => ({ label: p.date, value: p.bodyFatPercentage })),
        };
      case "strength":
        return {
          title: "Force 1RM Développé Couché (kg)",
          color: "#3b82f6",
          yMin: 70,
          yMax: 120,
          suffix: " kg",
          icon: <Dumbbell className="w-5 h-5 text-blue-500 animate-pulse" />,
          data: basePoints.map((p) => ({ label: p.date, value: p.benchPressMax })),
        };
      default:
        return {
          title: "Évolution du Poids Corporel (kg)",
          color: "#ef4444",
          yMin: 70,
          yMax: 82,
          suffix: " kg",
          icon: <Scale className="w-5 h-5 text-rose-500 animate-pulse" />,
          data: basePoints.map((p) => ({ label: p.date, value: p.weight })),
        };
    }
  };

  const chartMeta = getValuesForType();

  // SVG Coordinates calculations
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const pointsCount = chartMeta.data.length;

  const svgCoordinates = chartMeta.data.map((point, idx) => {
    const x = paddingX + (idx / (pointsCount - 1)) * chartWidth;
    const valueRatio = (point.value - chartMeta.yMin) / (chartMeta.yMax - chartMeta.yMin);
    const y = height - paddingY - valueRatio * chartHeight;
    return { x, y, value: point.value, label: point.label };
  });

  const pathD = svgCoordinates.map((coord, idx) => {
    return `${idx === 0 ? "M" : "L"} ${coord.x} ${coord.y}`;
  }).join(" ");

  const areaD = `
    ${pathD}
    L ${svgCoordinates[pointsCount - 1].x} ${height - paddingY}
    L ${svgCoordinates[0].x} ${height - paddingY}
    Z
  `;

  // Handles wearable sync visualization
  const syncWearableData = () => {
    setIsSyncingWearable(true);
    setTimeout(() => {
      setIsSyncingWearable(false);
      setHrvValue(65 + Math.round(Math.random() * 25));
      setSleepQuality(75 + Math.round(Math.random() * 21));
      setReadinessScore(80 + Math.round(Math.random() * 19));
    }, 1200);
  };

  const handleConnectWearable = (brand: "whoop" | "oura") => {
    setIsSyncingWearable(true);
    setTimeout(() => {
      setIsSyncingWearable(false);
      setWearableConnected(true);
      setActiveWearable(brand);
      if (brand === "whoop") {
        setHrvValue(82);
        setSleepQuality(92);
        setReadinessScore(95);
      } else {
        setHrvValue(72);
        setSleepQuality(85);
        setReadinessScore(88);
      }
    }, 1500);
  };

  const disconnectWearable = () => {
    setWearableConnected(false);
    setActiveWearable(null);
  };

  // Compute calculated forecasting results from periodization parameters
  const calculateHypertrophyForecast = () => {
    const ratioVal = (volumeSlider * 0.4) + (intensitySlider * 0.6);
    let expectedGain = 0;
    let systemStagnation = 0;
    
    if (macrocycleGoal === "hypertrophy") {
      expectedGain = (ratioVal / 100) * 1.8 * (cycleWeeks / 12);
      systemStagnation = volumeSlider > 85 && intensitySlider > 85 ? 42 : 12;
    } else if (macrocycleGoal === "strength") {
      expectedGain = (ratioVal / 100) * 1.2 * (cycleWeeks / 12); // gains as muscle mass
      systemStagnation = volumeSlider < 40 ? 38 : 15;
    } else {
      expectedGain = (ratioVal / 100) * 0.5 * (cycleWeeks / 12);
      systemStagnation = volumeSlider > 70 ? 65 : 8;
    }

    return {
      muscleGain: expectedGain.toFixed(2),
      stagnationRisk: systemStagnation,
      neurologicalAdaptation: ((intensitySlider * 1.4) + (volumeSlider * 0.2)).toFixed(0)
    };
  };

  const forecast = calculateHypertrophyForecast();

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart Panel */}
        <div className="lg:col-span-8 bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 md:p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-900 mb-6">
            <div className="flex items-center gap-3">
              {chartMeta.icon}
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{chartMeta.title}</h3>
                <p className="text-[10px] font-mono text-zinc-500">Mise à jour en temps réel d'après vos logs actifs</p>
              </div>
            </div>

            {/* Toggle buttons */}
            <div className="flex gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setSelectedChartType("weight")}
                className={`text-[10px] uppercase font-mono px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedChartType === "weight" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Poids
              </button>
              <button
                onClick={() => setSelectedChartType("fat")}
                className={`text-[10px] uppercase font-mono px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedChartType === "fat" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Grasse %
              </button>
              <button
                onClick={() => setSelectedChartType("strength")}
                className={`text-[10px] uppercase font-mono px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedChartType === "strength" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                1RM Force
              </button>
            </div>
          </div>

          {/* Custom SVG Area chart with gradients */}
          <div className="w-full h-56 relative my-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartMeta.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={chartMeta.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {Array.from({ length: 4 }).map((_, i) => {
                const rectY = paddingY + (i / 3) * chartHeight;
                const labelVal = Math.round(chartMeta.yMax - (i / 3) * (chartMeta.yMax - chartMeta.yMin));
                return (
                  <g key={i} className="opacity-40">
                    <line
                      x1={paddingX}
                      y1={rectY}
                      x2={width - paddingX}
                      y2={rectY}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={rectY + 4}
                      fill="#4b5563"
                      fontSize="9px"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Area */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Path line */}
              <path d={pathD} fill="none" stroke={chartMeta.color} strokeWidth="2" strokeLinecap="round" />

              {/* Coordinates markers */}
              {svgCoordinates.map((coord, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="4"
                    fill="#0a0a0a"
                    stroke={chartMeta.color}
                    strokeWidth="2.5"
                    className="hover:scale-125 duration-100 transition-all"
                  />
                  <text
                    x={coord.x}
                    y={coord.y - 12}
                    fill="#fff"
                    fontSize="9px"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {coord.value}{chartMeta.suffix}
                  </text>
                  <text
                    x={coord.x}
                    y={height - paddingY + 14}
                    fill="#6b7280"
                    fontSize="9px"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {coord.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="bg-zinc-900/40 p-3.5 border border-zinc-900 rounded-2xl flex items-start gap-3 mt-4">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-normal font-sans">
              <strong>Analyse de tendance :</strong> Votre progression affiche une linéarité ascendante saine. Le coefficient de tension athlétique et d'adaptation neurologique est évalué à +1.4% d'efficacité par cycle hebdomadaire.
            </p>
          </div>
        </div>

        {/* AI Intelligence predictions panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col h-full justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none"></div>

            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">Algorithme prédictif</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4.5 h-4.5 text-yellow-500" /> Prévisions Physiques IA
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1 leading-normal">Estimation calculée par l'IA d'après votre volume et l'historique d'entraînement hebdomadaire.</p>
            </div>

            <div className="space-y-4 my-6">
              <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Atteinte de l'Objectif</span>
                  <span className="text-xs font-bold text-white block mt-0.5">Sèche à 10% de Bodyfat</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 font-mono block">92 jours</span>
                  <span className="text-[9px] text-zinc-500 font-mono block">Moyenne: ±6j</span>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Estimation force 1RM Bench</span>
                  <span className="text-xs font-bold text-white block mt-0.5">Barre à 120 kg</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-500 font-mono block">148 jours</span>
                  <span className="text-[9px] text-zinc-500 font-mono block">Moyenne: ±10j</span>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Risque de stagnation</span>
                  <span className="text-xs font-bold text-white block mt-0.5">Détecté sur quadriceps</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-500 font-mono block">Faible (18%)</span>
                  <span className="text-[9px] text-zinc-500 font-mono block">Surcharge progressive</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-xl text-[10px] text-zinc-400 leading-normal flex items-start gap-2">
              <Zap className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
              <span>Moteur prévisionnel basé sur la synthèse des charges cumulées de musculation et de l'adaptation myofibrillaire de force.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Premium Column Layout: Wearable Integration Hub & AI Periodization Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Wearable Integration Hub */}
        <div className="bg-[#0b0b0f] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div>
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-md font-bold text-white uppercase tracking-wider font-mono">Biométrie Synchronisée (Whoop / Oura)</h3>
              </div>
              
              {wearableConnected && (
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold font-mono tracking-widest uppercase animate-pulse">
                  ONLINE
                </span>
              )}
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Connectez officieusement ou officiellement vos capteurs IoT portés pour charger votre HRV et vos phases de sommeil profond. L'IA adapte l'intensité de la séance au réveil.
            </p>
          </div>

          {!wearableConnected ? (
            <div className="bg-[#08080a] border border-zinc-900 rounded-2xl p-6 text-center space-y-4 my-4 flex-1 flex flex-col justify-center items-center">
              <ShieldAlert className="w-8 h-8 text-amber-500/80 animate-bounce" />
              <div>
                <h4 className="text-xs font-bold text-zinc-300 font-mono">AUCUN WEARABLE RACCORDÉ</h4>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto mt-1 leading-normal">
                  Autorisez la synchronisation pour projeter vos efforts en fonction de votre système nerveux parasympathique.
                </p>
              </div>

              {/* Connection Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
                <button
                  onClick={() => handleConnectWearable("whoop")}
                  disabled={isSyncingWearable}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Connecter WHOOP</span>
                </button>
                <button
                  onClick={() => handleConnectWearable("oura")}
                  disabled={isSyncingWearable}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Connecter OURA RING</span>
                </button>
              </div>
              
              {isSyncingWearable && (
                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-500" /> Négociation OAuth en cours...
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-4.5 my-4 flex-1">
              
              {/* Wearable Active Stats Display */}
              <div className="bg-[#08080a] border border-zinc-900 p-4 rounded-2xl flex justify-between items-center relative gap-3">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">CAPTEUR CONNECTÉ via API</span>
                  <span className="text-sm font-bold text-white uppercase font-mono tracking-wide flex items-center gap-1 mt-0.5">
                    {activeWearable === "whoop" ? "WHOOP Band v4.0 PRO" : "OURA Ring Gen 3 Horizon"}
                  </span>
                </div>
                
                <button
                  onClick={disconnectWearable}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 p-2 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Déconnecter l'authentification wearable"
                >
                  <Unlink className="w-3.5 h-3.5" /> Déconnecter
                </button>
              </div>

              {/* Dynamic 3 bento segments */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 text-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">Variabilité VFC</span>
                  <span className="text-base font-extrabold text-blue-400 font-mono tracking-tight block mt-1">{hrvValue} ms</span>
                  <span className="text-[8px] text-zinc-500 block">Adaptation: Forte</span>
                </div>
                
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 text-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">Qualité Sommeil</span>
                  <span className="text-base font-extrabold text-indigo-400 font-mono tracking-tight block mt-1">{sleepQuality}%</span>
                  <span className="text-[8px] text-zinc-500 block">2h14 profond/REM</span>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 text-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">Aptitude d'effort</span>
                  <span className={`text-base font-extrabold font-mono tracking-tight block mt-1 ${
                    readinessScore >= 90 ? "text-emerald-400" : "text-amber-400"
                  }`}>{readinessScore}%</span>
                  <span className="text-[8px] text-zinc-500 block">Prêt pour Surcharge</span>
                </div>
              </div>

              {/* AI Wearable Recommendations and sync button */}
              <div className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="text-[10.5px] leading-normal text-zinc-400">
                  <strong className="text-white block font-sans mb-0.5">Directives d'entrainement IA Wearable:</strong>
                  VFC mesurée à <strong className="text-white font-mono">{hrvValue}ms</strong> (+12% de la ligne de base). Votre système nerveux central est parfaitement régénéré. Recommandation pour les charges axiales : augmentez le volume de <strong className="text-emerald-400 font-bold">+5%</strong> sur les exercices avec barre.
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-zinc-900 mt-2">
            <button
              onClick={syncWearableData}
              disabled={!wearableConnected || isSyncingWearable}
              className={`text-xs font-mono font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-all border ${
                wearableConnected 
                  ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 cursor-pointer" 
                  : "bg-zinc-950 text-zinc-650 border-zinc-950 cursor-not-allowed"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWearable ? "animate-spin text-emerald-400" : ""}`} />
              <span>Forcer la resynchronisation API IoT</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Periodization Timeline Planner */}
        <div className="bg-[#0b0b0f] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
              <Sliders className="w-5 h-5 text-blue-400" />
              <h3 className="text-md font-bold text-white uppercase tracking-wider font-mono">Planificateur Annuel Macro/Mesocycle IA</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Configurez vos mesocycles de force ou d'hypertrophie. Le planificateur adapte les prédictions d'hypertrophie cumulée sur la phase ciblée.
            </p>
          </div>

          <div className="space-y-4 my-2 flex-1">
            {/* Goal Selector */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
              <button
                onClick={() => setMacrocycleGoal("hypertrophy")}
                className={`text-[10px] font-mono font-bold uppercase py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                  macrocycleGoal === "hypertrophy" ? "bg-zinc-900 text-blue-400 font-black" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Hypertrophie
              </button>
              <button
                onClick={() => setMacrocycleGoal("strength")}
                className={`text-[10px] font-mono font-bold uppercase py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                  macrocycleGoal === "strength" ? "bg-zinc-900 text-blue-400 font-black" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Surcharge Force
              </button>
              <button
                onClick={() => setMacrocycleGoal("peaking")}
                className={`text-[10px] font-mono font-bold uppercase py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                  macrocycleGoal === "peaking" ? "bg-zinc-900 text-blue-400 font-black" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Peaking 1RM
              </button>
            </div>

            {/* Sliders Block */}
            <div className="space-y-3.5 bg-zinc-900/20 p-4 border border-zinc-900 rounded-2xl">
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1 text-zinc-400">
                  <span>Volume d'effort ciblé (Ensembles) :</span>
                  <span className="text-white font-extrabold">{volumeSlider}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={volumeSlider}
                  onChange={(e) => setVolumeSlider(parseInt(e.target.value))}
                  className="w-full Accent-blue-500 cursor-pointer h-1.5 rounded-full bg-zinc-950"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1 text-zinc-400">
                  <span>Intensité de tension (RPE standard) :</span>
                  <span className="text-white font-extrabold">{intensitySlider}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="105"
                  value={intensitySlider}
                  onChange={(e) => setIntensitySlider(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-full bg-zinc-950"
                />
              </div>

              {/* Weeks Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1 text-zinc-400">
                  <span>Durée du Mésocycle (Semaines) :</span>
                  <span className="text-white font-extrabold">{cycleWeeks} sem</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  value={cycleWeeks}
                  onChange={(e) => setCycleWeeks(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded-full bg-zinc-950"
                />
              </div>
            </div>

            {/* Simulated Adaptations results displays */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-[#08080a] border border-zinc-900 p-3.5 rounded-2xl">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase font-bold">Gains musculaires nets estimés</span>
                <span className="text-[14px] font-black font-mono text-emerald-400 block mt-1">+{forecast.muscleGain} kg</span>
                <span className="text-[8px] text-zinc-500 block">Sur {cycleWeeks} semaines d'effort</span>
              </div>
              <div className="bg-[#08080a] border border-zinc-900 p-3.5 rounded-2xl">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase font-bold">Indice de risque stagnation</span>
                <span className={`text-[14px] font-black font-mono block mt-1 ${
                  forecast.stagnationRisk > 30 ? "text-red-400" : "text-emerald-400"
                }`}>{forecast.stagnationRisk}%</span>
                <span className="text-[8px] text-zinc-500 block">Stress articulaire bas</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
            <span>Neurological Adapt : {forecast.neurologicalAdaptation}%</span>
            <span className="flex items-center gap-1 text-blue-500">
              <CheckCircle2 className="w-3.5 h-3.5" /> Planificateur de macrocycles actif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
