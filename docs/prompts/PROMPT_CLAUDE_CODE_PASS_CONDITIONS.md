# Pass multi-activités — conditions d'utilisation (commit + push)

> Les modifs sont déjà écrites sur disque par Cowork. Tu vérifies, commits proprement et pushes.

## Contexte
Ajout des règles d'usage des Pass multi-activités (Chill, Confort, VIP, Multiverse) sur la page tarifs publique : lundi→vendredi uniquement, hors vacances scolaires zone B et fériés, achat sur place le jour J, cut-off 21h, plafond 200 pass/jour, piste de bowling selon dispo (renvoi vers formules Résa pour garantir une piste). Décisions actées avec le gérant — ne pas remettre en cause.

## Fichiers à lire avant de coder
- `apps/web/src/lib/formules.ts` — 3 nouvelles constantes exportées (`PASS_CONDITIONS_TAGLINE`, `PASS_CONDITIONS_DETAILS`, `PASS_CONDITIONS_FOOTER`)
- `apps/web/src/app/(public)/tarifs-et-formules/page.tsx` — import statique + tagline jaune dans le header section Pass + `<aside>` "Conditions d'utilisation" sous la grille des 4 cartes
- `apps/web/src/lib/content-api.ts` — pour comprendre pourquoi `formules.ts` reste utilisé comme fallback (les pass viennent du CMS mais les conditions sont en constantes front, c'est volontaire)

## Tâche
1. `git status` + `git diff` : confirme que seuls les 2 fichiers ci-dessus sont touchés. Si autre chose apparaît, stop et signale.
2. Relis le diff en hostile : cohérence visuelle (couleurs `fgc-yellow` / `fgc-card`), pas de typo, accessibilité de l'`<aside>` (aria-label présent), pas de régression sur les autres sections de la page tarifs.
3. Build local + lint (voir auto-vérification).
4. **Commit unique** atomique : `feat(tarifs): ajoute conditions d'utilisation des Pass multi-activités`
5. **Push autorisé** sur la branche courante (exception explicite : le gérant l'a demandé).

## Décisions actées (à ne PAS remettre en cause)
- Conditions en **constantes front** (`formules.ts`), pas dans le CMS Symfony. C'est volontaire : règles de gestion, pas du contenu éditorialisable. Si on veut les rendre éditables plus tard, ce sera un autre chantier (endpoint `/formules/pass-conditions`).
- Mention "piste selon disponibilité" + renvoi vers Silver/Gold/Platinium = arbitrage assumé pour éviter SAV "j'ai payé un pass mais pas eu ma piste".
- Tagline visible dans le header de section (pas en astérisque planqué) = exigence transparence client.

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de push tant qu'une case est rouge.

### Build & lint
```bash
cd apps/web
npm run lint
npm run build
```

### Tests fonctionnels
- [ ] Page `/tarifs-et-formules` build sans erreur ni warning bloquant.
- [ ] La section "Pass multi-activités" affiche le tagline jaune sous le slogan "Plus vous ajoutez, plus vous économisez."
- [ ] L'aside "Conditions d'utilisation" apparaît juste sous la grille des 4 pass, avec les 5 puces lisibles.
- [ ] Aucune régression visuelle sur les sections 1 (Activités), 2 (Hebdo), 4 (Résa groupe), 5 (Anniv).

### Critères d'acceptation
- [ ] Diff limité aux 2 fichiers attendus.
- [ ] Aucune règle absolue du `CLAUDE.md` enfreinte.
- [ ] `npm run lint && npm run build` passent verts.

### Auto-relecture du diff
`git diff main..HEAD` — relis en hostile : typo, scope creep, oubli d'import, console.log résiduel ?

**Si une case est NON → tu corriges et tu re-vérifies tout.**

## Livraison
1. 1 commit atomique avec le message ci-dessus.
2. `git push origin <branche courante>`.
3. Rapport au gérant : SHA du commit + lien GitHub du push + cases de vérif cochées.
4. Note de risque : aucune migration BDD, pas de breaking change côté API — déploiement front simple.
