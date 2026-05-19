# Refonte template page activité — segments par occasion

> Restructurer le template partagé par les 7 pages activité pour aligner le contenu sur les intentions utilisateur réelles (occasion d'usage), pas sur les produits internes. Référence d'implémentation = `/bowling`.

## Contexte

La page `/bowling` actuelle ne montre QUE les cartes de fidélité 5/8/14 parties. Une mère qui arrive via "bowling Blois anniversaire" ne voit aucune offre anniv, aucun prix unitaire, aucun pass multi-activités. Le bloc tarifs est hors-cible pour le 1er visiteur (personne n'achète une carte fidélité avant d'avoir testé). Tu refondes le template pour rendre du tarif par OCCASION (anniv enfant / famille / soirée / groupe), ajouter "Idéal pour…", infos pratiques, FAQ avec JSON-LD, cross-link, et déplacer les cartes fidélité en bloc secondaire.

## Fichiers à lire avant de coder

- `apps/web/src/lib/activity-pages.ts` — types + data des 7 activités (à étendre)
- `apps/web/src/components/sections/PageHero.tsx` — template hero + `PricingSection` actuel
- `apps/web/src/lib/formules.ts` — formules anniv + pass multi (sources des nouvelles cards occasion)
- `apps/web/src/lib/tarifs.ts` — prix unitaires par activité (`TARIFS_ACTIVITES`)
- `DESIGN_SYSTEM.md` § 6 (cards), § 8 (sections types), § 14 (a11y) — patterns et tokens
- `~/Desktop/FAMILY GAMES CENTER/refonte-site/00_brief-projet.md` — vision V1 (anniv prioritaire, persona mère 30-45)

## Décisions actées (à ne pas remettre en cause)

- Le bloc tarifs principal liste 3-4 entrées par OCCASION : prix unitaire d'appel, formule populaire de l'activité, anniv enfant, pass multi pertinent.
- Les cartes fidélité (5/8/14 pour bowling) passent en bloc SECONDAIRE "Vous venez régulièrement ?" en bas de page, jamais dans le tarif principal.
- Chaque card occasion route vers `/formules` avec ancrage (`#anniversaires`, `#pass-multi`, `#soirees`) ou `/entreprises`. Pas de tunnel résa direct depuis les cards.
- FAQ avec balisage `application/ld+json` (`@type: FAQPage`) pour SEO local.
- Tel cliquable (`tel:0254748521`) ajouté en CTA final (variant ghost).

## Tâche

1. Étendre `ActivityPage` dans `lib/activity-pages.ts` avec : `pricingByOccasion: { occasion; price; description; href; featured? }[]`, `loyaltyCards?: PriceCard[]` (les cartes 5/8/14 actuelles vont là pour bowling), `idealFor: { icon; title; sub; href }[]`, `practicalInfo: { label; value }[]`, `faq: { question; answer }[]`, `crossLinks: { slug; title; pitch }[]`.
2. Migrer la data des 7 activités. Pour bowling : occasions = (Partie unique 7,90 € → `/tarifs#bowling` · Bowling illimité lun-mar 20 € featured → `/formules#soirees` · Anniv enfant dès 18,50 € → `/formules#anniversaires` · Pass Confort 26,90 € → `/formules#pass-multi`). Pratique = (Durée moyenne 10 min/pers · Capacité max 6 pers/piste · Dès 3 ans · Chaussures fournies · PMR oui). FAQ = 5 questions ciblées SEO ("À partir de quel âge ?", "Faut-il réserver ?", "Combien de temps dure une partie ?", "On peut manger pendant ?", "Retard, on perd la piste ?"). Cross-links = Karaoké, Arcade, Billard, Bar.
3. Créer dans `apps/web/src/components/sections/` : `OccasionPricingSection.tsx`, `IdealForSection.tsx`, `PracticalInfoSection.tsx`, `FaqSection.tsx` (avec JSON-LD), `LoyaltyCardsSection.tsx`, `CrossLinksSection.tsx`. Tous en RSC (pas de `'use client'`).
4. Supprimer ou marquer `@deprecated` l'ancienne `PricingSection` dans `PageHero.tsx` (le hero reste, le pricing change).
5. Mettre à jour les 7 pages activité (`apps/web/src/app/{bowling,billard,arcade,realite-virtuelle,karaoke,blind-test,flechettes}/page.tsx`) pour composer dans l'ordre : `<PageHero> → <OccasionPricingSection> → <IdealForSection> → <PracticalInfoSection> → <FaqSection> → <LoyaltyCardsSection> (conditionnel) → <CrossLinksSection>`.
6. Vérifier que `/formules/page.tsx` a bien les `id` `anniversaires`, `pass-multi`, `soirees` sur ses sections. Si manquant, ajouter dans la même PR (modif minimale).

## Ce qu'il ne fait PAS

- Pas de galerie photo V1 (shooting photo client en cours — on remplacera juste l'image hero plus tard).
- Pas de modif du tunnel résa anniv (autre prompt dédié couvre l'upsell Super → Pro Bowler).
- Pas de modif de la home (autre prompt).
- Pas d'ajout de package npm. Pas de modif des tokens du DS.

## Notes techniques

- JSON-LD : `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(...)}} />` injecté dans le rendu de `FaqSection`. Schema `FAQPage` officiel Google.
- Tous les emojis décoratifs doivent porter `aria-hidden="true"` (DS § 14).
- Pour les 6 autres activités hors bowling : `loyaltyCards` reste `undefined`, le composant `LoyaltyCardsSection` ne rend rien.

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de livraison tant qu'une case est rouge.

### Après chaque commit
```bash
cd apps/web
npm run lint && npm run build
```

### Tests fonctionnels
- [ ] `/bowling` affiche dans l'ordre : Hero → Pricing par occasion (4 cards, "Bowling illimité" featured) → Idéal pour (4 cards) → Infos pratiques → FAQ → Cartes fidélité (3 cards) → Cross-links (4 cards).
- [ ] Chaque card "occasion" a un CTA fonctionnel pointant vers la bonne ancre Formules.
- [ ] Les 6 autres pages activité affichent le même squelette, contenu adapté, AUCUNE n'affiche le bloc `LoyaltyCardsSection` (sauf si data y est définie).
- [ ] JSON-LD FAQ présent dans le HTML rendu (`view-source` → chercher `"@type":"FAQPage"`).
- [ ] Tel `0254748521` cliquable visible sur mobile, ouvre l'app téléphone.
- [ ] `/formules` a bien les ancres `#anniversaires`, `#pass-multi`, `#soirees` (clic depuis une card occasion scrolle au bon endroit).

### Critères d'acceptation
- [ ] Aucun hex en dur dans le JSX (tokens uniquement, cf. CLAUDE.md § 6.1).
- [ ] Responsive testé à 1280 / 980 / 720 / 360 px (cf. PAGES_BACKLOG critères transverses).
- [ ] Lighthouse local ≥ 85 sur `/bowling` desktop & mobile.
- [ ] Aucune erreur console.
- [ ] Screenshots dans `docs/screenshots/04bis-bowling-refonte-{desktop,mobile}.png` + au moins 1 autre activité pour preuve cross-page.
- [ ] Aucune règle absolue du `CLAUDE.md` enfreinte.

### Auto-relecture du diff
Avant livraison, `git diff main..HEAD` et relis en hostile : régression sur les 6 autres pages activité ? scope creep (ne fais pas le tunnel ni la home) ? data des prix correcte (vérifier les valeurs dans le brief `refonte-site/00_brief-projet.md`) ? cohérence des `id` d'ancrage avec `/formules` ?

**Si une case est NON → tu corriges et tu re-vérifies tout.**

## Livraison

1. 1 commit data (`feat(web): extend ActivityPage type + migrate 7 activities to occasion-based pricing`).
2. 1 commit composants (`feat(web): add OccasionPricing/IdealFor/PracticalInfo/Faq/Loyalty/CrossLinks sections`).
3. 1 commit pages (`feat(web): recompose 7 activity pages, bowling as reference + add anchor ids to /formules`).
4. Bullet dans `docs/CHANGELOG.md`.
5. Tu push pas. Kévin push.
