import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = 3000;

// Security: limit request payloads to prevent Denial of Service (DoS) attacks
app.use(express.json({ limit: "10kb" }));

// Security: Enable Helmet with custom configurations to ensure it works correctly
// within the preview iframe and Vite development mode.
app.use(
  helmet({
    frameguard: false, // Required so the AI Studio preview iframe can render the application
    contentSecurityPolicy: false, // Set to false to support dynamic script injection in HMR/Vite
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Security: Set up Express rate limiting to prevent DDoS, API abuse, and excessive API token consumption.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP address to 100 requests per 15 minutes
  standardHeaders: "draft-8", // Return standard rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    error: "Trop de requêtes. Veuillez réessayer dans 15 minutes.",
  },
});

// Apply rate limiting to all business endpoints
app.use("/api/", apiLimiter);

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Initialized GoogleGenAI successfully with API Key.");
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. AI coach features will fallback to deterministic mock guidance.");
}

// Global System Instruction to prompt the AI Coach
const COACH_SYSTEM_INSTRUCTION = `
You are the SarcoForge World-Class Personal AI Coach (Coach IA Ultra Avancé).
You speak French natively and adapt a premium, highly scientific, encouraging, and biomechanical expert persona.
You behave like an Elite Trainer (Whoop/Nike level) who acts with high technical precision.
Reference training metrics such as 1RM (1 Rep Max estimate), cumulative tonnage, RPE (Rate of Perceived Exertion), lipid macronutrients, metabolic adaptation, and scientific recovery principles.

When answering, keep responses structured using neat markdown headers, bullet points, and high-impact guidance.
Acknowledge specific goals like "sèche", "prise de masse", "recomposition", "force athlétique", and mention appropriate training variables.
`;

// API Routes
app.post("/api/coach-chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Robust Input Validation & Structure check
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Format des messages invalide. Doit être un tableau." });
    }

    // Shield against large conversations to prevent billing/token exhaustion vulnerabilities
    if (messages.length > 30) {
      return res.status(400).json({ error: "Historique de discussion trop long. Veuillez rafraîchir la session." });
    }

    const sanitizedMessages = [];
    for (const msg of messages) {
      if (!msg || typeof msg !== "object") {
        return res.status(400).json({ error: "Format de message invalide détecté." });
      }

      // Sanitize fields against Injection Attacks / buffer overflows
      const role = String(msg.role || "").trim().substring(0, 50);
      let content = String(msg.content || "").trim();

      if (role !== "user" && role !== "assistant" && role !== "model") {
        return res.status(400).json({ error: "Rôle de message non autorisé détecté." });
      }

      // Restrict character count to prevent prompt injection or high billing costs
      if (content.length > 2000) {
        content = content.substring(0, 2000) + " [Contenu tronqué pour des raisons de sécurité]";
      }

      sanitizedMessages.push({ role, content });
    }

    if (!ai) {
      // Return beautiful mock responses in French if Gemini API key isn't provided yet
      const lastUserMsg = sanitizedMessages[sanitizedMessages.length - 1]?.content?.toLowerCase() || "";
      let mockReply = "";
      if (lastUserMsg.includes("stagne") || lastUserMsg.includes("couché")) {
        mockReply = `### Analyse de Stagnation - Développé Couché

Bonjour ! En tant que Coach SarcoForge, j'ai analysé vos données de performance. Voici mon plan d'action immédiat :

1. **Volume et Intensité** : Réduisez la charge de 10% pour travailler sur une phase de *deload* de 1 semaine, puis remontez avec une surcharge progressive linéaire.
2. **Optimisation Technique** : Améliorez la stabilité de votre "arch" (pontage) et engagez intensément le *leg drive* pour stabiliser la ceinture scapulaire.
3. **Fréquence cardiaque & Énergie** : Assurez-vous d'avoir au moins 2.2g de protéines/kg de poids corporel et un excédent calorique de 250 kcal.`;
      } else {
        mockReply = `### Recommandations Personnalisées SarcoForge

C'est une excellente question relative à votre programme d'entraînement ! Pour optimiser vos résultats de manière optimale :
- **Surcharges Progressives** : Incrémentez vos charges de 1 à 2% ou essayez d'ajouter une répétition supplémentaire à charge équivalente en conservant un RPE de 8-9.
- **Récupération Active** : Intégrez des étirements dynamiques et assurez-vous d'avoir 7h à 8h de sommeil de qualité pour stimuler la synthèse des protéines.
- **Hydratation & Nutrition** : Consommez au moins 3L d'eau par jour pour soutenir le volume cellulaire inter-musculaire.

*Note : Configurez votre clé API Gemini dans l'onglet Configurations pour des réponses dynamiques en temps réel.*`;
      }
      return res.json({ text: mockReply });
    }

    // Convert client message history to Gemini-acceptable parts
    // Let's take the last 15 messages to prevent token limits
    const filteredMessages = sanitizedMessages.slice(-15);
    const apiContents = filteredMessages.map((msg: any) => {
      // Map 'assistant' or 'model' role to 'model', 'user' to 'user'
      const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      return {
        role: role,
        parts: [{ text: msg.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: apiContents,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const generatedText = response.text || "Désolé, je n'ai pas pu générer de conseils. Réessayez.";
    res.json({ text: generatedText });
  } catch (error: any) {
    // Audit logs internally, never expose raw backend trace or internal errors to client (safe-error-handling)
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Une erreur interne s'est produite lors du traitement de votre demande." });
  }
});

// Nutrient & Meal Generator API
app.post("/api/nutrition-recommendation", async (req, res) => {
  try {
    const { onboardingData } = req.body;

    if (!onboardingData || typeof onboardingData !== "object") {
      return res.status(400).json({ error: "Données d'intégration manquantes ou invalides." });
    }

    // Robust Input Type Checking & Boundaries Enforcement (Preventing parameter tampering)
    const rawAge = Number(onboardingData.age);
    const age = isNaN(rawAge) ? 30 : Math.max(1, Math.min(120, rawAge));

    const sex = String(onboardingData.sex || "Homme").trim().substring(0, 20);

    const rawHeight = Number(onboardingData.height);
    const height = isNaN(rawHeight) ? 170 : Math.max(50, Math.min(272, rawHeight));

    const rawWeight = Number(onboardingData.weight);
    const weight = isNaN(rawWeight) ? 70 : Math.max(10, Math.min(500, rawWeight));

    const goal = String(onboardingData.goal || "Force").trim().substring(0, 100);
    const activityLevel = String(onboardingData.activityLevel || "Modéré").trim().substring(0, 100);
    const medicalRestrictions = String(onboardingData.medicalRestrictions || "Aucune").trim().substring(0, 500);
    const availableEquipment = String(onboardingData.availableEquipment || "Salle complète").trim().substring(0, 500);

    // Dynamic extraction of extended Part 1 GymTracker Pro parameters
    const trainingLocations = Array.isArray(onboardingData.trainingLocations)
      ? onboardingData.trainingLocations.join(", ")
      : "Non configuré";

    const specificEquipment = Array.isArray(onboardingData.specificEquipment)
      ? onboardingData.specificEquipment.join(", ")
      : "Poids de corps uniquement";

    const equipmentBudget = String(onboardingData.equipmentBudget || "Pas de budget pour l'instant");
    const constraints = Array.isArray(onboardingData.constraints)
      ? onboardingData.constraints.join(", ")
      : "Aucune contrainte";
    const availableSpace = String(onboardingData.availableSpace || "Non défini");

    if (!ai) {
      // Mock gourmet program matching onboarding values (with strict limits in description)
      const mockPlan = `### Plan de Nutrition Personnalisé (Mode Démo)

Basé sur votre profil (**${goal}** pour un poids de **${weight} kg**), avec votre matériel actuel et votre lieu principal d'entraînement (**${trainingLocations}**), voici votre programme alimentaire et sportif idéal :

*   **Total Calorique Journalier estimé** : ~2,320 kcal
*   **Macronutriments recommandés** :
    *   **Protéines** : 160g (640 kcal - 2.0g/kg) - Crucial pour la reconstruction myofibrillaire.
    *   **Glucides** : 240g (960 kcal) - Pour alimenter l'ATP musculaire durant l'entraînement.
    *   **Lipides** : 75g (675 kcal) - Essentiels à l'équilibre hormonal.

---

### 🔥 SEANCE TYPE CONÇUE POUR VOTRE ÉQUIPEMENT (${specificEquipment})

1. **Échauffement** : Mouvements polyarticulaires dynamiques (5 mins)
2. **Exercice Principal** : ${
        trainingLocations.includes("Salle complète")
          ? "Développé Couché classique (Barre & Banc) : 4 séries x 8 reps"
          : specificEquipment.includes("Haltères")
          ? "Dumbbell Press au Sol : 4 séries x 12 reps (Hypertrophie contrôlée)"
          : "Pompes Classiques (Standard Push-ups) : 4 séries x Maximum (Aucun matériel requis)"
      }
3. **Exercice Secondaire** : Pompes Diamant (Diamond Push-up) : 3 séries x 10 reps (Pour cibler les triceps)
4. **Bas du Corps** : ${
        trainingLocations.includes("Salle complète")
          ? "Squat Arrière Olympique : 4 séries x 10 reps"
          : "Squats Poids de Corps (Air Squat) : 4 séries x 20 reps (Tempo 3-1-3-0)"
      }
5. **Travail Unilatéral** : ${
        specificEquipment.includes("Banc réglable")
          ? "Squat Bulgare (Pied arrière sur banc) : 3 séries x 12 reps par jambe"
          : "Fentes arrière dynamiques : 3 séries x 15 reps par jambe"
      }
6. **Gainage Core** : Planche abdominale active : 3 séries x 60 secondes (Transverse profond)

*Note: Vous possédez un profil d'achat matériel de type **${equipmentBudget}**. Considérez l'acquisition progressive de bandes de résistance et d'une barre de traction de porte pour déverrouiller plus de 150 exercices additionnels haute synergie.*`;
      return res.json({ text: mockPlan });
    }

    const promptText = `
    Génère un plan de nutrition détaillé, un programme d'entraînement adapté et un plan d'action sportif au format Markdown structuré pour l'utilisateur suivant :
    - Âge: ${age} ans
    - Sexe: ${sex}
    - Taille: ${height} cm
    - Poids actuel: ${weight} kg
    - Objectif principal: ${goal}
    - Niveau d'activité: ${activityLevel}
    - Blessures / Restrictions: ${medicalRestrictions}
    
    PARAMÈTRES ÉQUIPEMENT D'ÉLITE (GymTracker Pro v4.0) :
    - Lieux d'entraînement principaux: ${trainingLocations}
    - Équipements spécifiques possédés à disposition: ${specificEquipment}
    - Espace disponible estimé: ${availableSpace}
    - Budget d'amélioration matériel: ${equipmentBudget}
    - Contraintes logistiques (bruit, rangement, etc.): ${constraints}

    Inclus impérativement :
    1. Un calcul précis des calories quotidiennes estimées et la répartition exacte des macronutriments (Protéines en g, Glucides en g, Lipides en g) adaptés à l'équipement disponible.
    2. Un plan d'entraînement sur-mesure d'élite qui utilise STRICTEMENT et UNIQUEMENT le matériel possédé à disposition (${specificEquipment}) ou le poids du corps si aucun matériel.
    3. Si le matériel possédé est restreint ou nul (mode zéro matériel), propose des alternatives intelligentes complexes au poids du corps pour solliciter chaque muscle efficacement (ex: Table Row à la place de poulie haute, Pompes diamant à la place du Bench press).
    4. Propose des recommandations d'amélioration matériel intelligentes ROI basées sur son budget réel (${equipmentBudget}) pour débloquer de nouveaux exercices.
    5. Donne un ton premium, encourageant et d'acier (zéro excuses).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    // Internal audits logs, hide stack trace and API endpoint information from raw clients
    console.error("Error in nutrition API:", error);
    res.status(500).json({ error: "Une erreur interne s'est produite lors de la génération de vos recommandations." });
  }
});

// Serve frontend in production, or mount Vite mode in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite middleware
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SarcoForge Server] Running successfully on http://0.0.0.0:${PORT} (Production port 3000)`);
  });
}

startServer();
