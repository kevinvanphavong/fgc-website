# Refonte page d'accueil — routage par occasion + priorité anniv

> Restructurer la home pour basculer sur un routage par occasion (anniv enfant prioritaire) et lever les freins à la résa pour la persona mère 30-45 ans, sans casser les sections existantes.

## Contexte

La home actuelle (`Hero → Activities → Offers → Schedule → Experience`) traite toutes les occasions à plat. Or la priorité business V1 est l'anniversaire enfant (panier 250-400 €, persona mère 30-45 ans, levier upsell +5-10 k€/an). Tu ajoutes un Hero à double CTA, un bloc "Pour quelle occasion ?" qui route selon l'intention, un spotlight anniv dédié, des témoignages, et un teaser Bar. Les sections existantes sont réordonnées mais leur contenu interne ne change pas.

## Fichiers à lire avant de coder

- `apps/web/src/app/page.tsx` — composition actuelle
- `apps/web/src/components/sections/Hero.tsx` — hero à refactor (1 CTA → 2 CTAs)
- `apps/web/src/lib/formules.ts` — pour récup les 3 formules anniv (New / Super / Pro Bowler)
- `apps/web/src/lib/nav.ts` — `RESERVATION_URL` et conventions de liens
- `DESIGN_SYSTEM.md` § 8 (sections types), § 6 (cards), § 4 (boutons) — patterns à reprendre
- `~/Desktop/FAMILY GAMES CENTER/refonte-site/00_brief-projet.md` — vision V1 (anniv prio, persona, upsell)

## Décisions actées (à ne pas remettre en cause)

- 2 CTAs distincts dans le Hero (pas de splash intermédiaire) : "Réserver une activité" (primaire jaune) + "Organiser un anniversaire enfant" (variant pink). Pas de hiérarchie écrasante : les deux doivent être visibles sans scroll.
- Bloc "Pour quelle occasion ?" = 4 cards : Anniv enfant → `/formules#anniversaires`, Sortie famille → `/formules#pass-multi`, Soirée entre amis → `/formules#soirees`, Groupe & CE → `/entreprises`.
- Bloc Anniv spotlight = 3 cards horizontales (New / Super / Pro Bowler) avec Super marqué "★ Best-seller". CTA principal "Réserver une date" → `/reserver-anniversaire` (tunnel) ; CTA secondaire "Voir le détail" → `/formules#anniversaires`.
- Témoignages V1 = 3 témoignages en dur dans `lib/testimonials.ts` (1 anniv mère, 1 groupe, 1 famille). Pas de scraping Google Reviews (V2). Marquer en commentaire "à valider Kévin avant prod".
- Note Google dans le Hero = texte en dur "★★★★☆ 4.6 / 5 — Google" tant que pas d'API. Marquer en commentaire à mettre à jour avec la vraie note.

## Tâche

1. Refactor `apps/web/src/components/sections/Hero.tsx` : 2 CTAs au lieu d'un, sous-titre mentionnant "Bowling, billard, arcade, karaoké, VR — pour familles, groupes et anniversaires", bandeau social proof Google juste sous les CTAs.
2. Créer `apps/web/src/components/sections/OccasionRouting.tsx` — 4 cards visuelles reprenant le pattern `.activity-card` du DS (icône grande + titre + 1 phrase + flèche `→`). Section eyebrow "Pour quelle occasion ?" + titre "Trouvez votre formule en 1 clic".
3. Créer `apps/web/src/lib/testimonials.ts` (data : 3 entrées typées `{ author; role; rating; quote; occasion }`) puis `apps/web/src/components/sections/Testimonials.tsx` (3 cards, étoiles ★ jaunes, photo ronde placeholder coloré — pas de stock photo).
4. Créer `apps/web/src/components/sections/BirthdaySpotlight.tsx` — section dédiée anniv enfants, 3 cards horizontales basées sur les formules anniv de `lib/formules.ts`, badge "★ Best-seller" sur Super Bowler, bandeau service VIP inclus (coupe-file, table décorée, médailles, polaroid). 2 CTAs.
5. Créer `apps/web/src/components/sections/BarTeaser.tsx` — bloc court (1 visuel à droite + texte à gauche, 2-3 lignes + CTA vers `/bar-snack`). Reprendre les bonnes affiches dans `public/assets/`.
6. Refactor `apps/web/src/app/page.tsx` pour composer dans l'ordre : `Hero → OccasionRouting → BirthdaySpotlight → Activities → Offers → Schedule → BarTeaser → Testimonials → Experience`.

## Ce qu'il ne fait PAS

- Pas de modif des sections existantes Activities / Offers / Schedule / Experience (sauf ordre dans `page.tsx`).
- Pas de newsletter / capture email (V1.5).
- Pas de Google Maps embed (renvoyer vers `/contact`).
- Pas de scraping Google Reviews (V2).
- Pas de modif du tunnel résa anniv ni des pages activité (autres prompts).
- Pas d'ajout de package npm.

## Notes techniques

- Si la structure des formules anniv manque dans `lib/formules.ts`, l'ajouter dans la même PR avec : `{ slug; tier; ageRange; price; included[]; featured? }`. Sinon, juste réutiliser.
- L'image hero ne change pas dans ce prompt (Kévin organise un shooting photo en parallèle, le remplacement se fera plus tard via simple swap de `src`).
- Le bandeau "★ 4.6 / 5 Google" doit dégrader gracieusement si la note est vide (n'afficher que si présente).

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de livraison tant qu'une case est rouge.

### Après chaque commit
```bash
cd apps/web
npm run lint && npm run build
```

### Tests fonctionnels
- [ ] La home affiche dans l'ordre : Hero (2 CTAs visibles sans scroll) → Occasion routing (4 cards) → Anniv spotlight (3 cards, Super best-seller marqué) → Activities (intact) → Offers (intact) → Schedule (intact) → Bar teaser → Testimonials (3) → Experience (intact).
- [ ] CTA Hero "Organiser un anniversaire" route vers `/reserver-anniversaire` (page placeholder OK si tunnel pas encore livré).
- [ ] Les 4 cards Occasion routing ouvrent les bonnes URL avec ancrage section.
- [ ] Mobile (≤720px) : Hero passe en 1 col avec CTAs empilés, Occasion routing en 2x2 puis 1 col, BirthdaySpotlight en 1 col.
- [ ] Témoignages : étoiles affichées, citation lisible, fallback photo (placeholder coloré) propre.

### Critères d'acceptation
- [ ] Aucun hex en dur dans le JSX (tokens uniquement, cf. CLAUDE.md § 6.1).
- [ ] Responsive testé à 1280 / 980 / 720 / 360 px (cf. PAGES_BACKLOG critères transverses).
- [ ] Lighthouse local ≥ 85 sur `/` desktop & mobile, LCP < 2.5s.
- [ ] Aucune erreur console.
- [ ] Screenshots dans `docs/screenshots/03bis-home-refonte-{desktop,mobile}.png`.
- [ ] Aucune règle absolue du `CLAUDE.md` enfreinte.

### Auto-relecture du diff
Avant livraison, `git diff main..HEAD` et relis en hostile : 2 CTAs hero bien distincts visuellement ? anniv enfant bien mis en avant ? sections existantes intactes (juste réordonnées) ? testimonials data placeholders bien marqués `// TODO: à valider Kévin avant prod` ? note Google en commentaire `// TODO: brancher vraie note quand API dispo` ?

**Si une case est NON → tu corriges et tu re-vérifies tout.**

## Livraison

1. 1 commit data (`feat(web): add testimonials lib + extend formules data for birthday spotlight`).
2. 1 commit composants (`feat(web): add OccasionRouting/BirthdaySpotlight/Testimonials/BarTeaser + refactor Hero with dual CTA`).
3. 1 commit page (`feat(web): recompose home with occasion-first routing and birthday priority`).
4. Bullet dans `docs/CHANGELOG.md`.
5. Tu push pas. Kévin push.
