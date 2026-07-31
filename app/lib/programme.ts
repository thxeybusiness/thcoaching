/**
 * Le contenu du programme, source unique partagée par l'accueil et la page
 * détaillée. Quatre piliers, dix-sept compétences.
 */

export type Competence = { titre: string; texte: string; icone: string };

export type Pilier = {
  cle: string;
  num: string;
  /** Nom complet, utilisé sur la page détaillée */
  titre: string;
  /** Nom court, pour l'orbite et le bloc de l'accueil */
  court: string;
  /** Sous-titre du pilier */
  promesse: string;
  /** Résumé d'une ligne pour l'accueil */
  resume: string;
  competences: Competence[];
};

export const PILIERS: Pilier[] = [
  {
    cle: "fondations",
    num: "01",
    titre: "Fondations personnelles",
    court: "Fondations",
    promesse: "Le socle physique et mental",
    resume:
      "Mindset, physiologie, sommeil, alimentation, sport — le socle sur lequel tout le reste repose.",
    competences: [
      {
        icone: "mindset",
        titre: "Mindset",
        texte:
          "Discipline, gestion des émotions et de l'échec, capacité à tenir un cap sur le long terme sans dépendre de la motivation.",
      },
      {
        icone: "physiologie",
        titre: "Comprendre son corps et son cerveau",
        texte:
          "Notions de physiologie et de neurosciences appliquées : dopamine, cortisol, cycles d'énergie, mécanismes de l'attention et de la mémoire.",
      },
      {
        icone: "sommeil",
        titre: "Sommeil",
        texte:
          "Optimisation de la récupération : régularité des cycles, qualité du sommeil profond, impact direct sur la concentration et la prise de décision.",
      },
      {
        icone: "alimentation",
        titre: "Alimentation",
        texte:
          "Nutrition fonctionnelle : stabilité de l'énergie sur la journée, clarté mentale, santé métabolique à long terme.",
      },
      {
        icone: "sport",
        titre: "Sport",
        texte:
          "Entretien de la condition physique, gestion du stress par l'effort, construction de la discipline par l'entraînement régulier.",
      },
    ],
  },
  {
    cle: "commercial",
    num: "02",
    titre: "Compétences commerciales",
    court: "Commercial",
    promesse: "Générer et sécuriser du revenu",
    resume:
      "Stratégie de vente, closing, gestion client et pilotage financier.",
    competences: [
      {
        icone: "vente",
        titre: "Stratégie de vente",
        texte:
          "Construction d'un système de vente complet : positionnement, ciblage, offre, tunnel d'acquisition et suivi.",
      },
      {
        icone: "closing",
        titre: "Closing",
        texte:
          "Maîtrise de l'entretien de vente : découverte du besoin, traitement des objections, cadrage et conclusion.",
      },
      {
        icone: "client",
        titre: "Gestion client",
        texte:
          "Relation client de bout en bout : onboarding, communication, satisfaction, fidélisation et recommandations.",
      },
      {
        icone: "finance",
        titre: "Gestion financière",
        texte:
          "Pilotage de l'argent : marge, trésorerie, séparation pro/perso, épargne, réinvestissement et fiscalité de base.",
      },
    ],
  },
  {
    cle: "creatif",
    num: "03",
    titre: "Compétences créatives & techniques",
    court: "Créatif",
    promesse: "Produire et se rendre visible",
    resume:
      "Création de contenu, graphisme, montage vidéo, 3D et maîtrise de l'IA.",
    competences: [
      {
        icone: "contenu",
        titre: "Création de contenu",
        texte:
          "Stratégie éditoriale, storytelling, formats adaptés à chaque plateforme, régularité de publication.",
      },
      {
        icone: "graphisme",
        titre: "Graphisme",
        texte:
          "Identité visuelle, composition, typographie, couleurs ; maîtrise des outils de design.",
      },
      {
        icone: "video",
        titre: "Montage vidéo",
        texte:
          "Narration par l'image, rythme, montage, sound design et étalonnage.",
      },
      {
        icone: "cube",
        titre: "3D",
        texte:
          "Modélisation, texturing, éclairage et rendu, pour des visuels différenciants.",
      },
      {
        icone: "ia",
        titre: "Maîtrise de l'IA",
        texte:
          "Compréhension des modèles, prompting efficace, automatisation de tâches et intégration de l'IA dans ses workflows.",
      },
    ],
  },
  {
    cle: "pilotage",
    num: "04",
    titre: "Pilotage & levier",
    court: "Pilotage",
    promesse: "Structurer et démultiplier",
    resume:
      "Gestion du temps, création et pilotage de projets, activation du réseau.",
    competences: [
      {
        icone: "temps",
        titre: "Gestion et optimisation du temps",
        texte:
          "Priorisation, planification, deep work, élimination des tâches à faible valeur, délégation et automatisation.",
      },
      {
        icone: "projets",
        titre: "Création et gestion de projets / business",
        texte:
          "Du concept au lancement : validation d'idée, structuration, exécution, suivi des indicateurs et scalabilité.",
      },
      {
        icone: "reseau",
        titre: "Réseau et relations",
        texte:
          "Activation stratégique de son entourage : construction de relations de valeur, partenariats, opportunités et recommandations.",
      },
    ],
  },
];

export const NB_COMPETENCES = PILIERS.reduce(
  (n, p) => n + p.competences.length,
  0
);
