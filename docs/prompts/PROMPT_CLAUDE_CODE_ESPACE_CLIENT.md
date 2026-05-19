# PR11 + PR14 — Espace client (auth + profil + mes réservations)

> **À coller dans Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** : `CLAUDE.md`, `docs/GOTCHAS.md`, `docs/PAGES_BACKLOG.md` (PR11+14), `docs/API_CONTRACT.md`, **`DESIGN_SYSTEM.md`** (source de vérité visuelle — c'est le DS du SITE PUBLIC qu'on utilise ici, PAS le DS admin violet).

## Contexte

Espace client public pour les parents (anniv) et les contacts B2B. Permet de se connecter, consulter ses réservations, gérer ses préférences. **Différenciant commercial** important vs solutions concurrentes (Bookéo et co).

**Décision clé** : on **réutilise l'entité `User` existante** (PR2 + PR7) avec un nouveau rôle `ROLE_CLIENT`. Login unique `/api/auth/login`, distinction côté front au moment du redirect. JWT séparé en cookie `client_token` (httpOnly, samesite=Lax) pour ne pas mélanger avec le cookie admin existant `admin_token`.

**Cohérence visuelle** : toutes les pages client suivent **le DS du site public** (Lilita One headings, Fredoka body, palette jaune/rose/violet nocturne, BgAmbient, shadow décalée sur boutons). Surtout PAS le violet admin `#5E2DB8`. Les pages doivent ressembler aux autres pages publiques (`/bowling`, `/reserver-anniversaire`).

## Scope strict

### A. Backend Symfony (PR11, ~1,5j)

1. **Rôle `ROLE_CLIENT`** ajouté à `User` (hierarchy : `ROLE_STAFF > ROLE_CLIENT`, indépendants donc un user staff n'est PAS client par défaut). Migration si besoin.

2. **Endpoint `POST /api/auth/register`** (public, rate-limit 5/h/IP) :
   - DTO `RegisterClientInput` : `email`, `password` (min 10 chars, 1 maj, 1 chiffre), `firstName`, `lastName`, `phone` (nullable), `acceptRgpd` (true requis), `acceptNewsletter` (bool).
   - Crée le user avec `ROLE_CLIENT` + `enabled=true` (pas d'invite, auto-confirmé V1 — vérif email V2).
   - Mail de bienvenue best-effort.
   - 201 + JWT `client_token` posé en cookie httpOnly. **JAMAIS** d'élévation de rôle possible via ce endpoint.

3. **Endpoint `POST /api/auth/login`** (existant) : adapter pour distinguer le cookie selon le rôle dominant retourné (si `ROLE_ADMIN/MANAGER/STAFF` → cookie `admin_token` ; sinon `client_token`). Le user peut être logué admin ET client simultanément dans deux onglets, c'est OK.

4. **Endpoint `POST /api/auth/logout`** (côté route handler Next.js) : supprime juste le cookie `client_token`. Pas d'invalidation serveur V1 (JWT stateless, accepte).

5. **Endpoint `GET /api/me`** (`ROLE_CLIENT`) : profil du user connecté (id, email, firstName, lastName, phone, acceptNewsletter, createdAt).

6. **Endpoint `PATCH /api/me`** (`merge-patch+json`, `ROLE_CLIENT`) : édite firstName, lastName, phone, acceptNewsletter. **Pas l'email** (V2 avec re-vérif). **Pas le mot de passe** ici (endpoint dédié).

7. **Endpoint `POST /api/me/change-password`** (`ROLE_CLIENT`) : `{ currentPassword, newPassword }`. 422 si currentPassword incorrect. Hash via `UserPasswordHasherInterface`.

8. **Endpoint `GET /api/me/reservations`** (`ROLE_CLIENT`) : agrège les `DemandeReservation` ET `B2BRequest` du user via match sur `parentEmail` / `contactEmail` = email user. Trié par date événement DESC. Payload unifié `{ kind: 'anniv'|'b2b', reference, status/stage, eventDate, summary, totalCents }`. Pagination 25/page.

9. **Endpoint `DELETE /api/me`** (`ROLE_CLIENT`, RGPD) : **anonymise** plutôt que supprime — change email en `deleted-{id}@deleted.fgc`, vide firstName/lastName/phone, `enabled=false`, conserve les résa rattachées (légitime côté gestion). Confirme via toast. Pas de suppression hard.

10. **Endpoint `POST /api/auth/forgot-password`** (public, rate-limit 3/h/IP, `email`) : génère token reset 1h, mail si user existe (response 204 même si email inconnu — pas de leak d'existence). Réutilise `User.resetToken` (déjà posé PR7).

11. **Liaison `DemandeReservation.userId` et `B2BRequest.userId`** (nullable, ManyToOne User) : **à l'INSERT du tunnel anniv ou form B2B**, si un user `ROLE_CLIENT` connecté est détecté via cookie, on stamp `userId` pour rattachement direct (en plus du match par email pour les résa créées avant inscription). Migration. Pas de back-ref `User.reservations` exposée en Groups (gotcha #4).

12. **Tests** : `tests/Api/AuthClientTest.php` (register OK, register acceptRgpd=false 422, register email déjà pris 422, login client cookie posé, me 401 sans token, me 200 avec token, change-password mauvais current 422, forgot-password 204 toujours, delete me anonymise, me/reservations agrège). ~10 scénarios.

### B. Frontend Next.js (PR14, ~1,5j)

13. **Routes publiques** dans `apps/web/src/app/(public)/` :
    - `/connexion` — formulaire email + password, lien "Mot de passe oublié", lien "Pas encore de compte ? S'inscrire".
    - `/inscription` — formulaire register avec RGPD obligatoire + newsletter optionnel. Lien "Déjà inscrit ?".
    - `/mot-de-passe-oublie` — input email → succès "Si un compte existe, vous recevrez un email" (sans confirmer l'existence).

14. **Route groupée protégée** `apps/web/src/app/(client)/compte/` (nouveau route group) avec un `layout.tsx` qui :
    - Vérifie le cookie `client_token` côté server, redirect `/connexion?next=/compte` sinon.
    - Pose un `<ClientShell>` minimaliste (juste Header public + Footer public, **pas de sidebar à la admin** — cohérence visuelle site public).
    - Une barre de sous-navigation horizontale tokenisée : "Mon profil" / "Mes réservations" / "Déconnexion".

15. **Page `/compte`** (profil) :
    - Header carte : avatar (initiales colorées, palette FGC), nom + email + "Membre depuis {date}".
    - Section "Mes informations" : édit inline firstName/lastName/phone/newsletter (RHF + Zod, save en débounce 800ms via PATCH).
    - Section "Mot de passe" : bouton qui ouvre modale change-password (current + new + confirm).
    - Section "Compte" : bouton danger "Supprimer mon compte" (confirme via modale qui mentionne "vos réservations seront conservées de façon anonymisée pour notre gestion interne").

16. **Page `/compte/reservations`** :
    - Cards des résa anniv + B2B, mélangées, triées par date événement DESC.
    - Chaque card : icône (🎂 anniv / 💼 B2B), titre court, date, statut pill (cohérent couleurs site), ref, "Voir détails" qui ouvre une modale read-only.
    - Empty state : "Pas encore de réservation. Réservez votre anniv dès maintenant →" avec CTA jaune vers tunnel.

17. **Header public** : ajouter un avatar/menu utilisateur en haut à droite si client connecté. Si déconnecté → bouton "Se connecter" discret à côté du CTA "Réserver un anniv".

18. **Tunnel anniv et form B2B** : si user client connecté détecté, **pré-remplir** firstName/lastName/email/phone et ajouter en haut un toast vert "Vous êtes connecté en tant que [Prénom]. Vos infos sont pré-remplies.". Le payload POST inclut le cookie → backend stamp `userId`.

19. **Hook `useClient()`** dans `apps/web/src/lib/client-auth.ts` : `{ user, isLoading, login, logout, refetch }` consommable depuis n'importe quelle page. State partagé via React Query (clé `me`).

20. **Middleware Next.js** (`apps/web/middleware.ts`) : matcher `/compte/:path*` redirige vers `/connexion?next=...` si pas de cookie `client_token`. **Indépendant du middleware admin existant** — ne pas tout fusionner, garde deux matchers distincts.

### À NE PAS faire (V2)

- Vérification email à l'inscription (V2 avec token signé).
- Modification de l'email (V2 avec re-vérif).
- 2FA / OAuth (Google, Facebook) — V2.
- Téléchargement RGPD complet des données (V2 export JSON).
- Notifications in-app sur changement de statut résa (V2 avec polling ou SSE).
- Possibilité d'annuler une résa depuis le compte client (V2 — pour l'instant le client appelle).
- Conversion d'un compte ROLE_STAFF en ROLE_CLIENT ou inverse (V2 si cas d'usage).

## Contraintes

- **Cohérence visuelle SITE** non négociable : tokens DS site public uniquement (Lilita One H1, Fredoka body, palette jaune/rose/violet nocturne). **Aucun élément du shell admin violet** ne doit apparaître côté `/compte`.
- Cookies httpOnly Secure SameSite=Lax. Durée JWT client 7j (vs 1h admin — usage plus relax).
- `merge-patch+json` côté PATCH `/api/me` (acquis PR5).
- Le pré-remplissage tunnel anniv/B2B doit fonctionner SANS imposer la connexion (un visiteur non connecté garde le flow actuel). C'est un confort, pas une barrière.
- L'anonymisation à la suppression de compte est **non négociable** — Mr Vong a tranché pour la conservation des résa.
- Si tu touches au mailer pour les mails de bienvenue / reset → réutilise le pattern best-effort déjà posé.

## Auto-vérification

1. `make test-api` → 120+ tests verts.
2. `npm run build` → 0 erreur TS, nouvelles routes `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/compte`, `/compte/reservations`.
3. **Inscription** : `/inscription` → register → cookie `client_token` posé → redirect `/compte` → user visible.
4. **Tunnel anniv connecté** : faire une résa → la résa apparaît immédiatement dans `/compte/reservations` (rattachée par `userId`).
5. **Match par email post-inscription** : créer une résa anonyme avec `parent@x.fr`, puis s'inscrire avec ce même email → la résa apparaît rétroactivement dans `/compte/reservations` (match par email).
6. **Changement mot de passe** : modale → faux current = 422, valide = 200 + toast.
7. **Anonymisation** : delete me → email user devient `deleted-X@deleted.fgc`, résa toujours visibles côté admin avec l'email original (vérifier ce point — soit on garde l'email résa figé à la création, soit on garde la liaison via `userId`).
8. **Logged out & retour `/compte`** → redirect `/connexion?next=/compte`. Après login → re-redirect `/compte`.
9. **Visuel** : Lighthouse sur `/compte` ≥ 90, tokens DS public uniquement (audit visuel : pas de violet admin).
10. `docs/CHANGELOG.md`, `docs/API_CONTRACT.md` (section "Espace client"), `docs/PAGES_BACKLOG.md` (PR11 + PR14 livrées), `docs/GOTCHAS.md` si nouveau piège (cookie collision admin/client probable).

## Si bloqué

- Si l'anonymisation à la suppression devient compliquée (cascade Doctrine sur les résa) : V1 = juste `enabled=false` + email pseudonymisé sur le user, **ne touche pas aux résa rattachées** (elles gardent l'email d'origine côté admin pour traçabilité métier). C'est plus simple et juridiquement défendable (intérêt légitime de conservation comptable).
- Si le middleware Next ne supporte pas deux matchers indépendants (admin + client) : fusionne en un seul matcher avec branching par segment de path. Pas idéologique.
- Doute structurel : arrête et demande à Kévin.

*Fin PROMPT_CLAUDE_CODE_ESPACE_CLIENT.md*
