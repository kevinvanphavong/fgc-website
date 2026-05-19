# PAGES_BACKLOG.md — Plan d'attaque

Ordre conseillé d'implémentation. Une PR = un scope cohérent (page, groupe de pages, ou endpoints).

## Phase 1 — Frontend vitrine (priorité, livrable vite visible)

| #  | PR                            | Scope                                | Composants neufs                                  | Réf. maquette                            |
|----|-------------------------------|--------------------------------------|---------------------------------------------------|------------------------------------------|
| 1  | `chore/web-bootstrap`         | apps/web — config Tailwind & layout  | (config seulement)                                | —                                        |
| 2  | `feat/web-layout-shell`       | Header + Footer + BgAmbient          | Header, Footer, InfoStrip, BgAmbient, Logo        | `partials.js`, `styles.css` §header §footer |
| 3  | `feat/web-home`               | `/`                                  | Hero, Activities, Offers, Schedule, ExperienceBlock| `index.html`                            |
| 4  | `feat/web-activity-pages`     | `/bowling`, `/billard`, `/arcade`, `/realite-virtuelle`, `/karaoke`, `/blind-test`, `/flechettes` | ActivityPageTemplate, FeatureList, PageHero | `bowling.html` etc.              |
| 5  | `feat/web-pricing`            | `/tarifs`, `/formules`               | PriceCard, FeaturedBadge                          | `tarifs.html`, `formules.html`           |
| 6  | `feat/web-bar-snack`          | `/bar-snack`                         | MenuGrid, MenuItem                                | `bar-snack.html`                         |
| 7  | `feat/web-b2b-contact`        | `/entreprises`, `/contact`           | FormCard, Field, TextArea (côté frontend uniquement, mailto en attendant) | `entreprises.html`, `contact.html` |

## Phase 2 — Backend Symfony (en parallèle dès que possible)

| #  | PR                            | Scope                                | Endpoints / fichiers                              |
|----|-------------------------------|--------------------------------------|---------------------------------------------------|
| 8  | `chore/api-bootstrap`         | Init Symfony 8 + API Platform        | composer setup, JWT keypair, CORS, /api/health    |
| 9  | `feat/api-contact-forms` ✅ livré 2026-05-19 | Endpoints contact + B2B + module admin Messages | POST /api/contact + GET/PATCH /api/admin/contact-messages (PR9 finitions) ; B2B livré en PR6 |
| 10 | `feat/api-reservation-tunnel` | Endpoints tunnel anniversaire (**V1 SANS STRIPE** — cf. CLAUDE.md § 11) | POST /api/reservations/anniversaire (demande sans paiement) + envoi email gérant/client. Stripe = V2. |
| 11 | `feat/api-auth-account` ✅ livré 2026-05-19 | Auth client + profil                 | POST /api/auth/register + /forgot-password, GET/PATCH/DELETE /api/me, POST /api/me/change-password, GET /api/me/reservations |

## Phase 3 — Intégration front × back

| #  | PR                            | Scope                                |
|----|-------------------------------|--------------------------------------|
| 12 | `feat/web-forms-wired` ✅ livré 2026-05-19 | Branche contact + B2B aux endpoints Symfony (PR9 finitions + PR6) — RHF + Zod miroir DTO, confirmation inline avec référence |
| 13 | `feat/web-reservation-tunnel` | Tunnel React (**V1 SANS Stripe Elements**) — 5 étapes : formule, date/créneau, détails enfant, coordonnées, récap+envoi. Stripe Elements = V2. |
| 14 | `feat/web-auth-account` ✅ livré 2026-05-19 | `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/compte`, `/compte/reservations` + cookie `client_token` + Header avatar + pré-fill tunnel/B2B connecté |
| 15 | `chore/seo-a11y-perf-rgpd` ✅ livré 2026-05-19 (partiel) | Pages légales (4) + CookieBanner + sitemap + robots + 404 + JSON-LD LocalBusiness (PR9 finitions). A11y déjà livré PR8. Reste : audit Lighthouse final avant prod. |

## Critères d'acceptation transverses

À chaque PR frontend :
- [ ] Tokens uniquement, zéro hex en dur dans le JSX.
- [ ] Responsive testé à 1280px, 980px (pivot), 720px (pivot), 360px.
- [ ] Aucune erreur console.
- [ ] `npm run build` vert.
- [ ] Lighthouse local ≥ 85 (cible ≥ 90 sur prod).
- [ ] Screenshots desktop + mobile dans `docs/screenshots/{numéro}-{slug}-{viewport}.png`.

À chaque PR backend :
- [ ] DTO + `Assert\*` pour tout endpoint qui reçoit du JSON.
- [ ] Tests `WebTestCase` couvrant : 2xx nominal, 400 payload invalide, 401 si endpoint protégé, 403 si rôle insuffisant.
- [ ] OpenAPI mis à jour (vérifier Swagger UI à `/api`).
- [ ] Pas de secret commité.
- [ ] Bullet ajouté à `docs/CHANGELOG.md`.

## Décisions ouvertes (à trancher avec Kévin avant la PR concernée)

| PR  | Question                                                                                  |
|-----|-------------------------------------------------------------------------------------------|
| 5   | Tarifs définitifs 2026/2027 ? On part sur les valeurs de la maquette ou tu as une grille à jour ? |
| 7/9 | Form contact → email simple (Mailer Symfony + Brevo SMTP) ou CRM (HubSpot/Pipedrive) ?    |
| 8   | Hébergeur PHP (OVH / Scaleway / Clever Cloud) ? Postgres ou MariaDB ?                     |
| 10  | ~~Le tunnel résa pousse vers où à la fin ? Mail FGC + Stripe acompte 50€ confirmé ?~~ → **Tranché 2026-05-15 : V1 = demande sans paiement, email FGC + email client. Stripe V2.** |
| 11  | ~~Espace client : prêt-à-build, ou on garde un placeholder "à venir" en v1 ?~~ → **Tranché 2026-05-19 : V1 livrée (register + login + profil + résa).** Vérif email V2. |
| 15  | RGPD : bandeau cookies — qui valide les textes (DPO / avocat) ? Plausible ou GA4 ?        |
