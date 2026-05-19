# PR6 + PR9 (B2B) — Pipeline demandes entreprises + branchement formulaire public

> **À coller dans Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** : `CLAUDE.md`, `docs/GOTCHAS.md`, `docs/PLAN_BACKOFFICE.md` §PR6, `docs/API_CONTRACT.md`. On groupe PR6 (admin Kanban B2B) + le branchement de la page `/entreprises` qui était PR9 du backlog initial — ça n'a pas de sens de livrer l'admin sans la source.

## Contexte

La page publique `/entreprises` affiche aujourd'hui un formulaire **non branché** (cf. `apps/web/src/app/(public)/entreprises/page.tsx`). On la branche à un nouvel endpoint `POST /api/entreprises/devis` qui crée une `B2BRequest` côté admin avec stage `nouveau`. Cycle de vie inspiré du mockup : `nouveau → qualifie → devis_envoye → negociation → gagne | perdu`.

**Source design admin** : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/b2b.jsx` + `data.jsx` (`B2B_STAGES`, `B2B_TYPES`, `B2B_REQUESTS`) à lire.

**Réutilise les patterns posés** : DTO + ProcessorInterface (PR10), gotcha #6 uriTemplate (PR fixes), `makeEntityHooks<T>` + proxy admin (PR4), `@dnd-kit` (PR5), machine d'état centralisée dans l'enum (PR5).

## Scope strict

### Côté Symfony (`apps/api/`)

1. **Entité `B2BRequest`** + enum `B2BStage` (PHP 8.1 backed) + enum `B2BType` (`seminaire`, `team_building`, `soiree`, `arbre_noel`, `autre`).
   - Champs : `id`, `reference` (`FGC-B2B-XXXXXX`), `stage` (défaut `nouveau`), `type`, `companyName`, `contactFirstName`, `contactLastName`, `contactEmail`, `contactPhone`, `eventDate` (nullable, `>=today+14j` quand renseignée), `expectedAttendees` (int 10-300), `message` (text 0-2000), `estimatedValueCents` (int nullable, posé manuellement par l'admin après qualification), `adminNote` (text 2000 nullable), `acceptRgpd` (bool true à la création), 4 stamps internes (`internalQualifiedAt`, `internalQuotedAt`, `internalNegotiatedAt`, `internalClosedAt`), `createdAt`, `updatedAt`.
   - Index `(stage, createdAt)`.

2. **DTO public `B2BDevisRequestInput`** + **Processor `B2BDevisRequestProcessor`** :
   - DTO porte les `Assert\*` (NotBlank/Email/Length/Choice sur type/acceptRgpd=true).
   - Processor : génère `reference`, persist (stage `nouveau`), envoi mail best-effort (pareil que tunnel anniv : 2 templates Twig, échec n'annule pas la création).

3. **Endpoint public `POST /api/entreprises/devis`** via ApiResource (uriTemplate explicite, rate limit 3/min/IP). Retour 201 avec `reference` + `stage`. **Pas de detection de conflit** (B2B = pas de slot fixe, juste une date souhaitée).

4. **Endpoints admin** (réplique exact du pattern PR5 `DemandeReservation`) :
   - `GET /api/admin/b2b-requests` (SearchFilter, DateFilter, OrderFilter, 25/page).
   - `GET /api/admin/b2b-requests/{id}` (requirements `id=\d+`).
   - `PATCH /api/admin/b2b-requests/{id}` via `merge-patch+json` (gotcha #6 PATCH) — accepte `stage`, `estimatedValueCents`, `adminNote`. Machine d'état dans l'enum (`allowedNextStates`/`canTransitionTo`) appliquée par `AdminB2BRequestProcessor` qui wrap `PersistProcessor`. Stamp auto sur transition.
   - `GET /api/admin/b2b-requests/stats` : `{ byStage: {…counts…}, openCount, openValueCents, wonValueCentsThisQuarter, conversionRate, avgResponseTimeMinutes }`.

5. **Machine d'état** :
   ```
   nouveau       → qualifie | perdu
   qualifie      → devis_envoye | perdu
   devis_envoye  → negociation | gagne | perdu
   negociation   → gagne | perdu
   gagne         → (terminal)
   perdu         → (terminal)
   ```

6. **Mails Twig** (réutiliser le `BirthdayReservationMailer` comme modèle, dupliquer en `B2BDevisMailer`) :
   - `templates/emails/b2b_devis_admin.html.twig` : récap + lien `/admin/b2b` (placeholder).
   - `templates/emails/b2b_devis_client.html.twig` : "Demande reçue, on vous recontacte sous 48h ouvrées".

7. **Fixtures dev** `B2BRequestFixtures` : 6 demandes (1 par stage) pour visualiser le Kanban dès le premier login admin.

8. **Tests** : `tests/Api/Entity/B2BRequestPublicTest.php` (201 nominal, 422 acceptRgpd=false, 422 eventDate <14j, 422 type invalide) + `tests/Api/Entity/B2BRequestAdminTest.php` (transitions valides 200 + stamp, transitions interdites 422, filtre stage, /stats).

### Côté Next.js (`apps/web/`)

9. **Brancher le formulaire `/entreprises`** :
   - Refacto la section formulaire de `page.tsx` en client component `<DevisB2BForm>`.
   - Validation Zod (même règles que le DTO Symfony). RHF + zodResolver, états loading/success/error.
   - Submit POST `/api/entreprises/devis` (helper `apiFetch` existant — ne pas créer de nouveau). Sur 201 → écran de confirmation inline (référence affichée + "on vous recontacte sous 48h ouvrées"). Sur 4xx → toast + détails sous le champ concerné.
   - Garder la maquette visuelle telle quelle (page déjà migrée), juste rendre le form fonctionnel.

10. **Page `/admin/b2b`** (sidebar : nouvelle entrée "Demandes B2B" sous "Réservations B2C", icône `briefcase`) :
    - Page RSC mince → `B2BClient`.
    - Header : 4 KPI cards comme le mockup (Demandes ouvertes, Pipeline €, Taux transfo, Délai moyen de réponse — calculs côté `/stats`).
    - Toolbar : `Seg` filtre type (Tous / Séminaire / Team building / Soirée / Arbre Noël / Autre).
    - **Kanban uniquement** (pas de Tableau cette fois — c'est l'usage principal). 6 colonnes, dnd-kit, validation machine d'état côté front + serveur source de vérité. En haut de chaque colonne : count + somme `estimatedValueCents` formatée.
    - Drawer détail : récap demande (entreprise, contact, type, date, persons, message), champ `estimatedValueCents` éditable (autosave debounce 800ms), note interne autosave, timeline stamps, footer = bouton "Envoyer le devis" (V1 : `mailto:` pré-rempli avec récap ; vrai workflow PDF en V2) + select stage.

11. **Badge sidebar** : count `nouveau` (équivalent PR5) sur "Demandes B2B".

12. **Dashboard KPI** : rajouter une 5ᵉ tuile "Pipeline B2B" alimentée par `openValueCents` de `/stats`. Si le grid passe mal, accepter d'élargir à 5 colonnes desktop.

### À NE PAS faire (V2)

- Génération PDF du devis (V2, dépend du process commercial réel).
- Workflow d'envoi automatique du devis (V2).
- Vue Tableau / Calendrier (Kanban couvre 95% de l'usage commercial).
- Export CSV (V2 si compta demande).
- Création manuelle depuis l'admin (V1 : tout vient du form public ; cas téléphone = créer une demande dans l'admin = V2).
- Module "Clients" en CRM agrégeant les contacts récurrents (= PR7).
- Suivi des relances automatiques / cadences (V2).

## Contraintes

- Tokens DS admin (`admin-amber/blue/brand/pink/green/slate` pour les 6 stages — alignés sur le mockup).
- Format monétaire `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })` partout côté admin.
- Le PATCH admin doit accepter explicitement `Content-Type: application/merge-patch+json` (cf. apprentissage PR5).
- Le `QueryClient` admin reste au layout shell racine (acquis PR5).
- Aucun email réellement envoyé en `env=test` (transport `null://` doit déjà être configuré, sinon configure-le).
- Mailing en prod : pour l'instant les vraies adresses (admin + client) restent côté config — pas de blocage de la PR si le SMTP n'est pas branché, le test "log dans var/log/dev.log" suffit (le branchement Brevo viendra en V2).

## Auto-vérification

1. `make test-api` → tous tests verts (~90+ tests).
2. `npm run build` → 0 erreur TS, routes `/entreprises` et `/admin/b2b` présentes.
3. Curl public : `POST /api/entreprises/devis` payload nominal → 201 + `FGC-B2B-XXXXXX`. `acceptRgpd: false` → 422. `expectedAttendees: 5` → 422.
4. Navigateur : formulaire `/entreprises` rempli + soumis → écran de confirmation inline avec ref. Reload → form vide à nouveau (pas de persistance front).
5. Admin connecté : `/admin/b2b` montre Kanban 6 colonnes + 6 fixtures + 4 KPI cohérents. Drag d'une carte `qualifie` → `gagne` n'importe (toast rouge, machine d'état). Drag `qualifie` → `devis_envoye` OK + stamp + KPI Pipeline ajusté si valeur posée.
6. Badge sidebar : 1 fixture en `nouveau` → pastille `1` visible.
7. Dashboard : tuile "Pipeline B2B" affiche somme attendue (somme `estimatedValueCents` des stages ouverts).
8. `docs/CHANGELOG.md` + `docs/API_CONTRACT.md` (nouveaux endpoints documentés) + `docs/PLAN_BACKOFFICE.md` §PR6 marquée livrée + `docs/GOTCHAS.md` enrichi si nouveau piège.

## Si bloqué

- Différence de naming `B2B_STAGES` mockup (`devis-envoye` avec tiret) vs PHP enum (`devis_envoye` snake_case) : utilise snake_case côté PHP, expose en kebab-case dans le JSON public si tu veux rester fidèle au mockup. Cohérence avec PR5 = snake_case partout, plus simple.
- Le formulaire `/entreprises` actuel a des libellés "Type d'événement" qui ne matchent pas exactement les 5 valeurs enum : harmonise les deux (front + enum + fixture).
- Doute structurel : arrête et demande à Kévin.

*Fin PROMPT_CLAUDE_CODE_ADMIN_B2B.md*
