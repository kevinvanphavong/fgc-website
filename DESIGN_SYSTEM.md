# DESIGN SYSTEM — Family Games Center · Site 2026/2027

> **Source de vérité** pour toute l'UI du site. Extrait fidèlement de la maquette Claude Design (`family-games-center-website-2026-2027/project/styles.css` + `tunnel.css`). Toute valeur (couleur, typo, spacing, radius, shadow) est citée telle quelle, **rien n'est inventé**.
>
> **Pour Claude Code** : lire ce fichier intégralement avant la moindre ligne de code UI. Toute déviation des tokens ci-dessous doit être justifiée et signalée à Kévin.
>
> **Périmètre** : ce DS s'applique au **frontend Next.js (`apps/web/`)**. Le backend Symfony (`apps/api/`) n'a pas d'UI sauf Swagger UI (généré par API Platform — laisser le thème par défaut). Tous les fichiers cités (`styles.css`, `tailwind.config.ts`, `tokens.css`, etc.) sont dans `apps/web/`.

---

## 0. Identité visuelle en une phrase

Site nocturne, vibrant, "Pixar/Disney 3D" — fond violet profond + néons magenta/cyan/jaune, typographie display chunky (`Lilita One`), badges 3D extrudés à ombre dure jaune, cartes en dégradé violet bordées d'un liseré or. Ambiance feux d'artifice / arcade premium, jamais flat ni minimaliste.

---

## 1. Tokens — Couleurs

### 1.1 Palette de base (CSS custom properties — extraites de `styles.css`)

| Token              | Hex        | Rôle                                             |
| ------------------ | ---------- | ------------------------------------------------ |
| `--bg-deep`        | `#160a3a`  | Fond global (body)                               |
| `--bg-deeper`      | `#0a0420`  | Fond plus sombre (header, vignette ambient)      |
| `--purple`         | `#2a1458`  | Violet profond — fond bandeau, badges secondary  |
| `--purple-light`   | `#3d1b6b`  | Violet — typo sur badges jaunes, fond cards      |
| `--purple-bright`  | `#5e2db8`  | Violet vif — gradient haut des CTA violets       |
| `--yellow`         | `#ffd93d`  | Jaune doré — CTA primaires, accents, prix off    |
| `--yellow-dark`    | `#e8a92c`  | Jaune foncé — gradient bas du jaune              |
| `--yellow-deep`    | `#f5c518`  | Jaune profond — variations badges                |
| `--pink`           | `#e91e63`  | Rose vif — accent secondaire                     |
| `--pink-hot`       | `#ff2d87`  | Rose néon — gradient haut du rose, pulse, prix   |
| `--cream`          | `#fff4e0`  | Texte body sur fond sombre, badges crème         |
| `--cream-warm`     | `#f8edd8`  | Crème chaud — fond badge sous-titre              |
| `--cyan`           | `#00e5ff`  | Cyan néon — accents, confettis                   |
| `--magenta`        | `#ff00c8`  | Magenta néon — glow, confettis                   |

### 1.2 Couleurs dérivées (utilisées en dur dans styles.css — à conserver)

| Usage                                 | Valeur                                          |
| ------------------------------------- | ----------------------------------------------- |
| Ombre dure jaune (sous boutons jaune) | `#b88200`                                       |
| Ombre dure rose                       | `#8e0d3d`                                       |
| Ombre dure jaune profonde (title-badge) | `#6f3d00`                                     |
| Bordure subtile jaune                 | `rgba(255, 217, 61, 0.15)` à `0.20`             |
| Surface card translucide              | `rgba(255, 255, 255, 0.04)` à `0.08`            |
| Bordure card translucide              | `rgba(255, 255, 255, 0.08)` à `0.12`            |
| Glow magenta (hover card)             | `rgba(255, 0, 200, 0.25)` à `0.40`              |

### 1.3 Règle de composition (extraite du STYLE_GUIDE.md d'origine)

- **70%** violet / bleu nuit (fond + ambiance)
- **20%** jaune doré + crème (badges, titres, CTA primaires)
- **10%** magenta + cyan (accents, prix, néons, pulses)

**Ne jamais** : utiliser un fond clair plein, un dégradé pastel, du blanc pur (`#fff`) sur de grandes surfaces.

---

## 2. Tokens — Typographie

### 2.1 Familles

| Famille             | Usage                                          | Import                                                                                       |
| ------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Lilita One`        | Headings (h1–h4), boutons, badges, navigation  | Google Fonts                                                                                 |
| `Bowlby One`        | Fallback de `Lilita One`                       | Google Fonts                                                                                 |
| `Fredoka`           | Body, paragraphes, labels, formulaires         | Google Fonts (weights `400;500;600;700`)                                                     |
| `Inter` / system-ui | Fallback de `Fredoka`                          | natif                                                                                        |

**Import HTML (à mettre dans `<head>`)** :
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 2.2 Règles de display

Tous les headings sont **MAJUSCULES**, `letter-spacing: 0.5px`, `line-height: 1.05`, `font-weight: 400` (Lilita est déjà gras de nature, ne pas surcharger).

```css
.font-display, h1, h2, h3, h4 {
  font-family: 'Lilita One', 'Bowlby One', sans-serif;
  font-weight: 400;
  letter-spacing: 0.5px;
  line-height: 1.05;
  text-transform: uppercase;
}
```

### 2.3 Échelle responsive (fluid avec `clamp()`)

| Élément                | Taille                                  |
| ---------------------- | --------------------------------------- |
| `h1` (par défaut)      | `clamp(2.4rem, 5.5vw, 4.4rem)`          |
| `.hero-title`          | `clamp(3rem, 6.5vw, 5.6rem)`            |
| `h2`                   | `clamp(1.9rem, 3.6vw, 3rem)`            |
| `.section-title`       | `clamp(2.2rem, 4.4vw, 3.6rem)`          |
| `h3`                   | `clamp(1.3rem, 2vw, 1.7rem)`            |
| `.rsv-step-title`      | `clamp(2rem, 4vw, 3.2rem)`              |
| Body                   | `1rem` (16px), `line-height: 1.6`       |
| Section lead           | `1.05rem`, `opacity: 0.85`              |
| Section eyebrow        | `0.9rem`, letter-spacing `3px`, pink-hot|
| Hero eyebrow           | `0.85rem`, letter-spacing `1px`         |

### 2.4 Pattern "accent" dans les titres

Couleur jaune sur un sous-segment du titre — usage très fréquent :
```html
<h2 class="section-title">7 expériences, <span class="accent">1 seul endroit.</span></h2>
```
```css
.section-title .accent { color: var(--yellow); }
.hero-title .pop { color: var(--yellow); text-shadow: 0 4px 0 rgba(255, 0, 200, 0.4); }
```

---

## 3. Tokens — Spacing, Radius, Shadow

### 3.1 Radius

| Token       | Valeur     | Usage                                       |
| ----------- | ---------- | ------------------------------------------- |
| `--r-sm`    | `12px`     | Boutons icon, petits chips                  |
| `--r-md`    | `22px`     | (slot réservé, peu utilisé)                 |
| `--r-lg`    | `36px`     | Cards (activity, price), form-card          |
| `--r-pill`  | `999px`    | Boutons, badges-pill, badge-cta, nav links  |

Variantes courantes hors tokens : `18px` (dropdown menu, day-card, hero-float-badge, feature-list item, field), `24px` (offer-card), `28px` (rsv-card), `32px` (hero-visual, page-hero-visual), `40px` (title-badge), `14px` (field input).

### 3.2 Shadows

| Token              | Valeur                                                              | Usage                                  |
| ------------------ | ------------------------------------------------------------------- | -------------------------------------- |
| `--shadow-soft`    | `0 18px 50px -18px rgba(0, 0, 0, 0.6)`                              | Cards, dropdown, hero-float-badge      |
| `--shadow-glow`    | `0 0 60px rgba(255, 0, 200, 0.25)`                                  | Hover lift cards, premium feel         |
| `--shadow-yellow`  | `0 8px 0 #b88200, 0 22px 40px -10px rgba(0, 0, 0, 0.55)`            | Bouton jaune (effet "3D extrudé")      |

**Pattern signature "bouton 3D"** : double shadow → 1) couleur plate décalée (effet relief) + 2) ombre douce diffuse. Reproduire fidèlement pour btn-primary, btn-pink, logo-mark, day-card.today.

### 3.3 Container et grid

| Élément        | Valeur                                |
| -------------- | ------------------------------------- |
| `.wrap`        | `max-width: 1240px`, padding `0 24px` |
| Section pad    | `90px 0` (60px en mobile <720px)      |
| Hero pad       | `70px 0 100px` (40px 0 60px mobile)   |
| Grid gap cards | `22px` (activities, pricing), `20px` (offers) |
| Form gap       | `18px` entre rows                     |

### 3.4 Breakpoints

| Breakpoint     | Comportement                                                            |
| -------------- | ----------------------------------------------------------------------- |
| `≤ 980px`      | Grids 3-cols → 2-cols, hero-grid → 1-col, footer-grid → 2-cols          |
| `≤ 720px`      | Nav burger, toutes grids → 1-col, schedule → 2-cols, sections 60px      |

---

## 4. Composants — Boutons

### 4.1 `.btn` (base)

```css
display: inline-flex; align-items: center; gap: 10px;
padding: 14px 26px;
font-family: 'Lilita One', sans-serif; font-size: 1rem; text-transform: uppercase;
border-radius: var(--r-pill);
cursor: pointer; border: 0; line-height: 1;
transition: transform 0.15s, box-shadow 0.15s;
```

Hover → `transform: translateY(-2px)`. Active → `translateY(1px)`.

### 4.2 Variantes

| Classe         | Fond                                                          | Texte             | Bordure                | Shadow                                                          |
| -------------- | ------------------------------------------------------------- | ----------------- | ---------------------- | --------------------------------------------------------------- |
| `.btn-primary` | `linear-gradient(180deg, var(--yellow), var(--yellow-dark))`  | `--purple-light`  | `2px solid #b88200`    | `0 6px 0 #b88200, 0 14px 30px -8px rgba(255,217,61,.4)`         |
| `.btn-ghost`   | `rgba(255, 244, 224, 0.08)`                                   | `--cream`         | `2px solid rgba(255,244,224,.3)` | none                                                       |
| `.btn-pink`    | `linear-gradient(180deg, var(--pink-hot), var(--pink))`       | `white`           | `2px solid #8e0d3d`    | `0 6px 0 #8e0d3d, 0 14px 30px -8px rgba(255,45,135,.4)`         |

`.btn:disabled` → `opacity: 0.45; cursor: not-allowed; pointer-events: none`.

### 4.3 Anti-patterns boutons

- ❌ Ne **jamais** utiliser de bouton plat (sans shadow décalée) pour un CTA primaire.
- ❌ Pas de bouton avec dégradé violet en CTA principal (le violet est le fond, pas l'action).
- ❌ Pas de `border-radius` < `--r-pill` sur les `.btn`.

---

## 5. Composants — Badges

### 5.1 `.badge-pill` (sous-titre, info)

Fond `--cream-warm`, texte `--purple-light` MAJUSCULES, padding `8px 16px`, border `1px solid var(--yellow-dark)`, radius pill. Séparateurs entre items : un dot `.dot` couleur `--pink`.

### 5.2 `.badge-cta` (accroche bas de carte)

Fond gradient violet `--purple-bright → --purple-light`, texte `--yellow`, encadré par 2 ornements `≈{ ... }≈` (pseudo-éléments avec radial-gradient jaune, ~14×14px). Conserver fidèlement le `::before / ::after` du CSS source.

### 5.3 `.title-badge` (titre 3D extrudé style affiche)

Le pattern signature des affiches FGC, repris dans les sections "trophée" :
```css
padding: 18px 38px;
background: linear-gradient(180deg, var(--yellow), var(--yellow-dark));
color: var(--purple-light);
border: 3px solid var(--purple-light);
border-radius: 40px;
box-shadow: 0 10px 0 #6f3d00, 0 30px 60px -20px rgba(0,0,0,.6);
text-shadow: 0 2px 0 rgba(255,255,255,.4);
```

### 5.4 `.hero-eyebrow` (kicker "nouveauté")

Pill jaune translucide avec un pulse rose à gauche :
```css
background: rgba(255, 217, 61, 0.15);
border: 1px solid rgba(255, 217, 61, 0.4);
```
Pulse : `.pulse` 8×8px rose-hot avec animation `@keyframes pulse` 1.6s — shadow qui se diffuse puis disparaît.

---

## 6. Composants — Cartes

### 6.1 `.activity-card` (grille d'activités, 3×3 sur desktop)

```css
background: linear-gradient(180deg, rgba(61,27,107,.85) 0%, rgba(22,10,58,.95) 100%);
border: 1px solid rgba(255, 217, 61, 0.18);
border-radius: var(--r-lg);    /* 36px */
padding: 28px;
min-height: 320px;
```
- **Halo magenta** en haut à droite : pseudo-element `::before` 200×200px, `radial-gradient(circle, rgba(255,0,200,.4), transparent 70%)`, `opacity: .5`.
- **Hover** : `translateY(-6px)`, bordure passe à `rgba(255,217,61,.5)`, shadow glow magenta.
- **Icône activity** : 64×64, radius 18px, gradient jaune, ombre `0 6px 0 #b88200`, taille emoji ~1.8rem.
- **Link** : `→` qui translate-x au hover via `transform: translateX(4px)`.

### 6.2 `.price-card` (3 tarifs côte à côte)

Même fond gradient violet, bordure jaune `2px solid rgba(255,217,61,.2)`.
- Variante `.featured` : bordure pleine jaune + box-shadow glow jaune `0 30px 60px -20px rgba(255,217,61,.3)`.
- Badge "★ Le plus populaire" : `::before` positionné `top: -14px; left: 50%`, gradient rose-hot → rose, pill, font-size 0.75rem.
- Prix : `.price-value` Lilita 3.4rem, devise `.cur` 2rem rose-hot, période `.per` 1rem opacity 0.6.
- Features : `<ul>` avec check jaune via `::before { content: '✓'; color: var(--yellow); }`.

### 6.3 `.offer-card` (affiche promo, ratio 4/5)

Cards visuelles immersives, image full-bleed cover + overlay sombre en bas + caption pill.
```css
border-radius: 24px;
aspect-ratio: 4 / 5;
```
Overlay gradient bas via `::after`. Hover : `translateY(-6px) scale(1.02)`.

### 6.4 `.rsv-card` (cards tunnel réservation)

Variante des cards classiques avec `border-radius: 28px` et padding `30px`. Reprend le même gradient violet.

---

## 7. Composants — Header & Navigation

### 7.1 Header sticky

```css
position: sticky; top: 0; z-index: 100;
backdrop-filter: blur(14px) saturate(150%);
background: rgba(10, 4, 32, 0.78);
border-bottom: 1px solid rgba(255, 217, 61, 0.15);
```

### 7.2 `.brand` (logo wordmark)

Structure : un `logo-mark` carré 42×42 jaune avec ombre `0 4px 0 #b88200` + un `.logo-text` en 3 lignes :
- `.top` rose-hot, taille 0.85em
- `.mid` jaune, taille 1.1em, letter-spacing 1px (mot "GAMES")
- `.bot` crème, taille 0.65em, letter-spacing 2px (mot "CENTER")

Famille Lilita One, MAJUSCULES.

### 7.3 `.main-nav`

Liens : padding `10px 14px`, font Lilita 0.95rem, radius pill. Active : fond `rgba(255,217,61,.12)`, couleur jaune.

Dropdown : flèche `▾` automatique, menu en `position: absolute`, fond `rgba(15,5,40,.96)`, border jaune, radius 18px, padding 10px, gap 2px entre items.

Mobile (≤720px) : burger button affiché, menu en `position: absolute` `top: 100%` collé sous header avec backdrop-filter blur, dropdown en flex statique.

### 7.4 Nav items (référence — partials.js)

```
Activités (dropdown)
  ├─ 🎳 Bowling          → bowling.html
  ├─ 🎱 Billard          → billard.html
  ├─ 🕹️ Jeux d'arcade    → arcade.html
  ├─ 🥽 Réalité Virtuelle → realite-virtuelle.html
  ├─ 🎤 Karaoké          → karaoke.html
  ├─ 🎵 Blind Test       → blind-test.html
  └─ 🎯 Fléchettes       → flechettes.html
Tarifs                    → tarifs.html
Nos Formules              → formules.html
Bar & Snack               → bar-snack.html
Entreprises               → entreprises.html
Contact                   → contact.html
[CTA Réserver — btn-primary, target _blank vers bowling-de-blois.fr]
```

---

## 8. Composants — Sections types

### 8.1 Hero (landing)

Grid 2 colonnes `1.05fr 1fr`, gap 60px. Colonne gauche : eyebrow → h1 → sub → CTA double → grid de stats 4 colonnes. Colonne droite : `.hero-visual` (image aspect 4/5, border-radius 32px, shadow magenta + liseré or) + 2 `.hero-float-badge` flottants en TR et BL.

### 8.2 Hero secondaire `.page-hero`

Grid `1.2fr 1fr`, gap 50px. Breadcrumb minimaliste : `Accueil › Bowling`, séparateur opacity 0.5.

### 8.3 Section standard

```html
<section class="section">
  <div class="wrap">
    <span class="section-eyebrow">Nos activités</span>
    <h2 class="section-title">Titre <span class="accent">accent</span></h2>
    <p class="section-lead">Lead 640px max.</p>
    <!-- contenu -->
  </div>
</section>
```

Section-eyebrow : Lilita 0.9rem, letter-spacing 3px, couleur `--pink-hot`.

### 8.4 Info strip (bandeau fin promo)

Background `linear-gradient(90deg, #1a0f3d 0%, #2a1458 100%)`, border top/bottom or. 4 items horizontaux (`display: flex; justify-content: space-around`). Chaque `.info-item` : icône carrée 36×36 jaune fond + texte Lilita uppercase 0.95rem. Variante `.pink` pour le dernier (ic rose-hot, texte blanc).

Texte standard du strip (à reprendre tel quel sauf demande de Kévin) :
```
📅 Ouvert 7J/7  │  🥤 Snack & Bar  │  ☺ Ambiance & Fun garantis  │  🎉 Anniversaires · EVG/EVJF · Événements
```

### 8.5 Schedule (horaires)

Grid 7 colonnes (1 par jour), gap 8px. `.day-card` : padding `18px 12px`, radius 18px, fond translucide. Variante `.today` : gradient jaune plein, texte violet.

### 8.6 Footer

Background gradient `transparent → rgba(10,4,32,.6)`, border top jaune. Grid 4 colonnes `2fr 1fr 1fr 1fr`, gap 50px. Première col : brand + tagline + socials. Autres : `<h4>` jaune + liste de links.

Socials : carrés 38×38, radius 12px, fond translucide, hover fond rose. SVG inline 18×18.

Footer-bottom : dashed top, font-size 0.85rem, opacity 0.65.

### 8.7 Background ambient (fixed)

`.bg-ambient` : `position: fixed; inset: 0; z-index: 0; pointer-events: none`. Quatre `radial-gradient` superposés (rose, cyan, jaune, fade violet) + 2 pseudo-elements remplis de pastilles `radial-gradient(2px 2px ...)` pour simuler les étoiles. **À inclure une seule fois en début de `<body>`**.

---

## 9. Composants — Formulaires

### 9.1 `.form-card`

Wrapper de formulaire : même gradient violet que les cards, border or, radius 36px, padding 40px.

### 9.2 `.field`

```css
display: flex; flex-direction: column; gap: 6px;
```
- **Label** : Lilita uppercase 0.78rem jaune, letter-spacing 1px.
- **Input / select / textarea** :
  ```css
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  color: var(--cream);
  font-family: inherit; /* Fredoka */
  font-size: 0.95rem;
  ```
- **Focus** : `outline: 0; border-color: var(--yellow)`.
- **Textarea** : `min-height: 130px; resize: vertical`.

### 9.3 Form-row

Grid 2 colonnes, gap 18px. Mobile : 1 colonne.

---

## 10. Tunnel de réservation (référence `tunnel.css`)

### 10.1 Stepper sticky

- Sticky `top: 70px` (sous le header), z-index 50, même backdrop-filter blur que header.
- Steps : dot 30×30, états `pending` (gris) / `done` (gradient jaune + ombre dure) / `active` (gradient rose-hot + glow).
- Bars entre dots : `2px`, fond gris translucide, version `done` en gradient jaune.

### 10.2 Animations de transition entre steps

```css
@keyframes rsv-fwd { from {opacity:0; transform:translateX(28px)} to {opacity:1; transform:translateX(0)} }
@keyframes rsv-back { from {opacity:0; transform:translateX(-28px)} to {opacity:1; transform:translateX(0)} }
```
Durée `0.34s`, easing `cubic-bezier(.2,.7,.2,1.2)` (légèrement bouncy).

### 10.3 Trust items (hero du tunnel)

Pills `rgba(255,255,255,.05)` + border or, padding `10px 20px`, radius 18px. Premier span : Lilita jaune 1rem ; second : 0.78rem opacity 0.7.

---

## 11. Animations & Micro-interactions

| Élément          | Animation                                                    |
| ---------------- | ------------------------------------------------------------ |
| `.btn` hover     | `transform: translateY(-2px)` + augmentation de la shadow    |
| `.btn` active    | `translateY(1px)`                                            |
| `.activity-card` hover | `translateY(-6px)` + border or + glow magenta          |
| `.offer-card` hover | `translateY(-6px) scale(1.02)`                            |
| `.hero-eyebrow .pulse` | `@keyframes pulse` 1.6s infinite (rose-hot rayonne)   |
| `.rsv-anim-fwd/back` | Slide horizontal 28px + fade, 0.34s                      |
| `.activity-link::after` | `→` translate-x 4px au hover du parent                |

**Durée standard** : `0.2s` (hover micro), `0.34s` (transition step), `1.6s` (pulse).

---

## 12. Pages — liste & contenus types

À implémenter, dans l'ordre de priorité validé avec Kévin :

| Slug                    | Rôle                                  | Patterns clés                                  |
| ----------------------- | ------------------------------------- | ---------------------------------------------- |
| `/`                     | Home — vitrine + hero + bons plans    | Hero, activities x9, offers x4, schedule, footer-strip |
| `/bowling`              | Page activité                         | `page-hero`, feature-list, gallery offer-cards |
| `/billard`              | Page activité                         | idem                                           |
| `/arcade`               | Page activité                         | idem                                           |
| `/realite-virtuelle`    | Page activité                         | idem                                           |
| `/karaoke`              | Page activité                         | idem                                           |
| `/blind-test`           | Page activité                         | idem                                           |
| `/flechettes`           | Page activité                         | idem                                           |
| `/bar-snack`            | Carte bar + menu                      | `.menu-grid`, `.menu-item`                     |
| `/tarifs`               | Grille de prix                        | `.pricing-grid`, `.price-card.featured`        |
| `/formules`             | Anniversaires, EVG, séminaires, etc.  | offer-cards, accordions, CTA réserver          |
| `/entreprises`          | Page B2B                              | hero + form-card de contact entreprise         |
| `/contact`              | Coordonnées + form                    | form-card, infos pratiques                     |
| `/reserver-anniversaire`| Tunnel React 3 étapes                 | rsv-stepper, rsv-card, rsv-formules, rsv-anim  |
| `/connexion`            | Login client                          | form-card centré, link inscription             |
| `/inscription`          | Création compte                       | form-card multi-section                        |
| `/compte`               | Espace client                         | sidebar + sections (referencement `compte/`)   |

---

## 13. Assets — affiches & images

Les visuels promo se trouvent dans `public/assets/` (à copier depuis la maquette `family-games-center-website-2026-2027/project/assets/`). Conventions de nommage :
- `affiche-{theme}.png` — visuel promo principal (4:5)
- `affiche-{theme}-hero.png` — variante hero
- `fgc-logo.png` — logo officiel (déjà dans le dossier FGC parent de Kévin)

Liste actuelle disponible :
`affiche-anniversaire-hero, affiche-anniversaires, affiche-afterwork, affiche-bowling-afterwork, affiche-bowling-volonte, affiche-carte-membre, affiche-cocktails, affiche-cocktails-snacks, affiche-flechettes, affiche-karaoke, affiche-smoothies, affiche-snacks-smoothies, affiche-snacks-sucres, affiche-trio-jeux`.

**Règle** : toute nouvelle affiche doit suivre `STYLE_GUIDE.md` (Pixar 3D, palette violet/jaune/rose) — voir le prompt-type généré par Kévin (mémoire `prompt_pub_fgc.md`).

---

## 14. Accessibilité (WCAG 2.1 AA — exigences minimales)

- Contraste **crème sur violet** : `#fff4e0` sur `#160a3a` → ratio ~14.5:1 ✅
- Contraste **violet sur jaune** (boutons) : `#3d1b6b` sur `#ffd93d` → ratio ~7.8:1 ✅
- Contraste **jaune sur violet** (accents titres) : `#ffd93d` sur `#160a3a` → ratio ~10.4:1 ✅
- Contraste **rose-hot sur violet** (eyebrow) : `#ff2d87` sur `#160a3a` → ratio ~5.1:1 ✅
- ⚠️ **À surveiller** : opacity 0.65–0.7 sur du crème → vérifier au cas par cas qu'on reste ≥ 4.5:1.
- Tous les CTA doivent avoir un état `:focus-visible` distinct (à ajouter — la maquette ne le précise pas explicitement, c'est une dette à combler côté implémentation : `outline: 2px solid var(--cyan); outline-offset: 2px`).
- Tous les emojis décoratifs dans les icônes (🎳, 🎱, etc.) doivent être doublés d'un `aria-hidden="true"` ou cachés du screen reader.
- Le burger button mobile a déjà un `aria-label="Menu"` — garder le pattern.

---

## 15. À ne PAS faire (anti-patterns critiques)

1. ❌ Style flat / minimaliste / "Apple white" — c'est l'opposé de la vibe FGC.
2. ❌ Police "moderne fine" (Inter, Poppins) en headings — Lilita uniquement.
3. ❌ Boutons sans shadow décalée — perd le côté arcade / 3D.
4. ❌ Fond clair sur une grande surface.
5. ❌ Composants "shadcn par défaut" — il faut **adapter** (radius pill, gradient, ombre dure) avant d'utiliser un primitif Radix.
6. ❌ Animation hover qui change la couleur sans translate — toujours combiner couleur + mouvement.
7. ❌ Mélanger les radius arbitrairement — respecter les 4 tokens + les exceptions documentées (14, 18, 24, 28, 32, 40).
8. ❌ Reprendre le `STYLE_GUIDE.md` (= guide affiches IA) pour le site — c'est un document destiné à ChatGPT/Midjourney pour générer **des images promo**, pas le DS du site.

---

## 16. Mapping Tailwind (référence rapide)

Si tu utilises Tailwind (recommandé — config fournie dans `tailwind.config.ts`), voici la correspondance :

| Token CSS         | Classe Tailwind                                    |
| ----------------- | -------------------------------------------------- |
| `var(--bg-deep)`  | `bg-fgc-bg`                                        |
| `var(--purple-light)` | `bg-fgc-purple` / `text-fgc-purple`            |
| `var(--yellow)`   | `bg-fgc-yellow` / `text-fgc-yellow`                |
| `var(--pink-hot)` | `bg-fgc-pink` / `text-fgc-pink`                    |
| `var(--cream)`    | `text-fgc-cream`                                   |
| Famille display   | `font-display`                                     |
| Famille body      | `font-sans` (default)                              |
| `--r-pill`        | `rounded-full`                                     |
| Shadow yellow 3D  | `shadow-fgc-yellow`                                |

Toujours **préférer les tokens** plutôt que les valeurs hex en dur dans le JSX. Cela permet de switcher le thème (ex : version Noël, version Halloween) plus tard.

---

## 17. Source — fichiers de référence

Les **valeurs ci-dessus sont extraites textuellement** de :
- `family-games-center-website-2026-2027/project/styles.css` (1004 lignes — toutes les variables CSS et composants principaux)
- `family-games-center-website-2026-2027/project/reservation/tunnel.css` (1920 lignes — spécifique au tunnel)
- `family-games-center-website-2026-2027/project/partials.js` (header & footer partagés)
- `family-games-center-website-2026-2027/project/index.html` (composition du hero + sections home)

En cas de doute sur une valeur, **toujours** rouvrir le fichier source de la maquette plutôt que d'extrapoler.

---

*Fin DESIGN_SYSTEM.md — Family Games Center 2026/2027*
