import { Exercise } from "../types";

// Extends default Exercise with scientific and premium parameters
export interface PremiumExercise extends Exercise {
  emgActivation?: number;       // EMG activation % (e.g. 84.5)
  popularityRating?: number;    // Global popularity 0-100 (e.g. 98)
  caloriesPerMin?: number;      // MET-based calories burned per minute
  hormonalImpact?: string;      // Testosterone, Growth Hormone, Cortisol induction profile
  riskRewardRatio?: string;     // Risk to reward metric description
  movementPattern?: string;     // e.g. "Push", "Pull", "Squat", "Hip Hinge"
  mechanic?: "Polyarticulaire" | "Isolation";
  equipment_required?: string[];
  equipment_alternatives?: string[];
  no_equipment_version?: boolean;
  minimum_space_required?: "tiny" | "small" | "medium" | "large";
  noise_level?: "silent" | "low" | "medium" | "high";
}

export const EXERCISE_DATABASE: PremiumExercise[] = [
  {
    id: "ex_bench_press",
    name: "Développé Couché (Barbell Bench Press)",
    description: "Le roi incontesté de la force et de l'hypertrophie pectorale. Utilisé depuis plus d'un siècle comme test de référence pour le haut du corps. Ce mouvement active en particulier les faisceaux sternocostaux et claviculaires du grand pectoral, avec d'excellents transferts de puissance cinétique pour les athlètes.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Pectoraux",
    secondaryMuscles: ["Triceps", "Deltoïde Antérieur", "Grand Dentelé"],
    equipment: "Barre & Banc",
    instructions: [
      "Allongez-vous sur le banc, les yeux alignés directement sous la barre.",
      "Saisissez la barre avec un écartement légèrement supérieur à la largeur des épaules.",
      "Plantez fermement vos pieds au sol, contractez les fessiers et rapprochez vos omoplates (rétraction scapulaire).",
      "Décrochez la barre et stabilisez-la au-dessus de votre poitrine, les bras tendus.",
      "Rapprochez lentement la barre vers le bas de la poitrine (ligne des mamelons) en contrôlant la descente.",
      "Poussez puissamment pour remonter la barre en étendant les bras tout en gardant les omoplates resserrées."
    ],
    tips: [
      "Gardez vos coudes formant un angle de 45° à 60° avec votre torse.",
      "Utilisez le 'leg drive' en poussant vos pieds dans le sol pour transférer la force du bas vers le haut du corps."
    ],
    commonMistakes: [
      "Faire rebondir la barre sur le sternum (risque majeur de déchirure pectorale ou enfoncement thoracique).",
      "Laisser les fessiers décoller du banc pendant la poussée."
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-exercise-in-gym-34288-large.mp4",
    emgActivation: 82.5,
    popularityRating: 99,
    caloriesPerMin: 6.5,
    hormonalImpact: "Forte induction de Testostérone libre & HGH par stress mécanique élevé",
    riskRewardRatio: "Excellent si la coiffe des rotateurs est stabilisée",
    movementPattern: "Poussée Horizontale",
    mechanic: "Polyarticulaire"
  },
  {
    id: "ex_back_squat",
    name: "Squat Arrière (Back Squat)",
    description: "Le mouvement de référence universel pour les membres inférieurs. Il recrute l'ensemble des quadriceps, fessiers, ischio-jambiers, ainsi que la ceinture abdominale et lombaire pour une stabilisation optimale de la colonne vertébrale sous charges axiales lourdes.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Fessiers", "Ischio-jambiers", "Érecteurs du rachis", "Sangle abdominale"],
    equipment: "Barre d'haltérophilie & Rack",
    instructions: [
      "Positionnez la barre sur vos trapèzes sup, pieds écartés de la largeur des épaules, orteils légèrement vers l'extérieur.",
      "Décrochez la barre du rack et faites un pas en arrière stable.",
      "Prenez une profonde inspiration abdominale (manœuvre de Valsalva) pour augmenter la pression intra-abdominale.",
      "Initiez le mouvement en poussant les hanches vers l'arrière comme pour vous asseoir sur un banc bas.",
      "Descendez jusqu'à ce que vos hanches soient légèrement sous la ligne des genoux (rupture de la parallèle).",
      "Poussez de manière explosive à travers le milieu du pied pour remonter en position verticale complète."
    ],
    tips: [
      "Gardez la poitrine haute et le dos neutre tout au long de la phase excentrique et concentrique.",
      "Poussez activement vos genoux vers l'extérieur pour éviter qu'ils s'affaissent vers l'intérieur."
    ],
    commonMistakes: [
      "Laisser le dos s'enrouler ou s'arrondir en portion basse (butt wink scapulaire lombo-pelvienne).",
      "Décoller les talons du sol, ce qui sollicite de manière excessive les tendons rotuliens."
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-athlete-performing-squats-with-heavy-barbel-34289-large.mp4",
    emgActivation: 88.0,
    popularityRating: 98,
    caloriesPerMin: 11.2,
    hormonalImpact: "Maximale. Très forte stimulation de la Somatotropine (GH) et des facteurs IGF-1",
    riskRewardRatio: "Excellent si la flexibilité de cheville et de hanche permet d'éviter l'enroulement lombo-pelvien",
    movementPattern: "Squat (Flession/Extension)",
    mechanic: "Polyarticulaire"
  },
  {
    id: "ex_deadlift",
    name: "Soulevé de Terre (Deadlift Traditional)",
    description: "Le test ultime de force athlétique globale brute. Le soulevé de terre traditionnel sollicite l'intégralité de la chaîne postérieure depuis les chevilles jusqu'aux trapèzes supérieurs, générant un effet d'armure musculaire et une stimulation neurologique maximale.",
    difficulty: "Avancé",
    primaryMuscle: "Ischio-jambiers / Fessiers",
    secondaryMuscles: ["Érecteurs du rachis", "Dorsaux", "Trapèzes", "Quadriceps", "Avant-bras (Grip)"],
    equipment: "Barre olympique & Disques",
    instructions: [
      "Placez-vous debout, les pieds écartés de la largeur des hanches, la barre passant au milieu de vos pieds.",
      "Penchez-vous en arrière en pliant le bassin, le dos parfaitement plat, et saisissez la barre bras tendus.",
      "Fléchissez légèrement les genoux jusqu'à ce que vos tibias effleurent la barre.",
      "Engagez fermement vos dorsaux en tirant les coudes en arrière, ouvrez la poitrine vers le haut.",
      "Poussez vos pieds dans le sol pour lever la charge, en gardant la barre au contact de vos jambes tout le long.",
      "Verrouillez complètement les hanches et les genoux au sommet de la répétition sans cambrer excessivement le dos."
    ],
    tips: [
      "Pensez à repousser le sol avec vos jambes au départ plutôt que de tirer la barre à la force des lombaires.",
      "Assurez-vous de maintenir une rigidité abdominale maximale (manœuvre de Valsalva) sous tension extrême."
    ],
    commonMistakes: [
      "Enrouler la colonne lombaire (dos rond) sous la tension gravitationnelle initiale.",
      "Laisser la barre s'écarter du corps, augmentant le levier mécanique défavorable sur les vertèbres L4/L5."
    ],
    emgActivation: 91.2,
    popularityRating: 97,
    caloriesPerMin: 12.5,
    hormonalImpact: "Induction androgénique systémique maximale. Sollicitation du système endocrinien entier",
    riskRewardRatio: "Modéré à Élevé. Nécessite une rigueur technique absolue sur l'axe du dos",
    movementPattern: "Charnière de Hanche (Hip Hinge)",
    mechanic: "Polyarticulaire"
  },
  {
    id: "ex_pull_up",
    name: "Tractions Pronation (Pull-Ups)",
    description: "Le roi des exercices au poids de corps pour élargir le dos et bâtir un buste en V. Ce mouvement développe l'épaisseur et la largeur du grand dorsal tout en stimulant la force de poignée et de préhension.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Grand Dorsal",
    secondaryMuscles: ["Biceps", "Trapèzes Inférieurs", "Rhomboïdes", "Brachioradial"],
    equipment: "Barre de traction",
    instructions: [
      "Saisissez la barre de traction en pronation (paumes vers l'avant), écartement supérieur aux épaules.",
      "Commencez suspendu bras tendus, épaules libérées mais actives.",
      "Initiez le mouvement en glissant et en tirant vos omoplates vers le bas et l'arrière.",
      "Tirez activement vos coudes vers le bas pour amener la gorge ou le haut du torse au niveau de la barre.",
      "Contrôlez fermement la phase de retour (descente excentrique) jusqu'à extension complète des bras."
    ],
    tips: [
      "Imaginez que vous voulez tirer la barre vers le bas plutôt que de vous élever vous-même.",
      "Contractez fermement les abdominaux et les jambes pour éradiquer tout balancement ou effet pendulaire."
    ],
    commonMistakes: [
      "Demi-répétitions au milieu de la course ou triche d'élan cinétique avec le bas du corps (kipping).",
      "Épaules s'enroulant vers l'avant en haut de la contraction."
    ],
    emgActivation: 78.5,
    popularityRating: 94,
    caloriesPerMin: 8.0,
    hormonalImpact: "Modéré. Égale répartition du stress métabolique",
    riskRewardRatio: "Excellent. Très protecteur et réparateur pour les articulations de l'épaule",
    movementPattern: "Tirage Vertical",
    mechanic: "Polyarticulaire"
  },
  {
    id: "ex_overhead_press",
    name: "Développé Militaire (Overhead Press)",
    description: "L'outil ultime pour bâtir des épaules en trois dimensions tout en fortifiant la sangle abdominale. Ce mouvement exige une co-contraction parfaite du corps entier pour transférer l'énergie du sol vers les mains.",
    difficulty: "Avancé",
    primaryMuscle: "Deltoïdes",
    secondaryMuscles: ["Triceps", "Haut des Pectoraux", "Trapèzes supérieurs", "Sangle abdominale"],
    equipment: "Barre d'haltérophilie",
    instructions: [
      "Positionnez la barre sur vos clavicules supérieures, avec une saisie juste à l'extérieur des épaules.",
      "Contractez vos fessiers, quadriceps et abdominaux afin de former une base stable de maintien axiale.",
      "Poussez la barre de manière rectiligne vers le ciel en ouvrant légèrement le visage en arrière au départ.",
      "Repassez le visage sous la barre une fois celle-ci au-dessus des yeux, et verrouillez l'extension complète des bras.",
      "Ramenez la barre de façon ralentie sous tension jusqu'aux clavicules de départ."
    ],
    tips: [
      "Garantissez que vos avant-bras restent parfaitement verticaux directement en dessous de la barre.",
      "Conservez une tension rigide des cuisses/fessiers pour éviter l'hyperextension lombaire compensatrice."
    ],
    commonMistakes: [
      "Cambrer exagérément le bas du dos (lordose forcée) sous prétexte de vouloir forcer le développé haut.",
      "Laisser les coudes s'écarter latéralement, ce qui maltraite l'acromion de l'épaule."
    ],
    emgActivation: 73.0,
    popularityRating: 90,
    caloriesPerMin: 7.2,
    hormonalImpact: "Forte stimulation de la sécrétion d'androgènes locaux pour la ceinture scapulaire",
    riskRewardRatio: "Excellent si la mobilité de l'extension de colonne thoracique est appropriée",
    movementPattern: "Poussée Verticale",
    mechanic: "Polyarticulaire"
  },
  {
    id: "ex_barbell_row",
    name: "Tirage Buste Penché (Barbell Row)",
    description: "Un pilier absolu pour densifier et élargir la masse du dos (grand dorsal, rhomboïdes et haut des trapèzes). Cet exercice de tirage horizontal préserve la santé de l'épaule en créant un contrepoids idéal au développé couché.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Grand Dorsal / Grand Rond",
    secondaryMuscles: ["Trapèzes moyens/inférieurs", "Rhomboïdes", "Deltoïde Postérieur", "Biceps"],
    equipment: "Barre de musculation",
    instructions: [
      "Saisissez la barre en pronation, largeur moyenne, déverrouillez les genoux et basculez le buste à 45°.",
      "Maintenez la nuque neutre et le bassin aligné de façon rigide.",
      "Tirez activement la barre vers la partie inférieure de votre abdomen en projetant vos coudes vers le haut.",
      "Resserrez très fermement vos omoplates d'une contre l'autre en fin d'effort concentrique.",
      "Relâchez lentement la charge vers le sol en maîtrisant l'étirement des muscles dorsaux."
    ],
    tips: [
      "Imaginez que vos mains ne sont que des crochets et initiez la force en tirant de manière pure par les coudes.",
      "Changez pour une prise supination pour augmenter le travail des biceps et recruter les dorsaux inférieurs."
    ],
    commonMistakes: [
      "Dresser le buste au fur et à mesure des répétitions en s'aidant de l'élan des hanches (rowing debout inefficace).",
      "Laisser le dos s'enrouler pendant la charge excentrique."
    ],
    emgActivation: 84.1,
    popularityRating: 95,
    caloriesPerMin: 7.8,
    hormonalImpact: "Modérée à Élevée. Stimule la croissance myofibrillaire de la chaîne scapulaire",
    riskRewardRatio: "Excellent si le gainage lombaire résiste à la pesanteur statique",
    movementPattern: "Tirage Horizontal",
    mechanic: "Polyarticulaire"
  },
  {
    id: "ex_bulgarian_split_squat",
    name: "Squat Bulgare (Bulgarian Split Squat)",
    description: "Un chef-d'œuvre unilatéral d'une efficacité redoutable pour corriger les déséquilibres musculaires verticaux. Il cible de manière dévastatrice les quadriceps et le grand fessier tout en améliorant la stabilité articulaire de la hanche et de la cheville.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Fessiers", "Ischio-jambiers", "Adducteurs", "Moyen Fessier"],
    equipment: "Haltères & Banc",
    instructions: [
      "Debout, placez un pied en arrière, le dessus du pied reposant sur un banc stable derrière vous.",
      "Tenez un haltère dans chaque main en laissant pendre les bras le long du corps de manière verticale.",
      "Descendez le bassin verticalement jusqu'à ce que votre genou arrière effleure presque le sol.",
      "Gardez le genou avant bien aligné avec votre pied sans le laisser rentrer.",
      "Repoussez fermement à travers le talon avant pour remonter à la position initiale."
    ],
    tips: [
      "Inclinez légèrement le buste en avant pour solliciter davantage les fessiers, ou gardez-le droit pour cibler les quadriceps.",
      "Assurez-vous de placer votre pied avant suffisamment en avant pour éviter une trop forte flexion du genou."
    ],
    commonMistakes: [
      "S'affaisser latéralement par manque de stabilisation pelvienne.",
      "Utiliser excessivement la jambe arrière pour pousser et tricher."
    ],
    emgActivation: 85.2,
    popularityRating: 92,
    caloriesPerMin: 9.5,
    hormonalImpact: "Forte induction locale de facteurs de croissance IGF-1 unilatéraux",
    riskRewardRatio: "Excellent. Très faible contrainte de compression sur la colonne lombaire comparé au squat bilatéral",
    movementPattern: "Squat Unilatéral",
    mechanic: "Polyarticulaire"
  },
  {
    id: "ex_roman_deadlift",
    name: "Soulevé de Terre Roumain (Romanian Deadlift)",
    description: "Le mouvement d'isolation fonctionnel par excellence pour le recrutement des ischio-jambiers et du grand fessier sous étirement. Idéal pour optimiser la décélération athlétique et prévenir les blessures aux genoux et aux hanches.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Ischio-jambiers / Fessiers",
    secondaryMuscles: ["Érecteurs du rachis", "Dorsaux", "Sangle abdominale"],
    equipment: "Haltères ou Barre",
    instructions: [
      "Debout, tenez la barre ou les haltères collés à vos cuisses, les pieds écartés largeur des hanches.",
      "Envoyez vos fesses le plus loin possible en arrière (charnière de hanche) tout en gardant vos genoux légèrement déverrouillés à 15°.",
      "Faites glisser la charge le long des cuisses, en maintenant le dos rigide et neutre, jusqu'à ressentir un étirement puissant dans l'arrière de la cuisse.",
      "Contractez volontairement les fessiers et ramenez vos hanches vers l'avant pour revenir en position verticale."
    ],
    tips: [
      "Ne cherchez pas à descendre la charge au sol : le mouvement s'arrête dès que vos hanches ne reculent plus.",
      "Gardez toujours la barre en contact physique continu avec vos jambes."
    ],
    commonMistakes: [
      "Laisser le haut du dos s'enrouler ou céder lors de la flexion.",
      "Plier les genoux de façon exagérée, ce qui annule toute tension sur les ischio-jambiers."
    ],
    emgActivation: 89.0,
    popularityRating: 96,
    caloriesPerMin: 9.0,
    hormonalImpact: "Forte libération métabolique de somatolibérines",
    riskRewardRatio: "Excellent pour le rééquilibrage musculaire agoniste/antagoniste de la jambe",
    movementPattern: "Charnière de Hanche (Hip Hinge)",
    mechanic: "Polyarticulaire"
  },
  {
    id: "ex_face_pull",
    name: "Face Pull avec Corde",
    description: "Le meilleur exercice de rééducation et de renforcement pour restaurer la posture scapulaire et stimuler le deltoïde postérieur. Il lutte activement contre le syndrome de l'enroulement d'épaule induit par les sports de poussée répétés.",
    difficulty: "Débutant",
    primaryMuscle: "Deltoïdes (faisceau postérieur)",
    secondaryMuscles: ["Trapèzes Moyen/Supérieur", "Rhomboïdes", "Infraspinatus (Rotateurs)"],
    equipment: "Poulie haute & Corde",
    instructions: [
      "Réglez la poulie à hauteur des yeux, saisissez la corde paumes l'une vers l'autre.",
      "Faites un pas en arrière pour soulever la charge, adoptez une posture solide à genoux ou semi-fléchie.",
      "Tirez la corde vers votre front ou votre nez en écartant activement les mains latéralement.",
      "Terminez le mouvement en rétractant vos omoplates et en effectuant une rotation externe des poignets (pouces vers l'arrière).",
      "Contrôlez le retour de la corde jusqu'à l'extension scapulaire complète."
    ],
    tips: [
      "Concentrez-vous sur le deltoïde postérieur et non pas sur l'attraction axiale par vos biceps.",
      "En fin de tirage, vos mains doivent être au moins aussi reculées que vos coudes (W pos)."
    ],
    commonMistakes: [
      "Tirer la corde de manière descendante vers le menton.",
      "Utiliser une charge excessive pour forcer avec l'élan de tout le buste."
    ],
    emgActivation: 78.0,
    popularityRating: 91,
    caloriesPerMin: 4.0,
    hormonalImpact: "Faible induction endocrine, mais fort impact correctif postural",
    riskRewardRatio: "Extraordinaire. Pratiquement aucun risque de blessure",
    movementPattern: "Tirage Horizontal avec Rotation",
    mechanic: "Isolation"
  },
  {
    id: "ex_skullcrusher",
    name: "Extensions Triceps au Front (Barbe EZ)",
    description: "Encore appelé Skullcrusher. Cet exercice cible spécifiquement la portion longue du triceps grâce à la position des bras au-delà de la ligne scapulaire, favorisant un étirement complet et une hypertrophie rapide de l'arrière du bras.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Triceps",
    secondaryMuscles: ["Haut des Pectoraux", "Deltoïde Antérieur"],
    equipment: "Banc & Barre EZ",
    instructions: [
      "Allongez-vous sur un banc plat, tenez la barre EZ bras tendus perpendiculaires au sol.",
      "Inclinez vos bras de 10° à 15° en arrière vers votre tête (pour maintenir une tension permanente).",
      "Fléchissez uniquement les coudes pour abaisser lentement la barre vers votre front ou légèrement au-dessus.",
      "Maintenez une position fixe des coudes tout au long du geste.",
      "Étendez les bras de manière vigoureuse en contractant les triceps sans écarter les coudes."
    ],
    tips: [
      "Utilisez une barre EZ au lieu d'une barre droite pour réduire fortement le stress de torsion sur les poignets.",
      "Gardez vos coudes collés vers l'intérieur, ne les laissez pas dériver sur les côtés flasques."
    ],
    commonMistakes: [
      "Faire dériver les bras d'avant en arrière (transformant l'extension en pullover).",
      "Terminer brutalement ou claquer les articulations du coude au sommet de l'effort."
    ],
    emgActivation: 86.8,
    popularityRating: 93,
    caloriesPerMin: 5.5,
    hormonalImpact: "Localisée. Déclenchement de la synthèse des protéines régionales",
    riskRewardRatio: "Excellent s'il est effectué de façon ralentie sous le contrôle du tempo",
    movementPattern: "Extension de Coude",
    mechanic: "Isolation"
  },
  {
    id: "ex_ab_wheel",
    name: "Roulette Abdominale (Ab Wheel Rollout)",
    description: "Un exercice d'anti-extension d'une intensité inégalée pour fortifier le core profond et le muscle transverse. Il oblige les abdominaux à retenir l'inclinaison forcée du rachis sous une contrainte de levier cinétique maximale.",
    difficulty: "Avancé",
    primaryMuscle: "Abdominaux",
    secondaryMuscles: ["Dorsaux", "Fessiers", "Triceps", "Grand Droit / Transverse"],
    equipment: "Roue abdominale / Ab Wheel",
    instructions: [
      "À genoux sur un tapis doux, tenez les poignées de l'Ab Wheel de part et d'autre.",
      "Enroulez légèrement la colonne vers le haut et contractez intensément les fessiers et la ceinture abdominale (posture hollow body).",
      "Faites rouler la roue vers l'avant de manière progressive en alignant votre bassin avec vos bras.",
      "Descendre le plus bas possible en conservant la sangle abdominale ultra-soudée, sans laisser cambrer les lombaires.",
      "Tirez la roue vers l'arrière en contractant uniquement les abdominaux pour retrouver la posture initiale."
    ],
    tips: [
      "Faites l'exercice face à un mur pour limiter physiquement la descente et progresser sans risquer l'affaissement dorsal.",
      "Si vous perdez la contraction fessière, stoppez immédiatement pour protéger vos disques lombaires."
    ],
    commonMistakes: [
      "Laisser le bas du dos se creuser vers le bas en position allongée, ce qui pince brutalement la colonne vertebrale.",
      "Tirer de façon erronée avec les bras et la hanche au lieu de contracter le torse."
    ],
    emgActivation: 92.5,
    popularityRating: 89,
    caloriesPerMin: 6.8,
    hormonalImpact: "Faible induction systémique, mais renforcement d'impact de gainage interne phénoménal",
    riskRewardRatio: "Élevé pour les débutants. Nécessite une sangle abdominale préalablement exercée",
    movementPattern: "Anti-Extension du Tronc",
    mechanic: "Polyarticulaire",
    equipment_required: ["Roue abdominale"],
    equipment_alternatives: ["Poids du corps"],
    no_equipment_version: true,
    minimum_space_required: "small",
    noise_level: "silent"
  },
  {
    id: "ex_pushup_standard",
    name: "Pompes Classiques (Standard Push-up)",
    description: "L'exercice de poussée au poids de corps de référence universel. Il recrute l'intégralité du grand pectoral, des triceps et stabilise la colonne abdominale.",
    difficulty: "Débutant",
    primaryMuscle: "Pectoraux",
    secondaryMuscles: ["Triceps", "Deltoïdes"],
    equipment: "Aucun",
    instructions: [
      "Positionnez vos mains au sol, légèrement plus larges que la largeur d'épaules, corps droit.",
      "Engagez activement le gainage abdominal et fessier.",
      "Descendez de façon lente jusqu'à frôler le sol avec la poitrine.",
      "Repoussez puissamment avec les bras jusqu'à l'extension complète des coudes."
    ],
    tips: [
      "Gardez vos coudes à environ 45 degrés de votre torse pour préserver les articulations.",
      "Exprimez votre force de manière unifiée, sans laisser le bassin s'affaisser."
    ],
    commonMistakes: [
      "Laisser s'affaisser les lombaires (dos creusé ou ventre mou).",
      "Écarter les coudes à 90 degrés, ce qui crée un conflit sous-acromial."
    ],
    emgActivation: 64.2,
    popularityRating: 95,
    caloriesPerMin: 7.2,
    hormonalImpact: "Modéré. Stimulation d'hypertrophie locale",
    riskRewardRatio: "Extraordinaire. Idéal pour tous niveaux",
    movementPattern: "Poussée Horizontale",
    mechanic: "Polyarticulaire",
    equipment_required: ["Poids du corps"],
    no_equipment_version: true,
    minimum_space_required: "tiny",
    noise_level: "silent"
  },
  {
    id: "ex_diamond_push_up",
    name: "Pompes Diamant (Diamond Push-up)",
    description: "Une variante de pompe hautement efficace sollicitant particulièrement les triceps grâce au changement de levier mécanique et au rapprochement des mains.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Triceps",
    secondaryMuscles: ["Pectoraux", "Deltoïdes"],
    equipment: "Aucun",
    instructions: [
      "Placez vos mains rapprochées sous votre poitrine, les index et les pouces se touchent en formant un diamant.",
      "Corps rigide, descendez doucement jusqu'à ce que votre sternum effleure vos mains.",
      "Poussez de manière explosive pour revenir en haut."
    ],
    tips: [
      "Gardez vos coudes le long du torse tout au long du mouvement.",
      "Si c'est trop difficile, commencez incliné contre un canapé ou une table solide."
    ],
    commonMistakes: [
      "Laisser les coudes s'écarter de force vers l'extérieur.",
      "Tirer sur le cou ou perdre la rectitude du gainage."
    ],
    emgActivation: 76.5,
    popularityRating: 90,
    caloriesPerMin: 7.5,
    hormonalImpact: "Concentré sur les triceps et faisceaux internes des pectoraux",
    riskRewardRatio: "Excellent",
    movementPattern: "Poussée Horizontale",
    mechanic: "Isolation",
    equipment_required: ["Poids du corps"],
    no_equipment_version: true,
    minimum_space_required: "tiny",
    noise_level: "silent"
  },
  {
    id: "ex_pike_push_up",
    name: "Pompes Piquées (Pike Push-up)",
    description: "Pré-requis indispensable au handstand push-up, cet exercice élève vos hanches pour modifier l'axe gravitationnel et cibler verticalement les deltoïdes.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Deltoïdes",
    secondaryMuscles: ["Triceps", "Trapèzes"],
    equipment: "Aucun",
    instructions: [
      "Adoptez une position de départ en pompes, puis reculez vos pieds en élevant vos hanches vers le plafond pour former un V inversé.",
      "Fléchissez vos coudes et descendez le sommet de votre tête vers le sol de façon contrôlée.",
      "Repoussez énergiquement jusqu'à étendre pleinement vos coudes."
    ],
    tips: [
      "Regardez vers vos pieds pour conserver la nuque neutre.",
      "Plus vos pieds sont près de vos mains, plus la charge verticale sur vos épaules est intense."
    ],
    commonMistakes: [
      "Écarter les coudes sur les côtés au lieu de les rabattre légèrement vers l'arrière.",
      "Arrondir excessivement le haut du dos."
    ],
    emgActivation: 71.2,
    popularityRating: 88,
    caloriesPerMin: 6.8,
    hormonalImpact: "Excellent recrutement des faisceaux antérieurs et moyens des épaules",
    riskRewardRatio: "Modéré. Attention à l'équilibre cervical",
    movementPattern: "Poussée Verticale",
    mechanic: "Polyarticulaire",
    equipment_required: ["Poids du corps"],
    no_equipment_version: true,
    minimum_space_required: "tiny",
    noise_level: "silent"
  },
  {
    id: "ex_bodyweight_squat",
    name: "Squats Poids de Corps (Air Squat)",
    description: "Mouvement roi de base pour le bas du corps en mode zéro matériel. Il maintient la souplesse articulaire et renforce les quadriceps et fessiers.",
    difficulty: "Débutant",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Ischio-jambiers / Fessiers"],
    equipment: "Aucun",
    instructions: [
      "Debout, les pieds écartés de la largeur d'épaules, tendez vos bras devant pour l'équilibre.",
      "Descendez le bassin sous la parallèle en contrôlant la flexion de hanche.",
      "Conservez vos pieds bien à plat, talons collés au sol.",
      "Remontez puissamment en poussant sur vos pieds."
    ],
    tips: [
      "Gardez le buste aussi fier et droit que possible.",
      "Poussez doucement vos genoux vers l'extérieur pendant la descente."
    ],
    commonMistakes: [
      "Laisser les genoux rentrer en dedans (valgus dynamique).",
      "Décoller les talons du sol en reportant la charge sur les genoux."
    ],
    emgActivation: 50.5,
    popularityRating: 94,
    caloriesPerMin: 8.5,
    hormonalImpact: "Bénéfices endocrines généraux",
    riskRewardRatio: "Extraordinaire. Presque aucun risque physique",
    movementPattern: "Squat",
    mechanic: "Polyarticulaire",
    equipment_required: ["Poids du corps"],
    no_equipment_version: true,
    minimum_space_required: "tiny",
    noise_level: "silent"
  },
  {
    id: "ex_table_row",
    name: "Tirage horizontal sous Table (Inverted Table Row)",
    description: "Alternative ingénieuse au rowing en salle, cet exercice utilise une table solide pour solliciter les dorsaux et biceps sans aucun équipement professionnel.",
    difficulty: "Débutant",
    primaryMuscle: "Grand Dorsal",
    secondaryMuscles: ["Triceps", "Abdominaux", "Biceps"],
    equipment: "Table solide",
    instructions: [
      "Allongez-vous sur le dos sous une table hyper-stable.",
      "Saisissez fermement le rebord avec vos mains, corps gainé en planche talon-tête.",
      "Tirez votre poitrine vers la table en rapprochant vos omoplates.",
      "Redescendez lentement et de façon maîtrisée."
    ],
    tips: [
      "Assurez-vous de la robustesse de votre table au préalable.",
      "N'hésitez pas à plier vos genoux à 90° pour faciliter la traction au début."
    ],
    commonMistakes: [
      "Laisser le bassin s'affaisser vers le bas.",
      "Perdre la tension du haut du dos ou donner des à-coups."
    ],
    emgActivation: 71.0,
    popularityRating: 84,
    caloriesPerMin: 6.2,
    hormonalImpact: "Action directe sur l'épaisseur du dos et biceps",
    riskRewardRatio: "Faible si la table est parfaitement stable",
    movementPattern: "Tirage Horizontal",
    mechanic: "Polyarticulaire",
    equipment_required: ["Poids du corps", "Table"],
    no_equipment_version: true,
    minimum_space_required: "small",
    noise_level: "silent"
  },
  {
    id: "ex_glute_bridge",
    name: "Pont Fessier Isométrique (Glute Bridge)",
    description: "Un must-have pour réveiller et tonifier l'ensemble pyramidal fessier et isoler la chaîne postérieure sans impact articulaire négatif.",
    difficulty: "Débutant",
    primaryMuscle: "Ischio-jambiers / Fessiers",
    secondaryMuscles: ["Abdominaux"],
    equipment: "Aucun",
    instructions: [
      "Allongez-vous au dos, les genoux fléchis et les pieds posés à plat au sol, écartés largeur hanche.",
      "Poussez fort sur vos talons et levez votre bassin pour aligner genoux, hanches et épaules.",
      "Contractez intensément vos fessiers au sommet pendant 2 secondes.",
      "Redescendez lentement à la position de départ."
    ],
    tips: [
      "Poussez activement vos bras et paumes au sol pour maximiser l'équilibre.",
      "Pour durcir l'exercice, passez sur une seule jambe !"
    ],
    commonMistakes: [
      "Cambrer trop le bas du dos en fin d'effort (hyperextension lombaire inutile).",
      "Pousser sur l'avant-pied plutôt que sur les talons."
    ],
    emgActivation: 65.5,
    popularityRating: 92,
    caloriesPerMin: 5.0,
    hormonalImpact: "Excellent isolement métabolique local",
    riskRewardRatio: "Merveilleux. Hautement recommandé en physiothérapie",
    movementPattern: "Charnière de Hanche (Hip Hinge)",
    mechanic: "Isolation",
    equipment_required: ["Poids du corps"],
    no_equipment_version: true,
    minimum_space_required: "tiny",
    noise_level: "silent"
  },
  {
    id: "ex_plank",
    name: "Planche Abdominale Active (Standard Plank)",
    description: "Le pilier de la force interne du tronc. Ce gainage statique sollicite le transverse profond pour bâtir un ventre plat et solide.",
    difficulty: "Débutant",
    primaryMuscle: "Abdominaux",
    secondaryMuscles: ["Deltoïdes", "Triceps"],
    equipment: "Aucun",
    instructions: [
      "Posez vos avant-bras au sol, les coudes positionnés directement sous vos épaules.",
      "Étendez vos jambes derrière, en appui sur vos orteils. Le corps doit former une ligne parfaite.",
      "Aspirez votre nombril vers le haut et contractez les fessiers à 100%.",
      "Maintenez la position en respirant de façon calme et dynamique."
    ],
    tips: [
      "N'arrondissez pas excessivement le haut du dos et ne laissez pas votre tête pendre.",
      "Pensez à éloigner vos épaules de vos oreilles."
    ],
    commonMistakes: [
      "Laisser pendre ou s'affaisser les fesses vers le sol, tirant sur le bas du dos.",
      "Lever les hanches trop haut en forme de tente, éliminant le travail abdominal."
    ],
    emgActivation: 58.0,
    popularityRating: 98,
    caloriesPerMin: 4.8,
    hormonalImpact: "Excellente activation neuromusculaire faciale",
    riskRewardRatio: "Parfait. Très bénéfique pour les lombaires chroniques",
    movementPattern: "Anti-Extension du Tronc",
    mechanic: "Isolation",
    equipment_required: ["Poids du corps"],
    no_equipment_version: true,
    minimum_space_required: "tiny",
    noise_level: "silent"
  },
  {
    id: "ex_burpee",
    name: "Burpees Métaboliques (Elite Burpee)",
    description: "Mouvement d'élite d'une intensité explosive alliant squats, planches et sauts pour stimuler le VO2Max de façon fulgurante.",
    difficulty: "Intermédiaire",
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Pectoraux", "Triceps", "Abdominaux"],
    equipment: "Aucun",
    instructions: [
      "Depuis la position debout, fléchissez vos genoux et posez les mains au sol devant vous.",
      "Lancez vos pieds en arrière d'un coup sec pour atterrir en position de pompe haute.",
      "Effectuez une demi-pompe ou touchez la poitrine au sol.",
      "Ramenez vos pieds instantanément sous votre bassin.",
      "Explosez vers le haut dans un saut vertical en levant les mains au ciel."
    ],
    tips: [
      "Trouvez un rythme fluide : il s'agit d'endurance plus que de vains sprints désorganisés.",
      "Amortissez votre atterrissage de saut en repliant souplement vos genoux."
    ],
    commonMistakes: [
      "Laisser le dos s'écraser sous forme d'hyperlordose lors du saut arrière.",
      "Réceptionner les sauts avec les genoux raides."
    ],
    emgActivation: 80.5,
    popularityRating: 91,
    caloriesPerMin: 14.2,
    hormonalImpact: "Floculation catabolique propice à l'effet Afterburn (EPOC)",
    riskRewardRatio: "Modéré. Exige de l'attention au niveau articulaire",
    movementPattern: "Squat + Poussée",
    mechanic: "Polyarticulaire",
    equipment_required: ["Poids du corps"],
    no_equipment_version: true,
    minimum_space_required: "small",
    noise_level: "medium"
  },
  {
    id: "ex_dumbbell_lateral_raise",
    name: "Élévations Latérales (Dumbbell Lateral Raise)",
    description: "L'exercice phare pour cibler le faisceau moyen du deltoïde et donner cette apparence d'épaules larges en trois dimensions.",
    difficulty: "Débutant",
    primaryMuscle: "Deltoïdes",
    secondaryMuscles: ["Trapèzes"],
    equipment: "Haltères",
    instructions: [
      "Debout, tenez un haltère dans chaque main le long du corps, coudes déverrouillés.",
      "Élevez les bras latéralement sur les côtés jusqu'à ce qu'ils soient parallèles au sol.",
      "Abaissez lentement les haltères de façon contrôlée sous tension."
    ],
    tips: [
      "Pensez à mener le mouvement avec vos coudes, comme pour verser de l'eau.",
      "Évitez de monter les haltères au-dessus de la ligne des épaules."
    ],
    commonMistakes: [
      "S'aider du buste en balançant le corps d'avant en arrière (perte d'isolation).",
      "Épaules haussées à outrance au lieu de rester basses."
    ],
    emgActivation: 73.5,
    popularityRating: 96,
    caloriesPerMin: 3.5,
    hormonalImpact: "Locale. Excellente hypertrophie des épaules",
    riskRewardRatio: "Excellent",
    movementPattern: "Poussée Verticale",
    mechanic: "Isolation",
    equipment_required: ["Haltères"],
    equipment_alternatives: ["Bandes élastiques"],
    no_equipment_version: false,
    minimum_space_required: "tiny",
    noise_level: "silent"
  },
  {
    id: "ex_banded_pull_apart",
    name: "Écarteur avec Élastique (Banded Pull-Apart)",
    description: "Le meilleur exercice préventif postural. Il renforce le deltoïde postérieur et resserre les omoplates pour contrebalancer les journées passées assis.",
    difficulty: "Débutant",
    primaryMuscle: "Deltoïdes (faisceau postérieur)",
    secondaryMuscles: ["Grand Dorsal"],
    equipment: "Bandes élastiques",
    instructions: [
      "Tenez une bande élastique à deux mains devant vous à hauteur de poitrine, bras tendus.",
      "Écartez vos bras de part et d'autre vers les côtés en étirant l'élastique jusqu'à ce qu'il effleure votre poitrine.",
      "Resserrez vos omoplates à la fin de la contraction.",
      "Ramenez lentement les bras devant."
    ],
    tips: [
      "Modifiez la tension en écartant ou rapprochant vos mains de départ.",
      "Conservez vos épaules bien basses."
    ],
    commonMistakes: [
      "Hausser les épaules (hausse inutile des trapèzes supérieurs).",
      "Plier les coudes lors de l'effort au lieu de garder les bras stables."
    ],
    emgActivation: 74.0,
    popularityRating: 90,
    caloriesPerMin: 4.0,
    hormonalImpact: "Action musculaire locale réparatrice",
    riskRewardRatio: "Extraordinaire. Recommandé quotidiennement",
    movementPattern: "Tirage Horizontal",
    mechanic: "Isolation",
    equipment_required: ["Bandes élastiques"],
    equipment_alternatives: ["Haltères"],
    no_equipment_version: false,
    minimum_space_required: "tiny",
    noise_level: "silent"
  }
];
