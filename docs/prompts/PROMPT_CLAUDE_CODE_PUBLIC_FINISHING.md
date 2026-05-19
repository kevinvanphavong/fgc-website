# Finitions site public — Contact branché + Légales/RGPD + SEO de base + 404

> **À coller dans Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** : `CLAUDE.md`, `docs/GOTCHAS.md`, `docs/PAGES_BACKLOG.md` (PR9 reste, PR12 reste, PR15), `docs/API_CONTRACT.md`. Cette PR boucle les trous publics avant le packaging démo. Effort visé : 1-1,5j.

## Contexte

Le site va servir de pilote commercial pour démarcher d'autres parcs de loisirs. **Avant** d'investir dans le mode démo / white-label, il faut combler ce qui se voit à l'œil nu chez un prospect attentif :
- formulaire `/contact` qui plante au submit (page existe, API absente),
- absence totale de pages légales (CGV, mentions, RGPD, bandeau cookies),
- SEO basique manquant (metadata propres par page, sitemap, robots.txt),
- page 404 par défaut Next.js (laide).

**Patterns à réutiliser** : DTO + ProcessorInterface (acquis tunnel anniv + B2B), mailer best-effort, rate-limiter, gotcha #6 uriTemplate explicite, RHF + zodResolver miroir des Assert PHP.

## Scope strict

### A. Contact branché (PR9 reste + PR12 reste, ~0,5j)

1. **Entité `ContactMessage`** côté Symfony (`apps/api/src/Entity/ContactMessage.php`) :
   - Champs : `id`, `reference` (`FGC-CT-XXXXXX`), `parentFirstName` ou `name`, `email` (Assert\Email), `phone` (regex FR mobile nullable), `subject` (enum string : `anniv`, `b2b`, `tarifs`, `partenariat`, `autre`), `message` (text 10-2000), `acceptRgpd` (bool true requis), `status` (enum : `nouveau`, `traite`, `archive` — défaut `nouveau`), `adminNote` (text nullable), `createdAt`.
   - Index `(status, createdAt)`.

2. **DTO `ContactMessageInput`** + Processor `ContactMessageProcessor` (réplique le pattern PR10/PR6) :
   - DTO porte les Assert\*.
   - Processor : génère ref, persist, déclenche 2 mails Twig (admin + accusé client) best-effort.

3. **Endpoint `POST /api/contact`** (public, rate limit 3/min/IP, `uriTemplate` explicite — gotcha #6). 201 avec ref.

4. **Endpoints admin** sur `ContactMessage` (réplique exact pattern PR5/PR6) :
   - GET listing avec filtres `?status` + `?search` (sur name/email/subject/message), 25/page.
   - PATCH `merge-patch+json` → `status`, `adminNote`.
   - Pas de stats dédié (volume trop faible, count global dispo dans dashboard).

5. **Module admin "Messages"** (`/admin/messages`) : entrée sidebar discrète sous "Demandes B2B". Tableau simple (date, nom, sujet, statut, preview message), drawer détail avec actions transitions + note. Badge sidebar count `nouveau`. C'est l'écran admin le plus minimal du back-office, on ne sur-engineer pas.

6. **Brancher le formulaire `/contact`** :
   - Refacto la section formulaire en client component `<ContactForm>` (similaire `<DevisB2BForm>` PR9).
   - Validation Zod miroir Assert PHP.
   - Submit POST `/api/contact`. Sur 201 → confirmation inline avec ref. Sur 4xx → toast + violations.

7. **Fixtures dev** : 3 ContactMessage (1 par statut).

8. **Tests** : 1 fichier `ContactPublicTest.php` (201 nominal, 422 rgpd, 422 subject invalide, 401 admin sans token).

### B. Pages légales + RGPD (~0,5j)

9. **Pages publiques statiques** dans `apps/web/src/app/(public)/legal/` :
   - `/legal/mentions-legales` : éditeur, hébergeur (à laisser placeholder "[Hébergeur — à compléter]"), SIRET FGC.
   - `/legal/cgv` : conditions générales de vente (focus anniv + B2B + parties au comptoir).
   - `/legal/politique-confidentialite` : RGPD, données collectées (form contact, tunnel anniv, B2B), durée conservation, droits utilisateur, contact DPO.
   - `/legal/cookies` : liste des cookies utilisés (V1 : aucun analytics, juste le cookie auth admin `admin_token`).
   - Contenu textuel : génère du texte **réaliste et juridiquement plausible** mais ajoute un encart en haut `⚠️ Document à faire valider par un avocat avant publication réelle`. Ce site est démo, pas en prod.

10. **Bandeau cookies** côté front (composant `<CookieBanner>`) :
    - Affiché en bas, opt-in granulaire (Nécessaire / Analytics — coché par défaut désactivé / Marketing — désactivé).
    - Boutons "Tout accepter", "Tout refuser", "Personnaliser".
    - Décision persistée `localStorage` clé `fgc.cookies.consent` + timestamp. Re-demande après 13 mois (norme CNIL).
    - V1 : aucun cookie tiers réellement activé, le bandeau est posé pour la conformité visuelle et fonctionnera plus tard quand on ajoutera Plausible/GA4.

11. **Footer enrichi** : liens vers les 4 pages légales + lien "Gérer mes cookies" qui ré-ouvre le bandeau.

### C. SEO de base (~0,5j)

12. **Metadata Next.js** sur chaque page publique (`generateMetadata` ou `metadata` const) :
    - Title : `{Page} · Family Games Center · Bowling, laser game et arcade à Blois`.
    - Description : 150-160 caractères, propre à chaque page.
    - OpenGraph + Twitter Cards : image fallback `og-default.jpg` (générer un placeholder dans `public/og/` si absent).
    - Canonical URL.

13. **`apps/web/src/app/sitemap.ts`** : liste les routes publiques avec `lastModified` (`new Date()`), priorités logiques (home 1.0, anniv 0.9, activités 0.8, légal 0.3).

14. **`apps/web/src/app/robots.ts`** : `User-agent: *`, `Allow: /`, `Disallow: /admin/`, lien sitemap.

15. **Structured data JSON-LD** : `LocalBusiness` sur la home (nom, adresse, téléphone, openingHours fictif mais cohérent), `Event` sur les pages anniv si pertinent. Pas critique mais 30 min de travail bien investi pour le SEO local.

### D. Page 404 publique (~0,5h)

16. **`apps/web/src/app/(public)/not-found.tsx`** : layout public gardé (header + footer), illustration / texte "Cette page n'existe pas", bouton "Retour à l'accueil" et "Voir nos activités". Cohérent visuel avec le site.

### À NE PAS faire (V2)

- Espace client `/connexion` `/inscription` `/compte` (= PR11+PR14) — V2 quand un vrai cas d'usage existe.
- Vrai workflow d'opt-in granulaire avec scripts conditionnels (V2 quand analytics branché).
- Sitemap dynamique avec contenu BDD (V2 si plus de pages).
- Service Worker / PWA.

## Contraintes

- Tokens DS, zéro hex.
- Le bandeau cookies ne BLOQUE pas la nav (pas de modal bloquante — un slide-in en bas).
- Les textes légaux : génère du contenu plausible mais l'avertissement "à valider avocat" est non-négociable. C'est un site démo, pas un risque juridique.
- `application/merge-patch+json` côté PATCH (acquis PR5).
- Reverifier RGPD côté tunnel anniv et B2B : le checkbox `acceptCGV` et `acceptRgpd` doivent pointer vers les vraies pages légales maintenant (pas `href="#"`).

## Auto-vérification

1. `make test-api` → vert, nouveaux tests `ContactPublicTest` inclus.
2. `npm run build` → 0 erreur TS, nouvelles routes `/legal/*`, `/admin/messages` présentes.
3. Curl public `POST /api/contact` payload OK → 201 + ref. `acceptRgpd: false` → 422. Subject invalide → 422.
4. Form `/contact` : remplir + soumettre → écran de confirmation avec ref.
5. `/legal/cgv` `/legal/mentions-legales` `/legal/politique-confidentialite` `/legal/cookies` → 200, contenu lisible, avertissement visible.
6. Bandeau cookies visible au 1er load. "Tout refuser" → bandeau disparaît + `localStorage.fgc.cookies.consent` posé. Refresh → bandeau ne réapparaît pas. Click "Gérer mes cookies" footer → bandeau revient.
7. `/sitemap.xml` → XML valide listant les pages publiques. `/robots.txt` → contient `Disallow: /admin/`.
8. `/n-existe-pas` → page 404 publique custom avec header+footer.
9. Admin connecté : `/admin/messages` montre les 3 fixtures + le message créé en test. Transition `nouveau → traite` OK.
10. Liens "conditions générales" et "politique de confidentialité" dans les checkboxes RGPD du tunnel anniv ET du form B2B pointent vers les bonnes URLs.
11. `docs/CHANGELOG.md`, `docs/API_CONTRACT.md` (`/api/contact` + admin), `docs/PAGES_BACKLOG.md` (PR9/12/15 marquées livrées).

## Si bloqué

- Si le RGPD réel pose question (CNIL, durée conservation exacte) : V1 = mets des valeurs standards (conservation 3 ans pour prospects, 10 ans pour comptable), avec l'avertissement "à valider avocat".
- Si tu hésites sur le wording des CGV (montant acompte, délai annulation) : reprends ce qui est déjà écrit dans le tunnel anniv (`50€ acompte, annulation J-7`) et le mockup. Cohérence > exhaustivité.
- Doute structurel : arrête et demande à Kévin.

*Fin PROMPT_CLAUDE_CODE_PUBLIC_FINISHING.md*
