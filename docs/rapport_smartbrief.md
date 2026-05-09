# RAPPORT DE PROJET DE FIN D'ÉTUDES

**Projet intitulé : SmartBrief — Application web de gestion de briefs clients**

**Préparé par :** Sanaoui Omar

**Encadré par :** [Nom de l'encadrant]

**Établissement :** [Nom de l'établissement]

**Année universitaire :** 2024/2025

---

## REMERCIEMENTS

Je tiens tout d'abord à exprimer ma sincère gratitude envers mon encadrant, **[Nom de l'encadrant]**, pour ses conseils avisés, sa disponibilité et son soutien tout au long de la réalisation de ce projet. Ses remarques pertinentes et son accompagnement ont été déterminants dans l'avancement de ce travail.

Je remercie également l'ensemble du corps professoral de **[Nom de l'établissement]** pour la qualité de la formation dispensée et pour nous avoir préparés aux défis du monde professionnel.

Mes remerciements s'adressent aussi à l'équipe d'**Agence47** pour leur confiance, leur collaboration et les ressources mises à disposition tout au long du développement de cette application.

Enfin, je remercie ma famille et mes proches pour leur soutien indéfectible et leur encouragement durant cette période de travail intensif.

---

## RÉSUMÉ

Ce rapport présente le travail réalisé dans le cadre du projet de fin d'études : le développement de **SmartBrief**, une application web de gestion de briefs clients destinée à l'agence de communication digitale **Agence47**.

Le contexte de ce projet part d'un constat simple : la collecte d'informations clients pour initier un projet digital repose encore trop souvent sur des échanges informels (emails, appels, messages) qui manquent de structure et engendrent des pertes de temps. SmartBrief vient digitaliser et standardiser ce processus en proposant un portail centralisé permettant aux clients de soumettre leurs briefs, aux administrateurs de les gérer et aux membres d'équipe de les traiter efficacement.

L'application repose sur une architecture moderne : un frontend **React / TypeScript** avec **Redux Toolkit** pour la gestion d'état et **Tailwind CSS** pour le style, et un backend en **Node.js / Express** organisé en microservices, avec **PostgreSQL** comme base de données et **Prisma** comme ORM. L'authentification est sécurisée par **JWT** et **Google OAuth**, et le système inclut des notifications par email, l'export PDF, la gestion de tâches et une interface bilingue français/anglais.

---

## TABLE DES MATIÈRES

1. Introduction générale
2. Chapitre 1 : Présentation du projet
3. Chapitre 2 : Conception
4. Chapitre 3 : Outils et technologies utilisés
5. Chapitre 4 : Réalisation
6. Conclusion générale
7. Bibliographie

---

## INTRODUCTION GÉNÉRALE

Dans un contexte de transformation numérique accélérée, les agences de communication font face à un défi croissant : structurer et professionnaliser la collecte des besoins clients dès les premières étapes d'un projet. Sans outil dédié, cette phase critique repose sur des échanges dispersés et non standardisés, entraînant des malentendus, des délais et une perte d'efficacité.

C'est dans ce contexte qu'est né le projet **SmartBrief**, développé pour **Agence47**, une agence digitale marocaine spécialisée dans la création de sites web, le référencement, la publicité en ligne et la gestion des réseaux sociaux. L'objectif est de proposer un portail de découverte client simplifié : le client définit son périmètre, choisit ses services et soumet un brief structuré en quelques minutes.

Ce rapport est organisé en quatre chapitres :

- **Chapitre 1 – Présentation du projet** : contexte, problématique et objectifs.
- **Chapitre 2 – Conception** : modélisation UML (cas d'utilisation, classes, séquences).
- **Chapitre 3 – Outils et technologies** : présentation de la stack technique utilisée.
- **Chapitre 4 – Réalisation** : interfaces développées et fonctionnalités implémentées.

---

## CHAPITRE 1 : PRÉSENTATION DU PROJET

### Introduction

Ce chapitre présente le cadre général du projet SmartBrief, la problématique à laquelle il répond, ses objectifs principaux ainsi que ses limites.

### 1. Présentation de l'entreprise — Agence47

**Agence47** est une agence de communication digitale basée au Maroc. Elle accompagne ses clients dans leur transformation numérique à travers une gamme complète de services :

- Conception et développement de sites web
- Référencement naturel (SEO)
- Publicité en ligne (Google Ads, réseaux sociaux)
- Gestion de communautés (Community Management)
- Identité visuelle et branding
- Photographie et vidéographie
- Email marketing

L'agence travaille avec des clients de secteurs variés et gère plusieurs projets en parallèle, ce qui rend indispensable une organisation rigoureuse du flux de travail entre les clients, les chefs de projet et les équipes techniques.

### 2. Problématique

Avant SmartBrief, le processus de collecte des besoins clients chez Agence47 reposait essentiellement sur des échanges par email ou téléphone. Cette approche présentait plusieurs inconvénients :

- **Manque de standardisation** : chaque client transmettait ses informations sous des formats différents, rendant difficile l'analyse et la comparaison des projets.
- **Perte d'informations** : les détails importants se perdaient dans des fils de messages non structurés.
- **Absence de traçabilité** : il n'existait pas de tableau de bord centralisé pour suivre l'état des projets entrants.
- **Délais inutiles** : les allers-retours pour obtenir les informations manquantes rallongeaient les cycles de démarrage de projet.

### 3. Objectifs du projet

SmartBrief a été développé pour répondre à ces problèmes en offrant :

**Pour les clients :**
- Un formulaire de brief guidé et structuré (nom du projet, type de service, fonctionnalités souhaitées, budget, date de lancement, pièces jointes)
- Un espace personnel pour suivre l'état de leurs briefs
- La possibilité de modifier un brief en attente

**Pour les administrateurs (Agence47) :**
- Un tableau de bord global de tous les briefs reçus
- La possibilité d'accepter ou refuser un brief avec justification
- L'assignation des briefs aux membres de l'équipe
- La création de briefs au nom des clients
- La gestion des comptes clients
- L'export des briefs en PDF

**Pour les employés :**
- Un accès direct aux briefs qui leur sont assignés
- La possibilité de démarrer et finaliser la production
- La gestion des tâches associées à chaque brief

### 4. Limites et exclusions

Dans le cadre de ce projet de fin d'études, certaines fonctionnalités ont été volontairement exclues du périmètre :

- L'intégration d'un système de paiement en ligne
- La gestion de facturation et de devis
- Un système de messagerie temps réel entre client et agence
- L'application mobile (seul le web responsive a été développé)

---

## CHAPITRE 2 : CONCEPTION

### Introduction

Ce chapitre présente la modélisation UML du système SmartBrief. La conception a été réalisée avec le langage UML afin de représenter les interactions entre les acteurs et le système, les structures de données et les flux d'exécution.

### 1. Diagramme de cas d'utilisation

Le système SmartBrief implique trois acteurs principaux :

- **Client** : utilisateur final qui soumet et suit ses briefs.
- **Administrateur** : membre d'Agence47 qui gère les briefs et les équipes.
- **Employé** : membre de l'équipe assigné à des briefs spécifiques.

**Cas d'utilisation principaux :**

| Acteur | Cas d'utilisation |
|--------|-------------------|
| Client | S'inscrire, Se connecter, Soumettre un brief, Consulter ses briefs, Modifier un brief, Gérer son profil |
| Administrateur | Se connecter, Consulter tous les briefs, Accepter/Refuser un brief, Assigner un brief, Créer un client, Créer un brief pour un client, Exporter en PDF, Gérer les tâches |
| Employé | Se connecter, Consulter les briefs assignés, Démarrer la production, Marquer comme terminé, Gérer les tâches |

*(Voir fichier : `docs/diagrams/use_case.puml`)*

### 2. Diagramme de classes

Le modèle de données de SmartBrief s'articule autour des entités principales suivantes :

**User** : représente tout utilisateur du système (Client, Employé, Administrateur).
- Attributs : id, firstName, lastName, email, password, phone, role, provider

**Brief** : document de projet soumis par un client.
- Attributs : id, clientId, title, projectType, description, features[], budgetRange, deadline, status, assignedToIds[], attachments[]

**Task** : tâche associée à un brief.
- Attributs : id, briefId, name, description, priority, startDate, endDate, status

**Relations :**
- Un User (CLIENT) peut soumettre plusieurs Briefs
- Un Brief peut être assigné à plusieurs Users (EMPLOYEE)
- Un Brief contient plusieurs Tasks

*(Voir fichier : `docs/diagrams/class_diagram.puml`)*

### 3. Diagrammes de séquence

**Séquence 1 — Soumission d'un brief par un client :**

1. Le client accède au formulaire de création de brief
2. Il remplit les informations (nom, service, fonctionnalités, budget, date)
3. Il joint des fichiers si nécessaire et soumet le formulaire
4. Le système enregistre le brief avec le statut PENDING
5. Un email de confirmation est envoyé au client
6. L'administrateur voit le nouveau brief dans son tableau de bord

**Séquence 2 — Acceptation et assignation d'un brief :**

1. L'administrateur consulte un brief en statut PENDING
2. Il examine les détails et décide de l'accepter
3. Le statut passe à ACCEPTED
4. L'administrateur sélectionne les membres de l'équipe à assigner
5. Le brief passe en IN_PROGRESS
6. Les employés assignés voient le brief dans leur tableau de bord

**Séquence 3 — Connexion d'un utilisateur :**

1. L'utilisateur saisit son email et mot de passe
2. Le système vérifie les credentials dans la base de données
3. Si valides, un token JWT est généré et retourné
4. Le token est stocké côté client (localStorage)
5. L'utilisateur est redirigé vers son tableau de bord selon son rôle

*(Voir fichiers : `docs/diagrams/seq_submit_brief.puml`, `docs/diagrams/seq_accept_assign.puml`, `docs/diagrams/seq_login.puml`)*

### Conclusion

La phase de conception a permis de définir clairement les interactions entre les acteurs et le système, ainsi que la structure des données. Ces modèles ont servi de base solide pour la phase de réalisation.

---

## CHAPITRE 3 : OUTILS ET TECHNOLOGIES UTILISÉS

### Introduction

Ce chapitre présente l'ensemble des technologies et outils utilisés lors du développement de SmartBrief, organisés par couche applicative.

### 1. Outils de modélisation

**UML (Unified Modeling Language)** est le langage de modélisation standardisé utilisé pour représenter les diagrammes de cas d'utilisation, de classes et de séquence de SmartBrief. UML fournit un ensemble de notations graphiques permettant de documenter l'architecture et le comportement du système de manière claire et universellement compréhensible.

**PlantUML** est l'outil open-source utilisé pour générer les diagrammes UML à partir de code texte. Il permet de versionner les diagrammes aux côtés du code source et d'assurer leur cohérence avec l'évolution du projet.

### 2. Front-End

**React 19** est une bibliothèque JavaScript open-source développée par Meta pour construire des interfaces utilisateur basées sur des composants réutilisables. React permet de construire des Single Page Applications (SPA) réactives et performantes grâce à son système de Virtual DOM.

**TypeScript** est un sur-ensemble typé de JavaScript développé par Microsoft. Il apporte un typage statique au code JavaScript, réduisant les erreurs à l'exécution et améliorant la maintenabilité du code, notamment dans des projets de grande envergure.

**Vite** est un outil de build ultra-rapide pour les projets frontend modernes. Il offre un démarrage quasi-instantané du serveur de développement et des builds de production optimisés grâce au module bundling basé sur ESModules.

**Redux Toolkit** est la bibliothèque officielle recommandée pour la gestion d'état global dans les applications React. Elle simplifie la configuration de Redux et réduit le boilerplate nécessaire pour gérer l'état de l'application (authentification, briefs, tâches).

**Tailwind CSS** est un framework CSS utilitaire qui permet de styliser directement les composants via des classes utilitaires. Il favorise un développement rapide, une cohérence visuelle et l'élimination du CSS inutilisé en production.

**Chakra UI** est une bibliothèque de composants React accessible et composable, utilisée dans SmartBrief pour des éléments spécifiques comme le DatePicker.

**i18next / react-i18next** est la bibliothèque d'internationalisation utilisée pour implémenter le support bilingue français/anglais de l'application. La langue sélectionnée est persistée dans le localStorage.

### 


**Node.js** est un environnement d'exécution JavaScript côté serveur basé sur le moteur V8 de Chrome. Il permet de construire des serveurs web performants et scalables grâce à son modèle d'I/O non-bloquant et orienté événements.

**Express.js** est un framework web minimaliste pour Node.js. Il a été utilisé pour construire les APIs RESTful des deux microservices de SmartBrief (auth-service et brief-service), gérant les routes, les middlewares et la logique métier.

**Architecture microservices** : SmartBrief adopte une architecture orientée microservices avec deux services indépendants :
- **auth-service** : gestion des utilisateurs, authentification JWT, Google OAuth, profils
- **brief-service** : gestion des briefs, tâches, assignations, exports PDF

**Prisma** est un ORM (Object-Relational Mapping) moderne pour Node.js et TypeScript. Il simplifie les interactions avec la base de données grâce à une API type-safe auto-générée à partir du schéma de données, et facilite les migrations.

**JSON Web Token (JWT)** est un standard ouvert pour la transmission sécurisée d'informations entre parties sous forme de token signé. Dans SmartBrief, les JWTs sont utilisés pour sécuriser les routes API et maintenir les sessions utilisateurs.

**Google OAuth 2.0** permet aux utilisateurs de s'authentifier via leur compte Google, offrant une expérience de connexion simplifiée sans nécessiter de nouveau mot de passe.

**Nodemailer** est un module Node.js pour l'envoi d'emails. Il est utilisé pour envoyer les emails de vérification de compte, de réinitialisation de mot de passe et de notifications.

**Puppeteer** est une bibliothèque Node.js qui contrôle un navigateur Chrome headless. Elle est utilisée dans SmartBrief pour générer les exports PDF des briefs.

### 4. Base de données

**PostgreSQL** est un système de gestion de bases de données relationnelles open-source reconnu pour sa robustesse, ses performances et sa conformité aux standards SQL. SmartBrief utilise PostgreSQL pour stocker l'ensemble des données : utilisateurs, briefs, tâches et attachements.

### 5. Outils de développement et déploiement

**Visual Studio Code** est l'éditeur de code utilisé pour le développement. Son écosystème d'extensions (ESLint, Prettier, Prisma, TypeScript) en fait un environnement de développement complet et personnalisable.

**Docker** est une plateforme de conteneurisation utilisée pour le déploiement des microservices back-end. Il garantit la cohérence entre les environnements de développement et de production.

**GitHub** est la plateforme de versioning et de collaboration utilisée pour gérer le code source de SmartBrief. Le contrôle de version Git permet de suivre l'historique des modifications et de collaborer efficacement.

**Vercel** est la plateforme de déploiement utilisée pour le frontend React. Elle offre un déploiement continu depuis GitHub et un CDN mondial pour des performances optimales.

### Conclusion

L'ensemble des technologies choisies forme un stack cohérent et moderne, adapté aux exigences d'une application web professionnelle. Le choix de TypeScript end-to-end (frontend + backend) garantit une cohérence des types et réduit considérablement les erreurs d'intégration.

---

## CHAPITRE 4 : RÉALISATION

### Introduction

Ce chapitre présente les interfaces développées dans le cadre de SmartBrief ainsi que les principales fonctionnalités implémentées, organisées par type d'utilisateur.

### 1. Authentification

L'application propose deux méthodes d'authentification :

- **Inscription par email** avec vérification par code à 6 chiffres
- **Connexion Google (OAuth 2.0)** pour une expérience simplifiée

Les pages d'authentification (connexion, inscription, vérification email, mot de passe oublié, réinitialisation) sont entièrement traduites en français et en anglais.

### 2. Interface Client

**Page d'accueil (Home)**
Après connexion, le client accède à un tableau de bord personnalisé affichant :
- Un message de bienvenue avec son prénom
- Des statistiques sur ses briefs (total, en attente, en cours, terminés)
- Une liste des 3 briefs les plus récents avec leur statut

**Création d'un brief (NewProject)**
Le formulaire de soumission se déroule en deux étapes :
- Étape 1 : Identité du projet (nom, marque, objectif principal, type de service, fonctionnalités)
- Étape 2 : Informations complémentaires (budget, date de lancement, pièces jointes)

**Registre de briefs (MyBriefs)**
Liste complète des briefs soumis avec leur statut, permettant d'accéder aux détails de chaque brief via une modale.

### 3. Interface Administrateur

**Tableau de bord global**
Vue d'ensemble de tous les briefs de l'agence. Statistiques : nombre total de briefs, en attente, en cours, terminés.

**Gestion d'un brief (BriefModal)**
L'administrateur peut depuis la modale de brief :
- Accepter ou refuser le brief
- Assigner un ou plusieurs employés
- Exporter le brief en PDF
- Supprimer définitivement le brief

**Création de clients (AddClientModal)**
L'administrateur peut créer des comptes clients directement depuis l'interface, avec génération automatique des identifiants si l'email n'est pas renseigné.

**Création de briefs pour clients (AdminNewProject)**
Formulaire permettant à l'administrateur de soumettre un brief au nom d'un client existant.

### 4. Interface Employé

**Briefs assignés**
L'employé accède uniquement aux briefs qui lui sont assignés, avec la possibilité de :
- Démarrer la production (statut → IN_PROGRESS)
- Marquer le brief comme terminé (statut → COMPLETED)

**Gestion des tâches (TaskSection)**
Pour chaque brief, une section de gestion des tâches permet de créer, modifier et supprimer des tâches avec priorité (LOW / MEDIUM / HIGH), dates de début et fin.

### 5. Fonctionnalités transversales

**Profil utilisateur**
Chaque utilisateur peut modifier ses informations personnelles, changer son mot de passe, et supprimer son compte depuis la modale de profil.

**Internationalisation (FR/EN)**
Un bouton de bascule dans la navbar permet de passer de l'anglais au français instantanément. La préférence est sauvegardée dans le localStorage.

**Export PDF**
Les administrateurs peuvent exporter n'importe quel brief en document PDF structuré, généré côté serveur via Puppeteer.

**Notifications email**
Des emails automatiques sont envoyés pour : vérification de compte, réinitialisation de mot de passe, changement d'email.

### Conclusion

L'ensemble des fonctionnalités prévues dans le cahier des charges a été implémenté avec succès. L'application est déployée et accessible en production, offrant une expérience fluide sur desktop et mobile.

---

## CONCLUSION GÉNÉRALE

Ce projet de stage a été l'occasion de concevoir et développer une application web complète, de bout en bout, depuis la modélisation UML jusqu'au déploiement en production.

**SmartBrief** répond concrètement à une problématique réelle d'Agence47 : digitaliser et structurer le processus de collecte des briefs clients. L'application offre aujourd'hui une solution robuste, moderne et bilingue qui centralise les échanges entre clients, administrateurs et équipes.

Sur le plan technique, ce projet m'a permis de maîtriser un ensemble de technologies actuelles et très demandées dans l'industrie : React avec TypeScript, Redux Toolkit, Node.js avec Express, PostgreSQL avec Prisma, Docker et Vercel. L'adoption d'une architecture microservices, bien que plus complexe à mettre en place, a apporté une réelle modularité et scalabilité au système.

Sur le plan méthodologique, l'utilisation d'UML pour la conception, de Git pour le versioning et d'une approche agile pour le développement ont été des pratiques professionnelles précieuses à acquérir.

Des perspectives d'évolution existent pour enrichir l'application : messagerie temps réel client/agence, système de devis et facturation intégré, application mobile, et tableau de bord analytique avancé.

---

## BIBLIOGRAPHIE

- Documentation officielle React : https://react.dev
- Documentation Redux Toolkit : https://redux-toolkit.js.org
- Documentation Prisma : https://www.prisma.io/docs
- Documentation PostgreSQL : https://www.postgresql.org/docs
- Documentation Express.js : https://expressjs.com
- Documentation Tailwind CSS : https://tailwindcss.com/docs
- Documentation i18next : https://www.i18next.com
- Documentation Docker : https://docs.docker.com
- Documentation Vercel : https://vercel.com/docs
- JSON Web Tokens : https://jwt.io
- TypeScript Handbook : https://www.typescriptlang.org/docs
- Visual Studio Code : https://code.visualstudio.com
- GitHub : https://github.com
