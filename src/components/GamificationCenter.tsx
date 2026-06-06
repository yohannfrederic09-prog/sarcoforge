import React from "react";
import { Badge, Challenge, LeaderboardUser } from "../types";
import { Award, Zap, Flame, UserCheck, Trophy, Sparkles, Check, CheckCircle } from "lucide-react";

interface GamificationCenterProps {
  currentLevel: number;
  currentXP: number;
  xpNeededForNextLevel: number;
  challenges: Challenge[];
  badges: Badge[];
  leaderboard: LeaderboardUser[];
  onClaimXP: (challengeId: string, xpReward: number) => void;
}

export default function GamificationCenter({
  currentLevel,
  currentXP,
  xpNeededForNextLevel,
  challenges,
  badges,
  leaderboard,
  onClaimXP,
}: GamificationCenterProps) {
  const xpPercentage = Math.round((currentXP / xpNeededForNextLevel) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* RPG Profile Level & Stats */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full"></div>

          <div className="flex items-center gap-4.5 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-500 flex items-center justify-center border border-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] relative text-zinc-950">
              <Trophy className="w-8 h-8 animate-bounce" />
              <div className="absolute -bottom-1 -right-1 bg-zinc-950 text-white font-mono font-bold text-xs px-2 py-0.5 rounded-full border border-zinc-800">
                Niv.{currentLevel}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">RANG ACTUEL</span>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1">
                Yohann-Athlète <span className="text-[9px] font-bold bg-amber-500/15 text-amber-500 py-0.5 px-2 rounded">COLOSSE</span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{currentXP} XP / {xpNeededForNextLevel} XP pour Niveau {currentLevel + 1}</p>
            </div>
          </div>

          <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden mb-4 relative">
            <div
              className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>

          <div className="bg-zinc-900/30 p-3.5 border border-zinc-800/80 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-4.5 h-4.5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-normal">
              <strong>Entraînement intelligent :</strong> Vous gagnez des points d'XP en réalisant vos entraînements et en validant des défis. Chaque montée en niveau débloque de nouvelles fonctionnalités sur le Coach IA.
            </p>
          </div>
        </div>

        {/* Badges and achievements */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-blue-500" /> Vos Badges de Réussite
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  badge.unlocked
                    ? "bg-amber-500/5 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)] hover:scale-101"
                    : "bg-zinc-900/10 border-zinc-900 text-zinc-600 opacity-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-2 text-white">
                  {badge.unlocked ? <Flame className="w-5 h-5 text-amber-400" /> : <Award className="w-5 h-5 text-zinc-700" />}
                </div>
                <h4 className="text-xs font-bold text-white truncate">{badge.title}</h4>
                <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{badge.description}</p>
                <span className="text-[9px] font-mono text-zinc-400 block mt-2">{badge.xpValue} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roster of Interactive Challenges other views */}
      <div className="lg:col-span-8 space-y-6">
        {/* Interactive Achievements Checklist */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-900 mb-4 flex items-center gap-1.5">
            <Zap className="w-4.5 h-4.5 text-yellow-500 animate-pulse" /> Objectifs de Progression & Défis IA
          </h3>

          <div className="space-y-4">
            {challenges.map((ch) => {
              const progressRatio = Math.min((ch.currentValue / ch.targetValue) * 100, 100);
              return (
                <div
                  key={ch.id}
                  className={`border rounded-2xl p-4 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    ch.completed && !ch.claimed
                      ? "bg-yellow-500/5 border-yellow-500/30"
                      : ch.claimed
                      ? "bg-zinc-900/20 border-zinc-900 opacity-60 text-zinc-400"
                      : "bg-zinc-900/50 border-zinc-800"
                  }`}
                >
                  <div className="flex-1 space-y-1.5 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        ch.category === "Workout" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {ch.category}
                      </span>
                      <h4 className="text-xs font-bold text-white tracking-tight">{ch.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">{ch.description}</p>

                    {/* Progress Bar of active challenge */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            ch.completed ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${progressRatio}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 min-w-[3.5rem] text-right">
                        {ch.currentValue} / {ch.targetValue} {ch.unit}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto text-right flex flex-row md:flex-col justify-between items-center gap-2.5">
                    <span className="text-xs font-black text-yellow-400 font-mono block mt-0.5">+{ch.xpReward} XP</span>
                    {ch.claimed ? (
                      <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Réclamé
                      </span>
                    ) : ch.completed ? (
                      <button
                        onClick={() => onClaimXP(ch.id, ch.xpReward)}
                        className="py-1.5 px-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 text-[10px] font-black font-sans rounded-lg transition-all animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer"
                      >
                        Réclamer XP !
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 font-mono">
                        En cours ({(progressRatio).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Leaderboards */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-900 mb-4 flex items-center gap-1.5">
            <Trophy className="w-4.5 h-4.5 text-yellow-500" /> Tableau des Champions Club
          </h3>

          <div className="space-y-2.5">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  user.isCurrentUser
                    ? "bg-blue-500/5 border-blue-500/30 text-blue-400"
                    : "bg-zinc-900/50 border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold w-6 text-center ${
                    user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-zinc-400" : "text-zinc-500"
                  }`}>
                    #{user.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-xs text-white uppercase">
                    {user.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {user.name} {user.isCurrentUser && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Vous</span>}
                    </h4>
                    <span className="text-[9px] font-mono text-zinc-500">Niveau {user.level} &bull; Progression stable</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white font-mono block">{user.xp.toLocaleString("fr-FR")} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
