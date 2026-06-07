import React from "react";
import { X, ShieldAlert, CheckCircle, HelpCircle, Sparkles } from "lucide-react";

interface CyberModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "alert" | "confirm" | "success" | "info";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export default function CyberModal({
  isOpen,
  title,
  message,
  type = "alert",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onClose,
}: CyberModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-emerald-400 animate-pulse" />;
      case "confirm":
        return <HelpCircle className="w-8 h-8 text-blue-400 animate-bounce" />;
      case "info":
        return <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />;
      default:
        return <ShieldAlert className="w-8 h-8 text-red-400 animate-shake" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
      case "confirm":
        return "border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]";
      case "info":
        return "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
      default:
        return "border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/75 transition-all duration-300">
      <div
        className={`w-full max-w-md bg-zinc-950/95 border ${getBorderColor()} rounded-3xl p-6 relative overflow-hidden transition-all duration-500 transform scale-100 shadow-2xl animate-fadeIn`}
      >
        {/* Futuristic glowing node decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top bar indicators */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              Sarcoforge Core Security Protocol
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex gap-4 items-start pt-2">
          <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl shrink-0">
            {getIcon()}
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-tight font-sans">
              {title}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans max-h-48 overflow-y-auto pr-1">
              {message}
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-zinc-900 font-sans">
          {type === "confirm" ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold cursor-pointer transition active:scale-95"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-505/10 rounded-xl text-xs font-semibold cursor-pointer transition active:scale-95"
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-zinc-900 to-zinc-950 hover:from-zinc-850 hover:to-zinc-900 text-white border border-zinc-800 rounded-xl text-xs font-semibold cursor-pointer transition text-center active:scale-95"
            >
              Fermer l'Analyse
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
