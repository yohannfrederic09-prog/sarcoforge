import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, MessageSquare, Shield, HelpCircle, Dumbbell, Sparkles, User, UserCheck } from "lucide-react";

interface AICoachChatProps {
  initialMessages?: ChatMessage[];
}

export default function AICoachChat({ initialMessages }: AICoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages || [
      {
        id: "msg_init_0",
        role: "assistant",
        content: `### Bienvenue sur SarcoForge AI Coach v1.2 !

Je suis votre préparateur physique et consultant en physiologie artificielle. Mon but est d'analyser vos volumes d'entraînement, recalibrer vos surcharges de force, optimiser votre synthèse myofibrillaire, et vous propulser vers vos sommets sportifs.

Choisissez une question fréquente ci-dessous ou saisissez votre situation d'entraînement pour obtenir une analyse biomecanique rigoureuse en temps réels.`,
        timestamp: "En ligne",
      },
    ]
  );

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const prebuiltQueries = [
    {
      title: "Analyse stagnation développé couché",
      prompt: "Pourquoi je stagne au développé couché ces derniers mois ? Propose un protocole de surcharge progressive.",
    },
    {
      title: "Optimisation de ma prise de masse",
      prompt: "Comment dois-je réorganiser ma fréquence d'entraînement et mes glucides complexes pour optimiser ma prise de masse musculaire saine ?",
    },
    {
      title: "Conseils de récupération active",
      prompt: "Mon système nerveux central (CNS) semble fatigué. Comment optimiser mes deloads, mes étirements et mon sommeil réparateur ?",
    },
    {
      title: "Adapter mes charges post-blessure",
      prompt: "Je reviens de blessure à l'épaule gauche. Comment puis-je réadapter mon tempo d'exécution et mes volumes d'entraînement en sécurité ?",
    }
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal("");
    setLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!res.ok) {
        throw new Error("Failed to contact physical AI coach");
      }

      const responseData = await res.json();

      const coachMessage: ChatMessage = {
        id: `msg_coach_${Date.now()}`,
        role: "assistant",
        content: responseData.text,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, coachMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: "assistant",
        content: "Une erreur est survenue lors de la communication sécurisée. Veuillez réactiver le serveur ou réessayer l'invitation.",
        timestamp: "Erreur",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Simple and highly effective JSX rich text formatting for basic markdown elements
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers ### or ## or #
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-bold text-blue-400 mt-4 mb-2 first:mt-0 font-sans tracking-tight">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-bold text-white mt-5 mb-2.5 first:mt-0 font-sans tracking-tight">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-3 first:mt-0 font-sans tracking-tight">{line.replace("# ", "")}</h2>;
      }
      // Lists
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const cleanContent = line.replace(/^\s*[\*\-]\s+/, "");
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-zinc-300 leading-relaxed mb-1.5 font-sans">
            {boldTextReplacer(cleanContent)}
          </li>
        );
      }
      // Numbered Lists
      if (/^\d+\.\s+/.test(line.trim())) {
        const cleanContent = line.replace(/^\s*\d+\.\s+/, "");
        const num = line.match(/^\s*(\d+)/)?.[0] || "1";
        return (
          <li key={idx} className="ml-5 list-decimal text-xs text-zinc-300 leading-relaxed mb-1.5 font-sans">
            <span className="font-bold text-blue-400 mr-1">{num}.</span> {boldTextReplacer(cleanContent)}
          </li>
        );
      }
      // Simple text line or paragraph
      if (line.trim() === "") {
        return <div key={idx} className="h-2.5" />;
      }
      return <p key={idx} className="text-xs text-zinc-300 leading-relaxed mb-2 font-sans">{boldTextReplacer(line)}</p>;
    });
  };

  // Replace double stars **text** with bold tags
  const boldTextReplacer = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
      {/* Templates sidepanel */}
      <div className="lg:col-span-4 bg-zinc-950/40 rounded-3xl border border-zinc-800 p-5 flex flex-col gap-4 overflow-y-auto backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-500 animate-pulse" /> Protocoles Prédéfinis
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Cliquez sur un template pour poser directement une question avancée au coach SarcoForge.</p>
        </div>

        <div className="space-y-3 mt-2">
          {prebuiltQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => sendMessage(query.prompt)}
              disabled={loading}
              className="w-full text-left bg-zinc-900/50 hover:bg-zinc-900/90 hover:border-zinc-700 active:scale-98 disabled:opacity-50 transition-all border border-zinc-800 p-3.5 rounded-2xl flex flex-col gap-1 relative overflow-hidden group cursor-pointer"
            >
              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-blue-500" /> {query.title}
              </span>
              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{query.prompt}</p>
            </button>
          ))}
        </div>

        <div className="mt-auto bg-zinc-900/20 p-3 border border-zinc-800 rounded-xl flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-500 leading-normal">
            Le Coach IA est entraîné sur le modèle scientifique de périodisation ondulatoire quotidienne (DUP) et les adaptations métaboliques.
          </p>
        </div>
      </div>

      {/* Chat messages viewport */}
      <div className="lg:col-span-8 bg-zinc-950/40 rounded-3xl border border-zinc-800 flex flex-col h-full overflow-hidden backdrop-blur-md relative">
        {/* Active advisor bar */}
        <div className="bg-zinc-900/40 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-blue-500/30 relative">
              <Dumbbell className="w-5 h-5 text-white animate-spin-slow" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-zinc-950"></div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Coach IA Ultra Avancé <span className="text-[10px] bg-blue-500/15 text-blue-400 font-mono px-1.5 py-0.5 rounded uppercase">PRO-ATHLETE</span>
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono">Disponibilité permanente &bull; Connecté Gemini LLM</p>
            </div>
          </div>
        </div>

        {/* Messages list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[460px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3.5 max-w-[85%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold leading-none ${
                m.role === "user"
                  ? "bg-zinc-800 border border-zinc-700 text-zinc-300"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              }`}>
                {m.role === "user" ? <User className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-3xl text-xs space-y-1.5 shadow-md border ${
                m.role === "user"
                  ? "bg-zinc-900/80 border-zinc-800 text-white rounded-tr-none"
                  : "bg-zinc-950/70 border-zinc-800 text-zinc-200 rounded-tl-none relative overflow-hidden"
              }`}>
                {m.role !== "user" && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full pointer-events-none" />
                )}
                <div className="prose prose-invert prose-xs leading-relaxed">
                  {renderMarkdown(m.content)}
                </div>
                <div className="text-[9px] font-mono text-zinc-600 text-right mt-1.5">{m.timestamp}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3.5 mr-auto max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0 flex items-center justify-center animate-spin">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl rounded-tl-none bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2 shadow-md">
                <span className="text-xs text-zinc-400 font-mono animate-pulse">Le coach réfléchit et analyse vos variables sportives...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-300"></span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="mt-auto border-t border-zinc-800/80 p-4 bg-zinc-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputVal);
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              placeholder="Ex: Écris-moi une routine push-pull-legs axée sur mes triceps..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={loading}
              className="flex-1 bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 rounded-2xl py-3 px-4 focus:outline-none focus:border-blue-500 disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
