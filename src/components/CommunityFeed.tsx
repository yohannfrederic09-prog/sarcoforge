import React, { useState } from "react";
import { BlogPost } from "../types";
import { Heart, MessageSquare, Send, Users, Sparkles, UserPlus, Trophy, Share2, Dumbbell } from "lucide-react";

export default function CommunityFeed() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "post_0",
      authorName: "Marc Vacher",
      authorAvatar: "MV",
      timeAgo: "Il y a 23 minutes",
      content: "Nouvelle performance validée au Soulevé de Terre à la salle Athlétique ! Séance de Force Ondulatoire complete, 1RM calculé estimé à 160kg. Bravo à l'équipe !",
      likes: 14,
      comments: 3,
      likedByMe: false,
      tags: ["Powerlifting", "Deadlift"],
      attachedWorkout: "Soulevé de Terre Traditional &bull; 4 séries x 5 reps @ 140kg",
    },
    {
      id: "post_1",
      authorName: "Sophie Martinez",
      authorAvatar: "SM",
      timeAgo: "Il y a 1 heure",
      content: "Onboarding IA complété ! Mes objectifs de sèche ont été ajustés par l'algorithme : 2100 calories, 150g protéines. C'est parti pour 12 semaines intenses de transformation.",
      likes: 28,
      comments: 7,
      likedByMe: true,
      tags: ["Onboarding", "FitnessGoal"],
    }
  ]);

  const [newPostText, setNewPostText] = useState("");
  const [selectedTag, setSelectedTag] = useState("Tous");

  const [activeGroupInput, setActiveGroupInput] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [postsComments, setPostsComments] = useState<{[key: string]: string[]}>({
    post_0: ["Magnifique barre Marc !", "Les dorsaux étaient d'acier."],
    post_1: ["Super Sophie ! On va suivre ça de très près.", "N'hésite pas à consulter le coach IA."]
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const FreshPost: BlogPost = {
      id: `post_${Date.now()}`,
      authorName: "Yohann-Athlète",
      authorAvatar: "YA",
      timeAgo: "À l'instant",
      content: newPostText,
      likes: 0,
      comments: 0,
      likedByMe: false,
      tags: ["Entraînement"],
    };

    setPosts((prev) => [FreshPost, ...prev]);
    setNewPostText("");
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const lByMe = !p.likedByMe;
          return {
            ...p,
            likedByMe: lByMe,
            likes: lByMe ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setPostsComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), text]
    }));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, comments: p.comments + 1 };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  // Filter tag logs
  const tags = ["Tous", "Entraînement", "Powerlifting", "Onboarding", "Sèche"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Feed & Post Roster */}
      <div className="lg:col-span-8 space-y-6">
        {/* Write post */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-4 md:p-5 backdrop-blur-md">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">YA</div>
              <textarea
                placeholder="Partagez votre séance, vos repas ou posez une question au club..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 h-20 resize-none"
              />
            </div>
            <div className="flex justify-between items-center border-t border-zinc-900 pt-3.5">
              <span className="text-[10px] text-zinc-500 font-mono">Publier en tant que Yohann-Athlète</span>
              <button
                type="submit"
                disabled={!newPostText.trim()}
                className="py-1.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Partager <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Filter Slider */}
        <div className="flex gap-2 pb-1.5 overflow-x-auto scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-full shrink-0 border transition-all ${
                selectedTag === tag
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Posts roster */}
        <div className="space-y-5">
          {posts
            .filter((p) => {
              if (selectedTag === "Tous") return true;
              return p.tags?.includes(selectedTag) || p.tags?.includes(selectedTag.replace("#", ""));
            })
            .map((post) => (
              <div key={post.id} className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 font-bold text-white flex items-center justify-center text-xs">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {post.authorName}{" "}
                        <span className="text-[9px] bg-zinc-900 text-zinc-400 font-mono px-1.5 py-0.5 rounded">CLUB ATHLÈTE</span>
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500">{post.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{post.content}</p>

                {/* Attached Workouts */}
                {post.attachedWorkout && (
                  <div className="bg-blue-950/10 border border-blue-900/30 rounded-2xl p-3 flex items-center gap-2.5 font-mono text-[11px] text-zinc-300">
                    <Dumbbell className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{post.attachedWorkout}</span>
                  </div>
                )}

                {/* Tags tags */}
                {post.tags && (
                  <div className="flex gap-1.5">
                    {post.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactive Controls likes comments */}
                <div className="flex items-center gap-6 border-t border-b border-zinc-900/60 py-2 font-mono text-[11px] text-zinc-400">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors focus:outline-none cursor-pointer ${
                      post.likedByMe ? "text-rose-500 font-bold" : "hover:text-rose-400"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{post.likes} Likes</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments} Commentaire(s)</span>
                  </div>
                </div>

                {/* Render inline comments */}
                <div className="space-y-2 mt-2">
                  {(postsComments[post.id] || []).map((cmt, idx) => (
                    <div key={idx} className="bg-zinc-900/20 px-3.5 py-2.5 rounded-xl border border-zinc-900 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-bold flex items-center justify-center shrink-0">C</div>
                      <p className="text-[11px] text-zinc-300 leading-normal">{cmt}</p>
                    </div>
                  ))}

                  {/* Comment Input */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Votre avis sur cette séance..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCommentInputs((prev) => ({ ...prev, [post.id]: val }));
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-[11px] text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="py-1 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[11px] font-bold"
                    >
                      Commenter
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Leaderboard & Challenges sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Trophy className="w-4.5 h-4.5 text-yellow-500" /> Élite Clubs & Groupes Actifs
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Rejoignez un cercle sportif de haut niveau pour mutualiser vos défis sportifs.</p>

          <div className="space-y-3">
            {[
              { name: "Team Powerlifting France", members: 1204, activeLevel: "Niv.4" },
              { name: "Sèche Extrême & HIIT", members: 893, activeLevel: "Niv.2" },
              { name: "Sorcier de la Hypertrophie", members: 1642, activeLevel: "Niv.5" },
            ].map((group, idx) => (
              <div key={idx} className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{group.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> {group.members} membres &bull; {group.activeLevel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Demande d'affiliation envoyée pour : ${group.name}`)}
                  className="py-1 px-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg border border-blue-500/20 text-[10px] font-mono transition-all font-bold cursor-pointer"
                >
                  Postuler
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
