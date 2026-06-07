export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  instructions: string[];
  tips: string[];
  commonMistakes: string[];
  videoUrl?: string;
  isCustom?: boolean;
}

export interface SetRecord {
  id: string;
  setNumber: number;
  weight: number; // in kg
  reps: number;
  rpe: number; // Rate of Perceived Exertion (1 to 10)
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetRecord[];
  tempo?: string; // e.g. "3-0-1-0"
  restTime?: number; // in seconds
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration?: number; // in minutes
  logs: ExerciseLog[];
  totalTonnage?: number; // weight * reps sum
  totalVolume?: number; // sets sum
  completed: boolean;
}

export interface OnboardingData {
  age: number;
  sex: "Homme" | "Femme" | "Non-Binaire";
  height: number;
  weight: number;
  goal: "Sèche" | "Prise de Masse" | "Recomposition Corporelle" | "Force Athlétique" | "Endurance & Santé";
  experience: "Débutant (0-1 ans)" | "Intermédiaire (1-4 ans)" | "Athlète Confirmé (5+ ans)";
  medicalRestrictions: string;
  timeAvailable: "2-3 jours/semaine" | "3-4 jours/semaine" | "5+ jours/semaine";
  availableEquipment: "Salle complète" | "Haltères & Banc à domicile" | "Poids du corps (Calisthénie)";
  dietaryPreferences: "Sans restriction" | "Végétarien" | "Végan" | "Keto (Cétogène)" | "Riche en Protéines";
  trainingLocations?: string[]; // e.g. ["Home Gym", "Extérieur / Parc"]
  specificEquipment?: string[]; // e.g. ["Haltères réglables", "TRX", "Tapis de sol"]
  equipmentBudget?: string;     // e.g. "Petit budget (<100€)"
  constraints?: string[];       // e.g. ["Bruit limité", "Espace restreint"]
  availableSpace?: string;      // e.g. "Petit (2-4m²)"
}

export interface NutritionLog {
  id: string;
  name: string;
  calories: number;
   proteins: number; // in g
  carbs: number; // in g
  lipids: number; // in g
  mealType: "Petit-déjeuner" | "Déjeuner" | "Dîner" | "Encas";
  time: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AnalyticsDataPoint {
  date: string;
  weight: number;
  muscleMass: number;
  bodyFatPercentage: number;
  benchPressMax: number;
  squatMax: number;
  deadliftMax: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlocked: boolean;
  xpValue: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "Workout" | "Nutrition" | "Social" | "Streak";
  targetValue: number;
  currentValue: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

export interface BlogPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  likedByMe?: boolean;
  tags?: string[];
  attachedWorkout?: string;
}
