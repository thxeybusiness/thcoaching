/**
 * Le contenu du programme, source unique partagée par l'accueil et la page
 * détaillée. Cinq pôles, quarante-trois compétences.
 */

export type Competence = { titre: string; texte: string; icone: string };

export type Pole = {
  cle: string;
  num: string;
  /** Nom complet, utilisé sur la page détaillée */
  titre: string;
  /** Nom court, pour l'orbite et le bloc de l'accueil */
  court: string;
  /** Rôle dans la progression : prérequis, cœur ou accélérateur */
  role: string;
  /** Sous-titre du pôle */
  promesse: string;
  competences: Competence[];
};

export const POLES: Pole[] = [
  {
    cle: "fondations",
    num: "01",
    titre: "Fondations de soi",
    court: "Fondations",
    role: "Prérequis",
    promesse: "Le socle personnel, mental et physique",
    competences: [
      {
        titre: "Vision et objectifs",
        icone: "vision",
        texte:
          "Définir un cap clair à long terme, puis le découper en objectifs atteignables et mesurables.",
      },
      {
        titre: "Mindset",
        icone: "mindset",
        texte:
          "Discipline, gestion des émotions et de l'échec, capacité à tenir un cap sur le long terme sans dépendre de la motivation.",
      },
      {
        titre: "Confiance en soi / rapport à l'échec",
        icone: "confiance",
        texte:
          "Construire une confiance qui ne dépend pas des résultats, et faire de l'échec une source d'information plutôt qu'un point d'arrêt.",
      },
      {
        titre: "Rapport au regard des autres",
        icone: "regard",
        texte:
          "Se libérer de la peur du jugement pour oser publier, vendre et se montrer.",
      },
      {
        titre: "Gestion du stress et régulation nerveuse",
        icone: "stress",
        texte:
          "Reconnaître ses signaux de tension et disposer d'outils concrets — respiration, récupération, rythme — pour revenir au calme.",
      },
      {
        titre: "Environnement",
        icone: "environnement",
        texte:
          "Aménager son lieu de travail, ses outils et ses habitudes pour que le bon comportement devienne le plus facile.",
      },
      {
        titre: "Gestion des relations proches",
        icone: "proches",
        texte:
          "Poser un cadre avec l'entourage : expliquer sa démarche, protéger son temps, éviter que les proches deviennent un frein.",
      },
      {
        titre: "Comprendre son corps et son cerveau",
        icone: "physiologie",
        texte:
          "Notions de physiologie et de neurosciences appliquées : dopamine, cortisol, cycles d'énergie, mécanismes de l'attention et de la mémoire.",
      },
      {
        titre: "Sommeil",
        icone: "sommeil",
        texte:
          "Optimisation de la récupération : régularité des cycles, qualité du sommeil profond, impact direct sur la concentration et la prise de décision.",
      },
      {
        titre: "Alimentation",
        icone: "alimentation",
        texte:
          "Nutrition fonctionnelle : stabilité de l'énergie sur la journée, clarté mentale, santé métabolique à long terme.",
      },
      {
        titre: "Sport",
        icone: "sport",
        texte:
          "Entretien de la condition physique, gestion du stress par l'effort, construction de la discipline par l'entraînement régulier.",
      },
    ],
  },
  {
    cle: "creer",
    num: "02",
    titre: "Créer & se démarquer",
    court: "Créer",
    role: "Cœur",
    promesse: "Produire, et se rendre reconnaissable",
    competences: [
      {
        titre: "Personal branding",
        icone: "branding",
        texte:
          "Construire une identité claire : positionnement, valeurs, ton et promesse qu'on reconnaît d'un coup d'œil.",
      },
      {
        titre: "Direction artistique",
        icone: "da",
        texte:
          "Définir un univers visuel cohérent — couleurs, typographies, références — et s'y tenir sur tous les supports.",
      },
      {
        titre: "Storytelling",
        icone: "storytelling",
        texte:
          "Structurer un récit qui retient l'attention : tension, transformation, preuve, et une raison de rester jusqu'au bout.",
      },
      {
        titre: "Création de contenu",
        icone: "contenu",
        texte:
          "Stratégie éditoriale, storytelling, formats adaptés à chaque plateforme, régularité de publication.",
      },
      {
        titre: "Copywriting",
        icone: "copywriting",
        texte:
          "Écrire pour faire agir : accroches, argumentaires, appels à l'action, sans promesses creuses.",
      },
      {
        titre: "Graphisme",
        icone: "graphisme",
        texte:
          "Identité visuelle, composition, typographie, couleurs ; maîtrise des outils de design.",
      },
      {
        titre: "Photo et prise de vue",
        icone: "photo",
        texte:
          "Cadrage, lumière et réglages pour produire soi-même des visuels nets et exploitables.",
      },
      {
        titre: "Prise de parole face caméra",
        icone: "camera",
        texte:
          "Être à l'aise devant l'objectif : posture, voix, rythme, et un discours qui tient sans script.",
      },
      {
        titre: "Montage vidéo",
        icone: "video",
        texte:
          "Narration par l'image, rythme, montage, sound design et étalonnage.",
      },
      {
        titre: "3D",
        icone: "cube",
        texte:
          "Modélisation, texturing, éclairage et rendu, pour des visuels différenciants.",
      },
      {
        titre: "Adaptation aux plateformes et algorithmes",
        icone: "plateformes",
        texte:
          "Comprendre ce que chaque plateforme met en avant, et adapter format, durée et accroche en conséquence.",
      },
    ],
  },
  {
    cle: "vente",
    num: "03",
    titre: "Vente & revenus",
    court: "Vente",
    role: "Cœur",
    promesse: "Générer et sécuriser du revenu",
    competences: [
      {
        titre: "Construction d'offre et pricing",
        icone: "offre",
        texte:
          "Bâtir une offre lisible : périmètre, résultat promis, format, et un prix qui tient face à la valeur délivrée.",
      },
      {
        titre: "Stratégie de vente",
        icone: "vente",
        texte:
          "Construction d'un système de vente complet : positionnement, ciblage, offre, tunnel d'acquisition et suivi.",
      },
      {
        titre: "Prospection / acquisition",
        icone: "prospection",
        texte:
          "Aller chercher ses premiers clients : canaux, volume, régularité, et messages qui obtiennent une réponse.",
      },
      {
        titre: "Qualification des prospects",
        icone: "qualification",
        texte:
          "Trier vite : identifier qui a le besoin, le budget et le bon moment, pour ne pas gaspiller son énergie.",
      },
      {
        titre: "Closing",
        icone: "closing",
        texte:
          "Maîtrise de l'entretien de vente : découverte du besoin, traitement des objections, cadrage et conclusion.",
      },
      {
        titre: "Négociation",
        icone: "negociation",
        texte:
          "Défendre son prix et ses conditions, trouver un accord tenable des deux côtés sans céder sur l'essentiel.",
      },
      {
        titre: "Suivi et relance",
        icone: "suivi",
        texte:
          "Organiser le suivi des échanges et relancer au bon moment : c'est là que se signe une grande partie des ventes.",
      },
      {
        titre: "Gestion client",
        icone: "client",
        texte:
          "Relation client de bout en bout : onboarding, communication, satisfaction, fidélisation et recommandations.",
      },
      {
        titre: "Preuve sociale et témoignages",
        icone: "preuve",
        texte:
          "Recueillir et mettre en scène des résultats vérifiables : avis, cas concrets, chiffres avant et après.",
      },
      {
        titre: "Upsell, cross-sell et récurrence",
        icone: "recurrence",
        texte:
          "Augmenter la valeur d'un client déjà acquis : offres complémentaires, montée en gamme, revenus récurrents.",
      },
      {
        titre: "Gestion financière",
        icone: "finance",
        texte:
          "Pilotage de l'argent : marge, trésorerie, séparation pro/perso, épargne, réinvestissement et fiscalité de base.",
      },
    ],
  },
  {
    cle: "systemes",
    num: "04",
    titre: "Systèmes & levier",
    court: "Systèmes",
    role: "Accélérateur",
    promesse: "Automatiser ce qui se répète",
    competences: [
      {
        titre: "Maîtrise de l'IA",
        icone: "ia",
        texte:
          "Compréhension des modèles, prompting efficace, automatisation de tâches et intégration de l'IA dans ses workflows.",
      },
      {
        titre: "Automatisation",
        icone: "automatisation",
        texte:
          "Repérer les tâches répétitives et les confier à des outils qui tournent sans intervention.",
      },
      {
        titre: "Systèmes et process",
        icone: "process",
        texte:
          "Écrire ses manières de faire pour qu'elles soient reproductibles, transmissibles et améliorables.",
      },
    ],
  },
  {
    cle: "organisation",
    num: "05",
    titre: "Organisation & croissance",
    court: "Organisation",
    role: "Accélérateur",
    promesse: "Piloter et faire grandir",
    competences: [
      {
        titre: "Création et gestion de projets / business",
        icone: "projets",
        texte:
          "Du concept au lancement : validation d'idée, structuration, exécution, suivi des indicateurs et scalabilité.",
      },
      {
        titre: "Gestion et optimisation du temps",
        icone: "temps",
        texte:
          "Priorisation, planification, deep work, élimination des tâches à faible valeur, délégation et automatisation.",
      },
      {
        titre: "Prise de décision",
        icone: "decision",
        texte:
          "Décider vite et bien malgré l'incertitude : critères clairs, coût de l'inaction, décisions réversibles ou non.",
      },
      {
        titre: "Apprentissage rapide",
        icone: "apprentissage",
        texte:
          "Acquérir une compétence nouvelle en un temps court : sélection des sources, pratique délibérée, retours immédiats.",
      },
      {
        titre: "Délégation et recrutement",
        icone: "delegation",
        texte:
          "Identifier ce qui doit sortir de ses mains, choisir la bonne personne et transmettre sans perdre en qualité.",
      },
      {
        titre: "Réseau et relations",
        icone: "reseau",
        texte:
          "Activation stratégique de son entourage : construction de relations de valeur, partenariats, opportunités et recommandations.",
      },
      {
        titre: "Partenariats et collaborations",
        icone: "partenariat",
        texte:
          "Monter des projets à plusieurs : complémentarité, cadre clair, répartition de la valeur et de la visibilité.",
      },
    ],
  },
];

export const NB_COMPETENCES = POLES.reduce(
  (n, p) => n + p.competences.length,
  0
);
