import React, { useState } from "react";
import { Database, Cloud, Terminal, Cpu, DollarSign, Calendar, FileCode, Workflow, ChevronRight } from "lucide-react";

export default function DevOpsConsole() {
  const [activeTab, setActiveTab] = useState<"prisma" | "architecture" | "api" | "cloud" | "financial">("prisma");

  const PRISMA_SCHEMA = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  COACH
  ADMIN
}

enum Goal {
  SECHE
  PRISE_DE_MASSE
  RECOMPOSITION
  FORCE_ATHLETIQUE
  ENDURANCE
}

enum ExerciseDifficulty {
  DEBUTANT
  INTERMEDIAIRE
  AVANCE
}

enum Category {
  WORKOUT
  NUTRITION
  STREAK
  SOCIAL
}

model User {
  id                 String             @id @default(uuid())
  email              String             @unique
  passwordHash       String
  firstName          String
  lastName           String
  role               Role               @default(USER)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  profile            UserProfile?
  workoutSessions    WorkoutSession[]
  nutritionLogs      NutritionLog[]
  userBadges         UserBadge[]
  userChallenges     UserChallenge[]
  posts              Post[]
  comments           Comment[]
  likes              Like[]
  primaryStreak      Int                @default(0)
  lastActiveDate     DateTime?
  totalXp            Int                @default(0)
  level              Int                @default(1)
  stripeCustomerId   String?
  subscriptionTier   String             @default("FREE") // FREE | PRO | ELITE
}

model UserProfile {
  id                 String         @id @default(uuid())
  userId             String         @unique
  user               User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  age                Int
  sex                String
  height             Float          // in cm
  weight             Float          // in kg
  goal               Goal
  experience         String
  medicalAlerts      String?
  availableEquipment String
  dietaryPreference  String
  calorieTarget      Int            @default(2000)
  proteinTarget      Int            @default(150)
  carbTarget         Int            @default(200)
  lipidTarget        Int            @default(70)
}

model Exercise {
  id              String             @id @default(uuid())
  name            String             @unique
  description     String
  difficulty      ExerciseDifficulty
  primaryMuscle   String
  secondaryMuscles String[]
  equipment       String
  instructions    String[]
  tips            String[]
  commonMistakes  String[]
  videoUrl        String?
  logs            SetLog[]
}

model WorkoutSession {
  id             String         @id @default(uuid())
  userId         String
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name           String
  date           DateTime       @default(now())
  duration       Int?           // in minutes
  completed      Boolean        @default(false)
  totalTonnage   Float          @default(0)
  totalVolume    Int            @default(0)
  logs           ExerciseLog[]
}

model ExerciseLog {
  id               String          @id @default(uuid())
  workoutSessionId String
  workoutSession   WorkoutSession  @relation(fields: [workoutSessionId], references: [id], onDelete: Cascade)
  exerciseName     String
  tempo            String          @default("3-0-1-0")
  restTime         Int             @default(90) // in seconds
  notes            String?
  sets             SetLog[]
}

model SetLog {
  id             String       @id @default(uuid())
  exerciseLogId  String
  exerciseLog    ExerciseLog  @relation(fields: [exerciseLogId], references: [id], onDelete: Cascade)
  exerciseId     String?
  exercise       Exercise?    @relation(fields: [exerciseId], references: [id])
  setNumber      Int
  weight         Float
  reps           Int
  rpe            Int          @default(8)
  completed      Boolean      @default(false)
}

model NutritionLog {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String
  calories   Int
  proteins   Float
  carbs      Float
  lipids     Float
  mealType   String   // PETIT_DEJEUNER | DEJEUNER | DINER | ENCAS
  time       DateTime @default(now())
}

model Badge {
  id          String      @id @default(uuid())
  title       String      @unique
  description String
  icon        String
  xpValue     Int
  userBadges  UserBadge[]
}

model UserBadge {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId    String
  badge      Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  unlockedAt DateTime @default(now())
}

model Challenge {
  id             String          @id @default(uuid())
  title          String
  description    String
  category       Category
  targetValue    Int
  unit           String
  xpReward       Int
  userChallenges UserChallenge[]
}

model UserChallenge {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  challengeId  String
  challenge    Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  currentValue Int       @default(0)
  completed    Boolean   @default(false)
  claimed      Boolean   @default(false)
}

model Post {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  content   String
  createdAt DateTime  @default(now())
  likes     Like[]
  comments  Comment[]
}

model Comment {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  content   String
  createdAt DateTime @default(now())
}

model Like {
  id     String @id @default(uuid())
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`;

  const SEVEN_STREAK_CI = `# CI-CD Workflow des Microservices SarcoForge (GitHub Actions)
name: SarcoForge DevOps Pipeline

on:
  push:
    branches: [ main, production ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 환경
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}

      - name: Install Dependencies
        run: npm ci

      - name: Generate Prisma Classes
        run: npx prisma generate

      - name: Run Linter
        run: npm run lint

      - name: Run Units & Integration Tests
        run: npm run test

  build-and-push-docker:
    needs: lint-and-test
    if: github.ref == 'refs/heads/production'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v3
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, Tag and Push App Image
        run: |
          docker build -t \${{ steps.login-ecr.outputs.registry }}/gymtracker-backend:latest .
          docker push \${{ steps.login-ecr.outputs.registry }}/gymtracker-backend:latest

  redeploy-ecs:
    needs: build-and-push-docker
    runs-on: ubuntu-latest
    steps:
      - name: Redploy Elastic Container Service Task
        run: |
          aws ecs update-service --cluster gymtracker-prod-cluster --service backend-service --force-new-deployment
`;

  const ARCHITECTURE_DOC = `
==========================================================================================
                     GYMTRACKER PRO — CLEAN ARCHITECTURE NESTJS (DDD)
==========================================================================================

[ Client Applications ] (React Native Mobile / Next.js Web)
                      │
                      ▼
[ API Gateway / Reverse Proxy (VPC Load Balancer) ]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
  [ HTTP REST API ]          [ WebSockets API ]
  (NestJS Controllers)       (Socket.io Gateways)
        │                           │
        └─────────────┬─────────────┘
                      ▼
        ┌───────────────────────────┐
        │       API ENDPOINTS       │
        │ - AuthController          │
        │ - WorkoutController       │
        │ - NutritionController     │
        │ - AiCoachController       │
        └─────────────┬─────────────┘
                      ▼
 ┌───────────────────────────────────────────────┐
 │ APPLICATION SERVICES (NestJS Services)          │
 │ - Orchestre les use-cases et transactions     │
 │ - Injecte les structures via Nest Dependency   │
 └────────────────────┬──────────────────────────┘
                      ▼
 ┌───────────────────────────────────────────────┐
 │ DOMAIN LAYER (Domain Driven Design)           │
 │ - Entités denses (Ex: SetRecord calculation)  │
 │ - Domain Services, Règles métiers strictes   │
 └────────────────────┬──────────────────────────┘
                      ▼
 ┌───────────────────────────────────────────────┐
 │ INFRASTRUCTURE LAYER                         │
 │ - Prisma ORM Adapter                          │
 │ - Redis Core cache (Caching 1RM performance)  │
 │ - Amazon S3 / Google Cloud Storage Client     │
 └───────────────────────────────────────────────┘
  `;

  return (
    <div className="bg-zinc-950/60 rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="border-b border-zinc-800/80 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 animate-pulse" /> DevOps Architectural Console
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Dossier de Livraison Technique & Spécifications</h2>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2 bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("prisma")}
            className={`text-xs font-mono py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === "prisma" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Base Prisma
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`text-xs font-mono py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === "architecture" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Architecture backend
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`text-xs font-mono py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === "api" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" /> Rest APIs Specs
          </button>
          <button
            onClick={() => setActiveTab("cloud")}
            className={`text-xs font-mono py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === "cloud" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" /> AWS Plan & CI-CD
          </button>
          <button
            onClick={() => setActiveTab("financial")}
            className={`text-xs font-mono py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === "financial" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Financial & Roadmap
          </button>
        </div>
      </div>

      {/* Tabs Viewports */}
      <div className="space-y-6">
        {activeTab === "prisma" && (
          <div className="space-y-4 animate-fadeIn-fast">
            <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850">
              <div className="text-xs">
                <span className="font-bold text-white block">PostgreSQL schema.prisma</span>
                <p className="text-zinc-500 mt-0.5">Le model relationnel de données complet, incluant la gestion d'Onboarding, l'historique d'entraînements, la Nutrition et les classements de Gamification.</p>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 overflow-x-auto max-h-[480px] scrollbar-thin">
              <pre className="text-[11px] font-mono leading-relaxed text-zinc-300">
                <code>{PRISMA_SCHEMA}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === "architecture" && (
          <div className="space-y-4 animate-fadeIn-fast">
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 prose prose-invert prose-xs text-xs text-zinc-300 space-y-3">
              <p><strong>Clean Architecture & DDD NestJS Infrastructure :</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Couche Domaine (Domain Layer)</strong> : Contient les modèles d'affaires et de règles de validation sportives sans dépendance à Prisma ou aux bases de données.</li>
                <li><strong>Couche Application (Application Layer)</strong> : Implémente les Use Cases (Ex: <code className="bg-zinc-900 px-1 rounded text-red-400">CompleteWorkoutUseCase</code>, <code className="bg-zinc-900 px-1 rounded text-red-400">CalculateMacrosUseCase</code>).</li>
                <li><strong>Couche Infrastructure (Infrastructure Layer)</strong> : Contient les implémentations techniques et pilotes spécifiques (Bases de données SQL, ORMs, clients d'emailing).</li>
              </ul>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 overflow-x-auto text-[11px] font-mono text-blue-400 leading-normal">
              <pre>{ARCHITECTURE_DOC}</pre>
            </div>

            {/* Mobile layouts directory list */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1"><FileCode className="w-4 h-4 text-blue-500" /> Structure Projet Mobile (React Native + Expo Router)</h4>
              <pre className="text-[10px] font-mono text-zinc-500 leading-normal">
{`/src
├── /app                  # Expo Router Folder Layout
│   ├── _layout.tsx       # Root Navigation Setup
│   ├── index.tsx         # Welcome Landing
│   ├── (auth)            # Auth Forms (Login, Onboarding)
│   ├── (tabs)            # Core Dashboard Tabs
│   │   ├── dashboard.tsx # Athlete metrics
│   │   ├── workouts.tsx  # Dynamic performance sets log
│   │   ├── coach.tsx     # AICoach Chat Interface
│   │   └── profile.tsx   # Gamification profiles
├── /components           # Unified Shared UI Elements
│   ├── RingProgress.tsx  # Dynamic water & calorie SVG ring
│   └── SwipeableSet.tsx  # Mobile swipe set completed feedback
└── /store                # Global Zustand state controllers (Auth, Active Log)`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className="space-y-6 animate-fadeIn-fast">
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 text-xs space-y-3 text-zinc-300">
              <p className="font-bold text-white">Spécifications Complètes de l'API REST de production :</p>
              <div className="space-y-4">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                  <span className="text-emerald-400 font-bold font-mono">POST /api/v1/auth/register</span>
                  <p className="mt-1 text-zinc-400">Enregistre un athlète et l'onboarde en base de données.</p>
                  <pre className="text-[10px] text-zinc-500 font-mono mt-2 bg-zinc-900 p-2 rounded">
{`Request: { email, password, firstName, lastName }
Response: { status: "success", token: "eyJhbG...", userId: "u_abc" }`}
                  </pre>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                  <span className="text-blue-400 font-bold font-mono">POST /api/v1/workouts/session</span>
                  <p className="mt-1 text-zinc-400">Enregistre une routine d'entraînements active complétée.</p>
                  <pre className="text-[10px] text-zinc-500 font-mono mt-2 bg-zinc-900 p-2 rounded">
{`Request: { name: string, exercises: [{ id, sets: [{ weight, reps, rpe }] }] }
Response: { status: "created", xpEarned: 240, completed: true }`}
                  </pre>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                  <span className="text-yellow-500 font-bold font-mono">WebSocket Socket.io Events</span>
                  <p className="mt-1 text-zinc-400">Abonne l'application aux statistiques de force et notifications de streaks en temps réel.</p>
                  <pre className="text-[10px] text-zinc-500 font-mono mt-2 bg-zinc-900 p-2 rounded">
{`- OUTBOUND Emit 'workout:log_set' (rpe, load) -> Envoie instantanément la série au serveur.
- INBOUND Listen 'streak:updated' (days, newLevel) -> Affiche le badge de streak à l'écran.`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cloud" && (
          <div className="space-y-5 animate-fadeIn-fast">
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 text-xs text-zinc-300 space-y-3">
              <span className="font-bold text-white block">Plan de Déploiement AWS scalable vers 1 Million d'Utilisateurs</span>
              <p className="leading-relaxed">
                Notre architecture exploite les conteneurs gérés et le cache de base de données à haut niveau pour des temps de latence minimaux (&lt;200ms) et un coût d'infrastructure optimisé.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 font-sans">
                <li><strong>AWS ECS (Fargate) & VPC Subnets</strong> : Héberge nos microservices d'API et le Coach IA à isolation complète, avec mise à l'échelle automatique (Autoscaling) basée sur la charge CPU.</li>
                <li><strong>Amazon CloudFront & S3 bucket</strong> : Distribue l'application Web Next.js compilée et sert les images JPG/Vidéo HD d'exercices sportifs.</li>
                <li><strong>PostgreSQL Amazon RDS Multizone (Primary & Read Replica)</strong> : Réduction de la charge en lecture des données d'entraînements et de l'historique sur des serveurs répliqués.</li>
                <li><strong>Amazon ElastiCache (Redis) cluster</strong> : Gère le partitionnement en mémoire des sessions WebSockets actives et héberge le cache de calcul lourd d'1RM.</li>
              </ul>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-2">
              <span className="text-xs font-bold font-mono text-zinc-500 uppercase block flex items-center gap-1"><Workflow className="text-blue-500 w-4 h-4" /> pipeline yaml github actions</span>
              <div className="overflow-x-auto max-h-[300px]">
                <pre className="text-[11px] font-mono leading-relaxed text-zinc-300">
                  <code>{SEVEN_STREAK_CI}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === "financial" && (
          <div className="space-y-6 animate-fadeIn-fast text-xs">
            {/* GANTT roadmap */}
            <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-blue-500" /> Planification de la Roadmap Produit sur 24 Mois
              </h3>
              <div className="relative border-l border-zinc-800 pl-4 ml-2 space-y-4 font-mono">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 py-0.5 px-2 rounded-full font-bold">Mois 1 - 4</span>
                    <span className="text-xs font-bold text-white">Phase Alpha & Onboarding IA</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">Lancement du moteur d'onboarding, intégration de la passerelle de paiement Stripe et déploiement initial de la base PostgreSQL Prisma.</p>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 py-0.5 px-2 rounded-full font-bold">Mois 5 - 12</span>
                    <span className="text-xs font-bold text-white">Phase Bêta, Coach intelligent Gemini</span>
                  </div>
                  <p className="text-[11px] text-zinc-450 mt-0.5 font-sans">Finalisation de l'application compagnon mobile React Native, introduction du Coach IA et du scanner alimentaire bar-code OCR.</p>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-yellow-500/10 text-yellow-500 py-0.5 px-2 rounded-full font-bold">Mois 13 - 24</span>
                    <span className="text-xs font-bold text-white">Phase Échelle, Version 2 et Internationalisation</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">Mise en place de l'autoscaling cloud RDS Multi-réplicas, fonctionnalités multilingues et lancement d'offres tarifaires Élite.</p>
                </div>
              </div>
            </div>

            {/* Financial modeling table */}
            <div className="bg-zinc-950/45 border border-zinc-800 rounded-3xl p-5 backdrop-blur-md">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">PROJECTION DE FLUX FINANCIER APPRÉCIÉ (SAAS)</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <DollarSign className="w-4.5 h-4.5 text-emerald-400" /> Évaluation Budgétaire SarcoForge
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] tracking-wider uppercase">
                      <th className="py-2">Indicateur SaaS Target</th>
                      <th className="py-2">FREE Tier</th>
                      <th className="py-2 text-blue-400">PRO Tier ($14.99)</th>
                      <th className="py-2 text-indigo-400">ELITE Tier ($29.99)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-900/50">
                      <td className="py-2.5 font-bold text-white">Volume d'utilisateurs estimé</td>
                      <td className="py-2.5">700,000 (70%)</td>
                      <td className="py-2.5">250,000 (25%)</td>
                      <td className="py-2.5">50,000 (5%)</td>
                    </tr>
                    <tr className="border-b border-zinc-900/50">
                      <td className="py-2.5 font-bold text-white">LTV client (Valeur vie)</td>
                      <td className="py-2.5">0.00 $</td>
                      <td className="py-2.5 text-blue-400">180.00 $</td>
                      <td className="py-2.5 text-indigo-400">360.00 $</td>
                    </tr>
                    <tr className="border-b border-zinc-900/50">
                      <td className="py-2.5 font-bold text-white">Coût d'acquisition client (CAC)</td>
                      <td className="py-2.5">1.20 $</td>
                      <td className="py-2.5">25.00 $</td>
                      <td className="py-2.5">45.00 $</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-white">Part de Churn Visé (Mensuel)</td>
                      <td className="py-2.5">-</td>
                      <td className="py-2.5">&lt; 3.2%</td>
                      <td className="py-2.5">&lt; 2.1%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
