# PR10 + PR13 — Tunnel de réservation anniversaire (V1 sans Stripe)

> **À coller dans une session Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** de commencer : `CLAUDE.md` (entier), `docs/GOTCHAS.md`, `docs/PAGES_BACKLOG.md` (PR10 + PR13), `docs/API_CONTRACT.md` (conventions), `DESIGN_SYSTEM.md` (tokens, anti-patterns §15).
>
> **Pré-requis** : la PR de suivi tests back-office (`PROMPT_CLAUDE_CODE_TESTS_BACKOFFICE.md`) doit être livrée avant. Elle pose l'infra `env=test` (DB de test, JWT keys, fixture user `ROLE_STAFF`) qu'on réutilise pour les tests de ce tunnel.

## Contexte

Le tunnel anniversaire est **la priorité commerciale n°1** du site (CLAUDE.md §11). On livre PR10 (backend) + PR13 (frontend) en une session.

**Décision tranchée** : V1 sans Stripe. Le tunnel envoie une **demande de réservation** (statut `nouveau`), le gérant rappelle sous 24h pour valider, l'acompte se règle sur place ou par virement. Pas de carte bancaire, pas de 3DS, pas de Stripe Elements.

Source design : maquette HTML/Babel proto à lire intégralement avant de coder :
- `~/Desktop/FAMILY GAMES CENTER/fgc-website-prototype-html-claude-design/project/reserver-anniversaire.html` (coquille)
- `~/Desktop/FAMILY GAMES CENTER/fgc-website-prototype-html-claude-design/project/reservation/` :
  - `data.jsx` (FORMULES, TIME_SLOTS, DEPOSIT, helpers)
  - `ui.jsx` (composants partagés : Card, Field, Stepper, NavBar, StepHeader)
  - `steps-1.jsx` (StepFormule, StepDate, StepEnfant)
  - `steps-2.jsx` (StepCoordonnees, StepRecap — **ignore StepPaiement de ce fichier**)
  - `steps-3.jsx` (Step3DS, StepEchec, StepConfirmation — **ne garde que StepConfirmation, adapté**)
  - `tunnel.css` (styles dédiés — à porter en Tailwind ou conserver en CSS modules, voir §contraintes)
  - `app.jsx` (state machine — sert de référence, à réécrire propre en TS strict)

**Ne pas reprendre** : `tweaks-panel.jsx` (outil démo), React/Babel via CDN, écrans paiement/3DS/échec.

## Scope strict

### Côté Symfony (`apps/api/`) — PR10

1. **Entité `DemandeReservation`** (`apps/api/src/Entity/DemandeReservation.php`) modélise le cycle `nouveau → contacte → confirme | refuse | passe` (CLAUDE.md §11) :
   - `id` (UUID v7 ou auto-increment, cohérent avec l'existant — vérifier `User.php` pour la convention)
   - `reference` (string, unique, format `FGC-XXXXXX` — générée à la création, chars `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` cf. `data.jsx::genBookingRef`)
   - `status` (enum PHP 8.1 backed : `nouveau`, `contacte`, `confirme`, `refuse`, `passe`) — défaut `nouveau`
   - `formuleKey` (string, FK logique vers `AnnivCard.key` : `newbowler` | `superbowler` | `probowler`)
   - `eventDate` (date, contrainte `Assert\GreaterThanOrEqual('+7 days')`)
   - `timeSlot` (string, parmi les valeurs de `TIME_SLOTS` de la maquette : `10:00`, `14:00`, `14:30`, `16:00`, `16:30`, `17:00`)
   - `childName` (string, 1-80), `childAge` (int, 4-14), `kidsCount` (int, min selon formule, max 25)
   - `cakeNote` (string nullable, 0-300), `allergies` (string nullable, 0-300)
   - `parentFirstName`, `parentLastName`, `parentEmail` (Assert\Email), `parentPhone` (regex FR mobile)
   - `source` (string nullable : amis|instagram|facebook|google|passage|autre)
   - `message` (string nullable, 0-1000)
   - `acceptCGV` (bool, doit être `true` à la création — sinon 400)
   - `acceptNewsletter` (bool, défaut `false`)
   - `upsellVR` (bool, défaut `false`) — cf. CLAUDE.md §11 levier upsell
   - `createdAt`, `updatedAt` (DateTimeImmutable, Doctrine `HasLifecycleCallbacks`)
   - Index sur `(eventDate, timeSlot)` pour requêter la dispo vite.

2. **Endpoint `POST /api/reservations/anniversaire`** (public, rate limit 5/min/IP cf. API_CONTRACT.md) — **pattern DTO** (premier endpoint du repo à l'introduire, à valider comme pattern de référence pour toutes les futures écritures complexes) :
   - **DTO d'entrée** : `App\Dto\BirthdayReservationInput` (PHP class, pas une entité Doctrine) avec **tous les champs `Assert\*`** du payload client (cf. liste point 1 — sauf `reference`, `status`, `createdAt`, `updatedAt` qui sont calculés serveur).
   - **Validation cross-field via le DTO** : la règle `kidsCount >= formuleKey.minKids` se fait dans une méthode `#[Assert\Callback]` sur le DTO qui charge la `AnnivCard` via l'EntityManager et compare. Pas de `Assert\Callback` sur l'entité — l'entité ne reçoit que des données déjà valides.
   - **Mapper** : `App\State\BirthdayReservationProcessor` (implémente `ProcessorInterface` API Platform) reçoit le DTO validé, instancie `DemandeReservation`, génère la `reference`, persist, déclenche les mails, retourne l'entité.
   - **Operation API Platform** : `new Post(input: BirthdayReservationInput::class, output: DemandeReservation::class, processor: BirthdayReservationProcessor::class, normalizationContext: ['groups' => ['anniv:read']])`. Le DTO porte ses propres groupes `['anniv:write']` via `#[Groups]` sur ses propriétés.
   - **Conflit créneau** : si une `DemandeReservation` avec status ∈ {nouveau, contacte, confirme} existe déjà sur le même `(eventDate, timeSlot)`, renvoyer 409 Conflict (Problem Details). Vérifier dans le Processor avant persist (lever une `ConflictHttpException`).
   - Réponse 201 avec le payload sérialisé : `reference`, `eventDate`, `timeSlot`, `formuleKey`, `status`, `createdAt`.

3. **Mails transactionnels** (Symfony Mailer + Twig, cf. CLAUDE.md §3.2) :
   - **Mail gérant** (`templates/emails/anniv_demande_admin.html.twig`) → destinataire `MAILER_FROM_ADDRESS` (ou `RESERVATIONS_NOTIFY_TO` si tu ajoutes la var) avec récap complet + bouton "Marquer comme contactée" (lien interne admin futur — placeholder OK).
   - **Mail client** (`templates/emails/anniv_demande_client.html.twig`) → confirmation "Demande enregistrée — on vous recontacte sous 24h" avec récap visuel, référence FGC-XXXXXX, FAQ courte (politique d'annulation, contact). Cohérent avec l'ADN visuel (fond sombre, accents jaune/rose), variables Twig propres.
   - Job synchrone en V1 (pas de Messenger). Si l'envoi échoue, **la résa reste créée**, on log l'erreur — pas de rollback.

4. **Endpoint `GET /api/reservations/anniversaire/availability?date=YYYY-MM-DD`** (public, rate limit 30/min/IP) :
   - Renvoie `{ "date": "...", "slots": [{ "value": "10:00", "label": "10h00 – 12h00", "period": "Matin", "available": true|false }] }`.
   - `available: false` si déjà occupé (status ∈ {nouveau, contacte, confirme}) ou si `date < today + 7j`.

5. **Endpoint `GET /api/formules/anniversaires`** : **existe déjà** (`AnnivCard`). Vérifier que les 3 fixtures (`newbowler`, `superbowler`, `probowler`) sont à jour avec les prix et tagline de `data.jsx`. Si tu dois ajouter des colonnes (`minKids` int, `duration` string, `ageRange` réutilise le champ `age` existant), fais-le **dans la même PR via migration Doctrine**, pas en PR séparée.

6. **Tests `WebTestCase`** (`apps/api/tests/Controller/Api/AnnivReservationTest.php`) :
   - 201 nominal (payload valide complet, vérifie reference générée + status = `nouveau`).
   - 400 si `acceptCGV: false`.
   - 400 si `eventDate < today + 7j`.
   - 400 si `kidsCount < minKids` de la formule.
   - 409 si conflit créneau (créer une résa, en repasser une sur les mêmes (date, slot)).
   - 200 sur `availability` + slot marqué `available: false` si réservé.

7. **Fixture de dev** : 2-3 demandes en statuts différents pour faciliter le test admin futur (PR5 back-office).

### Côté Next.js (`apps/web/`) — PR13

8. **Route** : `apps/web/src/app/(public)/reserver-anniversaire/page.tsx` (RSC qui fetch les formules + slots du jour minimal, rend un client component `<TunnelAnniversaire>`).

9. **Composant `TunnelAnniversaire`** (`apps/web/src/components/sections/tunnel-anniv/`) : state machine **5 étapes** + écran final.
   - `ORDER = ['formule', 'date', 'enfant', 'coordonnees', 'recap', 'confirmation']`
   - Pas de paiement, pas de 3DS, pas d'échec. Le bouton du récap est **"Confirmer ma réservation"** (pas "Payer 50€").
   - Découpage en fichiers : `TunnelAnniversaire.tsx` (orchestration), `Stepper.tsx`, `Step1Formule.tsx`, `Step2Date.tsx`, `Step3Enfant.tsx`, `Step4Coordonnees.tsx`, `Step5Recap.tsx`, `StepConfirmation.tsx`, `schema.ts` (Zod).
   - Hooks : `useReservationTunnel` (state + transitions + scroll auto). Persister la progression dans `sessionStorage` (clé `fgc.anniv.draft`) — si refresh, on reprend où on en était (jusqu'à la confirmation, qui clear).

10. **Validation** : `zod` schemas par étape, intégration `react-hook-form` avec `zodResolver`. Le bouton "Suivant" est désactivé tant que l'étape n'est pas valide (et déclenche les errors en submit). **Toutes les règles front sont rejouées côté API** — assume-le.

11. **Step 1 — Formule** : 3 cartes (récupérées depuis `GET /api/formules/anniversaires`), affichage proche maquette mais **tokens DS uniquement** (pas de `#ffd93d` en dur). Bandeau bas "Acompte 50€ ?" → **adapté V1** : *"Aucun paiement en ligne. On vous rappelle sous 24h pour bloquer la date."*

12. **Step 2 — Date & créneau** : calendrier mensuel custom (J+7 mini, week-ends mis en avant). Au changement de date, fetch `GET /api/reservations/anniversaire/availability?date=...` → griser les slots indisponibles. Spinner pendant le fetch. Cache côté React Query (5 min TTL).

13. **Step 3 — Enfant** : prénom, âge (boutons 4→14), nombre d'enfants (stepper +/− avec min/max formule). Total estimé en bas de carte. **Upsell VR** (cf. CLAUDE.md §11) : si formule = `newbowler` ou `superbowler`, afficher un toggle *"+ Réalité virtuelle pour +4€/enfant → passe en Pro Bowler 💎"* sous le total. Toggle ON → update `formuleId` automatiquement vers `probowler` (et inversement si OFF).

14. **Step 4 — Coordonnées parent** : 4 champs requis (prénom, nom, email, tél FR) + 2 optionnels (source, message) + 2 checkboxes (CGV obligatoire, newsletter optionnel). Lien CGV → page `/cgv` (placeholder `href="#"` si pas encore existante, mais pas `onClick=preventDefault`).

15. **Step 5 — Récap** : aside droite avec total fête (formule × enfants), pas de ligne "à payer maintenant" / "acompte". À la place : encart calme *"Demande de réservation — pas de paiement en ligne. Notre équipe vous rappelle sous 24h pour confirmer la date et l'acompte de 50€ (sur place ou virement)."* Bouton final **"Confirmer ma demande"** → POST `/api/reservations/anniversaire`, loading state, gestion 409 (slot pris entre-temps → toast + retour étape 2 sur la même date).

16. **Step Confirmation** : reprendre le visuel de `StepConfirmation` (confettis + ref + grid détails) mais **adapter le ton V1** :
    - Titre : "Demande envoyée 🎉" (pas "C'est validé !")
    - Sous-titre : *"On vous rappelle sous 24h pour confirmer la date et organiser l'acompte."*
    - Pas de ligne "Acompte payé ✓" ni "Reste sur place".
    - Référence FGC-XXXXXX (depuis la réponse API) + bouton copier.
    - Bloc "Ce qui arrive ensuite" : J+1 = appel équipe / J−7 = email rappel / Jour J = arrivée 15min avant.
    - Clear `sessionStorage`, désactiver le bouton retour navigateur via `history.replaceState`.

17. **Header CTA** : ajouter le bouton "Réserver un anniv" dans le `Header` global (composant `apps/web/src/components/layout/Header.tsx`) qui pointe vers `/reserver-anniversaire`. Cohérent avec CLAUDE.md §11.

18. **Lien depuis `/tarifs-et-formules`** : sur chaque carte AnnivCard, le CTA "Réserver" passe l'`?formule=KEY` en query string. Le tunnel lit `searchParams.formule` au mount pour pré-sélectionner l'étape 1.

### À NE PAS faire (différé V2)

- Stripe / paiement carte / 3DS / écran échec (V2, après retour gérant sur taux no-show).
- Module admin de gestion des demandes (= PR5 back-office, plan séparé).
- Mailing transactionnel avancé (relance J−7 / SMS J−2) — placeholders dans la conf et le texte client uniquement.
- SEPA / PayPal (jamais V1).
- A/B testing du tunnel, tracking analytics fin (event par étape) — V1 = juste un `data-tunnel-step="..."` sur le `<main>` pour faciliter le tagging plus tard.

## Contraintes techniques

- **TypeScript strict** côté Next, **`Assert\*` partout** côté Symfony. Tout endpoint public a un DTO + validator.
- **Tokens DS uniquement** : zéro hex dans le JSX. Les couleurs formules (`#c9d1d9 / #ffd93d / #ff2d87`) doivent passer par les tokens Tailwind (étendre `tailwind.config.ts` si besoin : `formule-newbowler`, `formule-superbowler`, `formule-probowler`).
- **CSS** : préfère réécrire en Tailwind (cohérent avec le reste du site). Si une animation est trop complexe (confettis, dégradé radial du hero), garde un fichier `tunnel.module.css` colocalisé.
- **Rate limit** : configure `framework.rate_limiter` Symfony (`anniv_post`, `anniv_availability`) + handler `429` qui retourne Problem Details.
- **CORS** : déjà géré côté API (Nelmio), juste vérifier que `/api/reservations/anniversaire` n'est pas dans une regex bloquée.
- **Accessibilité** : focus rings visibles, `aria-current="step"` sur le stepper, `aria-invalid` sur les fields en erreur, navigation clavier OK (Tab/Shift+Tab + Enter pour valider l'étape).
- **Responsive** : testé à 1280 / 980 / 720 / 360 px (cf. PAGES_BACKLOG critères transverses). Le calendrier passe en stack sur mobile, les cartes formules en colonne.
- **Pas de dépendance ajoutée** sauf si justifié : `zod` + `react-hook-form` + `@hookform/resolvers` + `@tanstack/react-query` sont déjà au boot, sinon installer. Pas de date-fns (Intl.* suffit pour `formatDateLong`). Pas de framer-motion pour ce tunnel (CSS pur sur les transitions d'étape).

## Auto-vérification

1. `cd apps/api && symfony console doctrine:migrations:migrate` → 0 erreur, la table `demande_reservation` existe avec les bons index.
2. `cd apps/api && bin/phpunit tests/Controller/Api/AnnivReservationTest.php` → tous verts.
3. `curl -X POST http://localhost:8000/api/reservations/anniversaire -H "Content-Type: application/json" -d '<payload nominal>'` → 201 + reference `FGC-XXXXXX` retournée.
4. Même curl avec `acceptCGV: false` → 400 + violations.
5. Curl conflit (2 POST identiques sur même date/slot) → 2e renvoie 409.
6. `curl 'http://localhost:8000/api/reservations/anniversaire/availability?date=YYYY-MM-DD'` → slots ; le slot réservé apparaît `available: false`.
7. Mails : `cd apps/api && symfony console messenger:consume` non requis (sync) — vérifier dans `var/log/dev.log` ou MailHog que 2 mails partent à chaque création.
8. Navigateur : `http://localhost:3000/reserver-anniversaire` → tunnel fluide, 5 étapes + confirmation. Pré-remplissage via `?formule=probowler` OK.
9. Refresh navigateur au milieu d'une étape → reprise via sessionStorage. Refresh sur l'écran confirmation → ne ré-affiche pas le confettis (sessionStorage clear).
10. `npm run build` → 0 erreur TS.
11. Lighthouse local sur `/reserver-anniversaire` ≥ 85 (perf + a11y).
12. Screenshots desktop + mobile dans `docs/screenshots/13-tunnel-anniv-{desktop,mobile}.png` (cf. PAGES_BACKLOG).
13. `docs/CHANGELOG.md` : `feat(api,web): tunnel réservation anniversaire V1 sans Stripe (PR10+PR13) — 5 étapes, demande + mails, conflit créneau`.
14. `docs/API_CONTRACT.md` : ajouter la doc des 2 nouveaux endpoints (POST + availability) avec payload, codes, exemples.

## Si tu es bloqué

- Doute sur le scope V1 : **CLAUDE.md §11** est la source de vérité, pas la maquette (qui montre le paiement → on l'enlève).
- Doute design (couleurs formule, animations confettis, stepper) : ouvre la maquette HTML en navigateur (`open ~/Desktop/FAMILY GAMES CENTER/fgc-website-prototype-html-claude-design/project/reserver-anniversaire.html`) avant d'inventer.
- Conflit avec le PLAN_BACKOFFICE (`docs/PLAN_BACKOFFICE.md`) : le tunnel anniv y est marqué "en pause" — décision révisée le **2026-05-18**, on débloque cette PR avant le back-office. La gestion des demandes côté admin reste PR5 du back-office et ne fait PAS partie de ce prompt.
- Doute structurel : **arrête et demande à Kévin**.

*Fin PROMPT_CLAUDE_CODE_TUNNEL_ANNIV.md*
