import "dotenv/config";
import prisma from "./db/prisma.js";

const U = {
  admin:   "11de0cff-26f3-4e55-a3e2-bb06f3729c10", // omar.sanaoui@agence47.ma
  alice:   "cd04a8b6-da60-4104-9afc-c43c3c724015", // alice.martin@demo.com
  youssef: "ef41a2c9-832a-4a35-92ff-4371ed10cbf0", // youssef.benali@demo.com
  sofia:   "18611dc6-df81-43c5-81b4-bcbf9889a135", // sofia.dupont@demo.com
  karim:   "2babb92b-87a0-49d4-94ab-759ccb0c0e4e", // karim.idrissi@demo.com
  laura:   "bcfca15e-99c9-439e-9dc0-b871e238c6c3", // laura.fontaine@demo.com
  hamza:   "e5c636fe-f53b-433b-a216-4225d61608df", // hamza.elamrani@demo.com
  camille: "bea64361-0a6b-4827-8049-fd77b5a0b972", // camille.bernard@demo.com
  mehdi:   "66d8633f-b688-4f67-b217-c746c57219bb", // mehdi.zaki@agence47.ma
  nadia:   "db86599e-0573-448c-836a-937b46d56ed5", // nadia.chraibi@agence47.ma
  amine:   "c4c7a3fe-bf6d-475d-94da-755ffca4600a", // amine.tazi@agence47.ma
  zineb:   "7f9826dc-fe64-44bd-bbe0-ace542776f78", // zineb.fassi@agence47.ma
};

const ago  = (d: number) => new Date(Date.now() - d * 86400000);
const from = (d: number) => new Date(Date.now() + d * 86400000);

async function main() {
  console.log("🌱 Seeding briefs & tasks...\n");

  // ── 1. COMPLETED — Site web vitrine Pharmacie ────────────────────────────
  const b1 = await prisma.brief.upsert({
    where: { id: "seed-b-001" },
    update: {},
    create: {
      id: "seed-b-001",
      clientId: U.alice,
      assignedToIds: [U.mehdi, U.nadia],
      assignedById: U.admin,
      assignedAt: ago(25),
      title: "Site web vitrine — Pharmacie El Amal",
      projectType: "SITE_WEB",
      description: "Création d'un site web vitrine moderne pour la Pharmacie El Amal. Le site doit présenter les services, les horaires d'ouverture, une carte interactive et un formulaire de contact. Design sobre et rassurant, adapté à une clientèle de proximité.",
      features: ["Page d'accueil avec bannière et services", "Page horaires & localisation (Google Maps)", "Formulaire de contact", "Design responsive mobile", "SEO local optimisé"],
      budgetRange: "8 000 – 12 000 MAD",
      deadline: ago(5),
      status: "COMPLETED",
      attachments: [],
      createdAt: ago(40),
    },
  });
  await prisma.task.createMany({ skipDuplicates: true, data: [
    { id: "seed-t-001-1", briefId: b1.id, name: "Maquette Figma", description: "Créer les maquettes desktop et mobile", priority: "HIGH", startDate: ago(38), endDate: ago(32), status: "COMPLETED" },
    { id: "seed-t-001-2", briefId: b1.id, name: "Intégration HTML/CSS", description: "Intégrer les maquettes avec Tailwind CSS", priority: "HIGH", startDate: ago(31), endDate: ago(20), status: "COMPLETED" },
    { id: "seed-t-001-3", briefId: b1.id, name: "Intégration Google Maps", description: "Ajouter la carte interactive", priority: "MEDIUM", startDate: ago(19), endDate: ago(15), status: "COMPLETED" },
    { id: "seed-t-001-4", briefId: b1.id, name: "SEO & mise en ligne", description: "Optimisation SEO local et déploiement", priority: "MEDIUM", startDate: ago(14), endDate: ago(6), status: "COMPLETED" },
  ]});
  console.log("✅ Brief 1 — COMPLETED (Alice / Site web Pharmacie)");

  // ── 2. IN_PROGRESS — Google Ads Boutique Mode ────────────────────────────
  const b2 = await prisma.brief.upsert({
    where: { id: "seed-b-002" },
    update: {},
    create: {
      id: "seed-b-002",
      clientId: U.youssef,
      assignedToIds: [U.amine],
      assignedById: U.admin,
      assignedAt: ago(10),
      title: "Campagne Google Ads — Boutique Moda Casa",
      projectType: "GOOGLE_ADS",
      description: "Mise en place d'une campagne Google Ads Search & Shopping pour la boutique de mode Moda Casa. Objectif : augmenter le trafic qualifié et atteindre un ROAS minimum de 4x sur le budget publicitaire alloué.",
      features: ["Audit des campagnes existantes", "Recherche de mots-clés et segmentation", "Création des annonces Search (5 groupes)", "Campagnes Shopping", "Suivi des conversions via GTM", "Rapport mensuel de performance"],
      budgetRange: "5 000 MAD/mois",
      deadline: from(20),
      status: "IN_PROGRESS",
      attachments: [],
      createdAt: ago(18),
    },
  });
  await prisma.task.createMany({ skipDuplicates: true, data: [
    { id: "seed-t-002-1", briefId: b2.id, name: "Audit & analyse concurrents", description: "Analyser les campagnes actuelles et la concurrence", priority: "HIGH", startDate: ago(9), endDate: ago(6), status: "COMPLETED" },
    { id: "seed-t-002-2", briefId: b2.id, name: "Recherche de mots-clés", description: "Identifier les mots-clés avec Google Keyword Planner", priority: "HIGH", startDate: ago(5), endDate: ago(2), status: "COMPLETED" },
    { id: "seed-t-002-3", briefId: b2.id, name: "Création des annonces Search", description: "Rédiger et configurer les 5 groupes d'annonces", priority: "HIGH", startDate: ago(1), endDate: from(4), status: "IN_PROGRESS" },
    { id: "seed-t-002-4", briefId: b2.id, name: "Campagnes Shopping", description: "Configurer le flux produit et les campagnes Shopping", priority: "MEDIUM", startDate: from(5), endDate: from(10), status: "PENDING" },
    { id: "seed-t-002-5", briefId: b2.id, name: "Suivi conversions & rapport", description: "Installer le suivi des conversions et préparer le rapport", priority: "MEDIUM", startDate: from(11), endDate: from(18), status: "PENDING" },
  ]});
  console.log("✅ Brief 2 — IN_PROGRESS (Youssef / Google Ads)");

  // ── 3. ACCEPTED — Refonte identité visuelle ──────────────────────────────
  await prisma.brief.upsert({
    where: { id: "seed-b-003" },
    update: {},
    create: {
      id: "seed-b-003",
      clientId: U.sofia,
      assignedToIds: [U.nadia, U.zineb],
      assignedById: U.admin,
      assignedAt: ago(3),
      title: "Refonte identité visuelle — Cabinet Dupont & Associés",
      projectType: "BRANDING",
      description: "Refonte complète de l'identité visuelle du cabinet d'avocats Dupont & Associés. L'image actuelle est vieillissante. Nous souhaitons un logo moderne et institutionnel, une charte graphique complète et des templates de documents.",
      features: ["Nouveau logo (3 propositions créatives)", "Charte graphique complète", "Papeterie (carte de visite, en-tête, enveloppe)", "Templates Word & PowerPoint", "Guide d'utilisation de la charte"],
      budgetRange: "15 000 – 20 000 MAD",
      deadline: from(35),
      status: "ACCEPTED",
      attachments: [],
      createdAt: ago(6),
    },
  });
  console.log("✅ Brief 3 — ACCEPTED (Sofia / Branding Cabinet)");

  // ── 4. PENDING — Réseaux sociaux Restaurant ──────────────────────────────
  await prisma.brief.upsert({
    where: { id: "seed-b-004" },
    update: {},
    create: {
      id: "seed-b-004",
      clientId: U.karim,
      assignedToIds: [],
      title: "Gestion réseaux sociaux — Restaurant Dar Karim",
      projectType: "SOCIAL_MEDIA",
      description: "Gestion complète des réseaux sociaux (Instagram, Facebook, TikTok) pour le restaurant Dar Karim, spécialisé dans la cuisine marocaine traditionnelle. Objectif : augmenter la notoriété locale et générer des réservations.",
      features: ["Audit des comptes existants", "Stratégie éditoriale mensuelle", "12 publications/mois (photos + vidéos)", "Stories quotidiennes", "Gestion des commentaires & messages", "Rapport mensuel"],
      budgetRange: "3 500 MAD/mois",
      deadline: from(10),
      status: "PENDING",
      attachments: [],
      createdAt: ago(2),
    },
  });
  console.log("✅ Brief 4 — PENDING (Karim / Social Media)");

  // ── 5. PENDING — SEO e-commerce ──────────────────────────────────────────
  await prisma.brief.upsert({
    where: { id: "seed-b-005" },
    update: {},
    create: {
      id: "seed-b-005",
      clientId: U.laura,
      assignedToIds: [],
      title: "Référencement naturel — Boutique Bio Fontaine",
      projectType: "SEO",
      description: "Amélioration du référencement naturel de la boutique en ligne Fontaine Bio (cosmétiques naturels). Le site est actuellement invisible sur Google. Objectif : première page sur 20 mots-clés cibles en 6 mois.",
      features: ["Audit SEO technique complet", "Optimisation des mots-clés", "Optimisation On-Page", "4 articles de blog/mois", "Netlinking (8 backlinks/mois)", "Rapport mensuel de positionnement"],
      budgetRange: "4 000 MAD/mois",
      deadline: from(7),
      status: "PENDING",
      attachments: [],
      createdAt: ago(1),
    },
  });
  console.log("✅ Brief 5 — PENDING (Laura / SEO)");

  // ── 6. IN_PROGRESS — Production vidéo corporate ──────────────────────────
  const b6 = await prisma.brief.upsert({
    where: { id: "seed-b-006" },
    update: {},
    create: {
      id: "seed-b-006",
      clientId: U.hamza,
      assignedToIds: [U.mehdi, U.zineb],
      assignedById: U.admin,
      assignedAt: ago(8),
      title: "Film institutionnel — Groupe El Amrani Immobilier",
      projectType: "PHOTO_VIDEO",
      description: "Production d'un film institutionnel de 3 minutes pour le Groupe El Amrani Immobilier. Le film sera diffusé sur le site web, YouTube et lors d'événements. Il doit valoriser les projets réalisés et la vision du groupe.",
      features: ["Écriture du script et storyboard", "Tournage sur 2 jours (bureaux + chantiers)", "Interview PDG et 3 collaborateurs", "Motion design intro & titres", "Montage + étalonnage colorimétrique", "Livraison 4K et format web"],
      budgetRange: "25 000 – 35 000 MAD",
      deadline: from(15),
      status: "IN_PROGRESS",
      attachments: [],
      createdAt: ago(20),
    },
  });
  await prisma.task.createMany({ skipDuplicates: true, data: [
    { id: "seed-t-006-1", briefId: b6.id, name: "Script & storyboard", description: "Rédiger le script narratif et storyboard illustré", priority: "HIGH", startDate: ago(7), endDate: ago(4), status: "COMPLETED" },
    { id: "seed-t-006-2", briefId: b6.id, name: "Tournage J1 — Bureaux", description: "Tournage des interviews et plans bureaux", priority: "HIGH", startDate: ago(2), endDate: ago(2), status: "COMPLETED" },
    { id: "seed-t-006-3", briefId: b6.id, name: "Tournage J2 — Chantiers", description: "Tournage des plans extérieurs sur les chantiers actifs", priority: "HIGH", startDate: from(1), endDate: from(1), status: "IN_PROGRESS" },
    { id: "seed-t-006-4", briefId: b6.id, name: "Montage & motion design", description: "Montage vidéo, étalonnage et motion design", priority: "HIGH", startDate: from(3), endDate: from(12), status: "PENDING" },
    { id: "seed-t-006-5", briefId: b6.id, name: "Validation & livraison", description: "Présentation client, retours et export final", priority: "MEDIUM", startDate: from(13), endDate: from(15), status: "PENDING" },
  ]});
  console.log("✅ Brief 6 — IN_PROGRESS (Hamza / Vidéo corporate)");

  // ── 7. REFUSED — Email marketing ────────────────────────────────────────
  await prisma.brief.upsert({
    where: { id: "seed-b-007" },
    update: {},
    create: {
      id: "seed-b-007",
      clientId: U.camille,
      assignedToIds: [],
      title: "Campagne email marketing — Bernard Formation",
      projectType: "EMAIL_MARKETING",
      description: "Mise en place d'une campagne d'emailing mensuelle pour Bernard Formation (organisme de formation professionnelle). Promouvoir les nouvelles formations auprès d'une base de 5 000 contacts.",
      features: ["Audit de la base de contacts", "Template email responsive (HTML)", "Séquence de 3 emails d'onboarding", "Newsletter mensuelle", "Suivi des KPIs (ouverture, clics, conversions)"],
      budgetRange: "2 000 MAD/mois",
      deadline: from(14),
      status: "REFUSED",
      statusReason: "Le budget proposé ne correspond pas au volume de travail requis. Nous vous invitons à revoir votre budget à la hausse ou à réduire le périmètre de la mission.",
      attachments: [],
      createdAt: ago(12),
    },
  });
  console.log("✅ Brief 7 — REFUSED (Camille / Email Marketing)");

  // ── 8. COMPLETED — Community Management Clinique ────────────────────────
  const b8 = await prisma.brief.upsert({
    where: { id: "seed-b-008" },
    update: {},
    create: {
      id: "seed-b-008",
      clientId: U.alice,
      assignedToIds: [U.nadia],
      assignedById: U.admin,
      assignedAt: ago(50),
      title: "Community Management — Clinique Dentaire Sourire",
      projectType: "COMMUNITY_MANAGER",
      description: "Gestion des réseaux sociaux de la Clinique Dentaire Sourire pendant 3 mois. Publications éducatives sur la santé bucco-dentaire, promotion des offres saisonnières et gestion des avis clients.",
      features: ["Gestion Instagram et Facebook", "8 publications/mois par réseau", "Création de visuels (Canva Pro)", "Réponse aux commentaires sous 24h", "Rapport mensuel"],
      budgetRange: "2 800 MAD/mois",
      deadline: ago(10),
      status: "COMPLETED",
      attachments: [],
      createdAt: ago(100),
    },
  });
  await prisma.task.createMany({ skipDuplicates: true, data: [
    { id: "seed-t-008-1", briefId: b8.id, name: "Stratégie éditoriale", description: "Définir le calendrier éditorial et ligne de contenu", priority: "HIGH", startDate: ago(98), endDate: ago(90), status: "COMPLETED" },
    { id: "seed-t-008-2", briefId: b8.id, name: "Mois 1 — Publications", description: "8 posts Instagram + 8 posts Facebook mois 1", priority: "MEDIUM", startDate: ago(89), endDate: ago(60), status: "COMPLETED" },
    { id: "seed-t-008-3", briefId: b8.id, name: "Mois 2 — Publications", description: "8 posts Instagram + 8 posts Facebook mois 2", priority: "MEDIUM", startDate: ago(59), endDate: ago(30), status: "COMPLETED" },
    { id: "seed-t-008-4", briefId: b8.id, name: "Mois 3 — Publications & rapport final", description: "Dernier mois + rapport de performance global", priority: "MEDIUM", startDate: ago(29), endDate: ago(10), status: "COMPLETED" },
  ]});
  console.log("✅ Brief 8 — COMPLETED (Alice / Community Management)");

  // ── 9. IN_PROGRESS — SEO Cabinet médical ────────────────────────────────
  const b9 = await prisma.brief.upsert({
    where: { id: "seed-b-009" },
    update: {},
    create: {
      id: "seed-b-009",
      clientId: U.sofia,
      assignedToIds: [U.amine],
      assignedById: U.admin,
      assignedAt: ago(15),
      title: "Stratégie SEO — Cabinet Médical Benali",
      projectType: "SEO",
      description: "Référencement complet du site du Cabinet Médical Benali pour améliorer sa visibilité locale sur Casablanca. Objectif principal : apparaître en première position sur Google Maps et les résultats organiques pour les recherches locales.",
      features: ["Audit SEO complet", "Optimisation Google My Business", "Création de contenu médical (blog)", "Backlinks locaux et annuaires santé", "Rapport mensuel"],
      budgetRange: "3 000 MAD/mois",
      deadline: from(45),
      status: "IN_PROGRESS",
      attachments: [],
      createdAt: ago(22),
    },
  });
  await prisma.task.createMany({ skipDuplicates: true, data: [
    { id: "seed-t-009-1", briefId: b9.id, name: "Audit SEO technique", description: "Analyse complète de la structure et des erreurs techniques du site", priority: "HIGH", startDate: ago(14), endDate: ago(10), status: "COMPLETED" },
    { id: "seed-t-009-2", briefId: b9.id, name: "Optimisation Google My Business", description: "Compléter et optimiser la fiche GMB", priority: "HIGH", startDate: ago(9), endDate: ago(5), status: "COMPLETED" },
    { id: "seed-t-009-3", briefId: b9.id, name: "Optimisation On-Page", description: "Balises titre, méta-descriptions, structure H1/H2", priority: "MEDIUM", startDate: ago(4), endDate: from(3), status: "IN_PROGRESS" },
    { id: "seed-t-009-4", briefId: b9.id, name: "Création d'articles de blog", description: "4 articles sur des thèmes médicaux ciblant des mots-clés locaux", priority: "MEDIUM", startDate: from(4), endDate: from(18), status: "PENDING" },
    { id: "seed-t-009-5", briefId: b9.id, name: "Netlinking local", description: "Soumission aux annuaires santé et partenariats locaux", priority: "LOW", startDate: from(19), endDate: from(40), status: "PENDING" },
  ]});
  console.log("✅ Brief 9 — IN_PROGRESS (Sofia / SEO Cabinet Médical)");

  // ── 10. PENDING — Branding startup tech ────────────────────────────────
  await prisma.brief.upsert({
    where: { id: "seed-b-010" },
    update: {},
    create: {
      id: "seed-b-010",
      clientId: U.hamza,
      assignedToIds: [],
      title: "Identité de marque — Startup TechFlow",
      projectType: "BRANDING",
      description: "Création complète de l'identité de marque pour TechFlow, une startup SaaS B2B dans la gestion de flotte logistique. L'image doit être moderne, tech et inspire confiance auprès de décideurs d'entreprises.",
      features: ["Naming et positionnement", "Logo et déclinaisons", "Charte graphique complète", "Kit réseaux sociaux", "Présentation investisseurs (PowerPoint)"],
      budgetRange: "18 000 – 25 000 MAD",
      deadline: from(21),
      status: "PENDING",
      attachments: [],
      createdAt: ago(1),
    },
  });
  console.log("✅ Brief 10 — PENDING (Hamza / Branding TechFlow)");

  console.log("\n🎉 All done! 10 briefs seeded across all statuses.");
  console.log("  COMPLETED   → briefs 1, 8  (Alice)");
  console.log("  IN_PROGRESS → briefs 2, 6, 9");
  console.log("  ACCEPTED    → brief 3  (Sofia)");
  console.log("  PENDING     → briefs 4, 5, 10");
  console.log("  REFUSED     → brief 7  (Camille)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
