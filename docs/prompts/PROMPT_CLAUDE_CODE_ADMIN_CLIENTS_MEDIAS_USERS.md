# PR7 — Back-office : Clients (CRM léger) + Médias + Users & rôles

> **À coller dans Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** : `CLAUDE.md`, `docs/GOTCHAS.md`, `docs/PLAN_BACKOFFICE.md` §PR7, `docs/API_CONTRACT.md`. Trois modules indépendants groupés en une PR — chacun ~1j, total visé 3-4j.

## Contexte

Trois modules secondaires du back-office, plus simples que les précédents. **Clients** est une vue agrégée lecture-seule (pas de nouvelle entité), **Médias** une bibliothèque d'images uploadées, **Users** un CRUD sur l'entité `User` existante (PR2).

**Sources design** : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/clients.jsx`, `medias.jsx`, `users.jsx` + `data.jsx` (`CLIENTS`, `MEDIAS`, `USERS`, `ROLES`).

**Patterns à réutiliser** : `makeEntityHooks<T>` (PR4), DTO + Processor pour écritures (PR10), gotcha #6 uriTemplate, `merge-patch+json` côté PATCH (PR5), badge sidebar (PR5).

## Scope strict

### A. Module Clients (~1j) — lecture seule

1. **Endpoint `GET /api/admin/clients`** (`ROLE_STAFF`, uriTemplate explicite, pagination 25/page) qui agrège côté Symfony :
   - Source : union de `DemandeReservation` (anniv) + `B2BRequest` groupés par `parentEmail` (résa) ou `contactEmail` (B2B), normalisés en `email`.
   - Payload : `{ email, displayName, phone, firstSeenAt, lastSeenAt, totalReservations, totalAnniv, totalB2B, sources: ['anniv','b2b'], tags: ['fidele','vip','b2b']? }`.
   - **Tags calculés à la volée** (pas en BDD) : `fidele` si `totalReservations >= 5`, `vip` si `totalAnniv >= 3`, `b2b` si présence dans B2BRequest.
   - Filtres : `?search=foo` (email/nom/téléphone), `?tag=fidele`, `?from=…&to=…` sur `lastSeenAt`.
   - Tri défaut `lastSeenAt DESC`.

2. **Endpoint `GET /api/admin/clients/{email}`** (URL-encodé) : détail = mêmes infos + liste des 50 dernières interactions (résa anniv + B2B, mélangées triées par date desc) avec `kind`, `reference`, `status/stage`, `eventDate`, `value`.

3. **Endpoint `GET /api/admin/clients/stats`** : counts globaux (clients totaux, fidèles, VIP, nouveaux 30j).

4. **Page `/admin/clients`** : 4 KPI cards (cf. mockup, valeurs depuis `/stats`), tableau filtrable, drawer détail avec historique chronologique. **Pas de "Nouveau client" ni "Exporter CSV"** (V2 si demandé).

5. **Tests** : 1 fichier `ClientsAggregateTest.php` — 200 nominal avec fixtures mixtes, filtres search/tag, accès non-staff = 401.

### B. Module Médias (~1j)

6. **Entité `Media`** : `id`, `filename` (string, slug auto), `originalName`, `mimeType` (`image/jpeg|png|webp|gif|avif`), `sizeBytes`, `width`, `height`, `tag` (enum : `hebdo`, `anniversaires`, `evenement`, `bar`, `salle`, `global`), `uploadedBy` (ManyToOne User nullable — gotcha #4 : back-ref `User.uploadedMedias` PAS exposée en `Groups`), `createdAt`. Migration.

7. **Storage** : upload sur disque local `apps/api/public/uploads/medias/{yyyy}/{mm}/{filename-slug}.{ext}`. Pas de S3 V1, mais structure compatible (un service `MediaUploader` qui isole le chemin pour bascule future). Public servable directement.

8. **Endpoints** :
   - `POST /api/admin/medias` (multipart/form-data) → upload + persist + retour 201 avec URL absolue. Limites : 5 Mo max, mime whitelist stricte, dimensions max 4000×4000.
   - `GET /api/admin/medias` (filtre `?tag=`, pagination 24/page, tri `createdAt DESC`).
   - `DELETE /api/admin/medias/{id}` → supprime fichier disque + ligne BDD.
   - `PATCH /api/admin/medias/{id}` (merge-patch) → édite uniquement `tag` (renommage = upload différent).

9. **Page `/admin/medias`** : toolbar filtre `Seg` (6 tags + Tout) + bouton "Importer" qui ouvre une modale upload (drag&drop zone, preview thumb, sélecteur de tag, submit). Grille `repeat(auto-fill, minmax(200px, 1fr))` de cards thumbnail + nom + tag + bouton supprimer (avec ConfirmDialog).

10. **Pas de génération IA** ni redimensionnement automatique en V1 — Mr Vong a son flux IA séparé (`prompt_pub_fgc.md`), l'admin sert juste de bibliothèque de stockage.

### C. Module Users & rôles (~1j)

11. **CRUD User** sur l'entité existante (refacto PR2). Endpoints :
    - `GET /api/admin/users` (`ROLE_ADMIN` uniquement, pas `ROLE_STAFF` — seul l'admin gère les comptes).
    - `POST /api/admin/users/invite` → crée user en `enabled=false` + génère token reset 24h + envoie mail invitation (best-effort, log si KO). Body : `{ email, firstName, lastName, role }`.
    - `PATCH /api/admin/users/{id}` (merge-patch) → édite `firstName`, `lastName`, `role`, `enabled`.
    - `DELETE /api/admin/users/{id}` interdit (jamais de suppression hard d'un user — utiliser `enabled=false`). Renvoie 403.

12. **Champ `enabled`** sur User (boolean défaut true) — migration. Bloquer le login si `enabled=false` (sécurité). User actuellement loggé ne peut pas se désactiver lui-même (422 explicite).

13. **Endpoint `POST /api/auth/reset-password`** (public) : prend `token + newPassword`. Le mail d'invitation envoie un lien `/admin/setup-password?token=...` qui POST sur cet endpoint. Réutilisable pour "mot de passe oublié" V2.

14. **Page `/admin/users`** :
    - Tableau (avatar, nom, email, rôle badge coloré, dernière connexion, statut actif/désactivé).
    - Modale "Inviter un utilisateur" (form email/prénom/nom/rôle).
    - Drawer édition (changer rôle, toggle `enabled`).
    - Encart "Rôles & permissions" en sidebar droite : liste lecture-seule des 3 rôles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_STAFF`) avec description de ce qu'ils peuvent faire (texte statique en V1, pas de matrice dynamique).

15. **Page `/admin/setup-password`** (public, accessible sans auth) : formulaire `newPassword` + confirmation. Submit → POST endpoint puis redirect `/admin/login`.

16. **Sidebar** : entrée "Utilisateurs" visible uniquement si `ROLE_ADMIN` (item caché aux managers/staff).

### À NE PAS faire (V2)

- Export CSV (tous modules).
- Matrice de permissions dynamique (V2 si on ajoute des rôles métier).
- Suppression hard d'un user (jamais, c'est délibéré).
- Tags clients en BDD éditables manuellement (V2 si besoin de tag custom genre "ami du gérant").
- Redimensionnement / compression automatique des images (V2 avec Imagick ou service externe).
- Génération d'affiches IA (Mr Vong a un flux séparé via ChatGPT).
- 2FA sur les comptes admin (V2).

## Contraintes

- Mails (invitation, reset) : best-effort, transport `null://` en test, vraies adresses en prod (mais pas grave si SMTP pas branché — log seulement).
- `merge-patch+json` sur tous les PATCH (acquis PR5).
- Tokens DS admin uniquement, pas de hex en JSX.
- Le champ `password` du User ne doit JAMAIS apparaître dans les `Groups` `user:admin:read|write`. Le hash est posé via un `UserPasswordHasherInterface` au reset, pas via PATCH.
- Le tableau Users est rendu uniquement pour `ROLE_ADMIN` côté front (middleware Next vérifie le rôle dans le JWT décodé, redirect `/admin` si pas admin).
- Upload : `MultipartFormDataInputBag` API Platform ou controller dédié — préfère le controller dédié pour la PR car le multipart sur ApiResource demande du config et c'est marginal V1.

## Auto-vérification

1. `make test-api` → tous tests verts (~110+ tests).
2. `npm run build` → 0 erreur TS, 3 nouvelles routes admin.
3. **Clients** : `curl /api/admin/clients` retourne agrégat des fixtures résa+B2B groupées par email. Search `?search=martin` filtre OK. Drawer affiche historique mixte.
4. **Médias** : upload PNG 800×600 via UI → fichier servable sur `/uploads/medias/...`, ligne BDD posée, miniature visible. Upload PDF refusé 415. Upload 6 Mo refusé 413.
5. **Users** : connecté admin → liste 1 user (toi). Invitation `vong@fgc.fr role=manager` → ligne créée `enabled=false`, mail loggé. Login avec ce nouveau user → 403 (enabled=false). Edit toggle `enabled=true` → login OK.
6. Auto-désactivation : essai PATCH `enabled=false` sur soi-même → 422 "vous ne pouvez pas vous désactiver".
7. Accès `/admin/users` connecté `ROLE_MANAGER` → redirect `/admin` (item caché ET endpoint refuse).
8. `docs/CHANGELOG.md` + `docs/API_CONTRACT.md` (clients, medias, users, reset-password documentés) + `docs/PLAN_BACKOFFICE.md` §PR7 marquée livrée + `docs/GOTCHAS.md` enrichi si piège (probable sur multipart + agrégat).

## Si bloqué

- Si l'agrégat Clients devient lent à >1000 demandes : V1 = laisse comme ça (le volume FGC actuel est très inférieur), V2 = vue matérialisée Postgres ou cache.
- Si l'upload multipart pose souci avec API Platform : controller Symfony dédié `MediaUploadController` derrière `/api/admin/medias` (POST uniquement) + ApiResource pour le reste, c'est plus simple.
- Doute structurel : arrête et demande à Kévin.

*Fin PROMPT_CLAUDE_CODE_ADMIN_CLIENTS_MEDIAS_USERS.md*
