# Fa9asa - Smart Egg Incubator Dashboard

Application de monitoring pour incubateur d'œufs connecté. Construite avec **Next.js 16**, **React 19**, **Prisma ORM**, **PostgreSQL**, et **Tailwind CSS v4**.

---

## Table des matières

- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [API Routes](#api-routes)
- [Frontend & Composants](#frontend--composants)
- [Hooks & Utilitaires](#hooks--utilitaires)
- [ESP32 (Firmware)](#esp32-firmware)

---

## Structure du projet

```
fa9asa/
├── prisma/                   # Schéma BDD & migrations
├── ESP32_Example/            # Code Arduino pour l'ESP32
├── src/
│   ├── app/
│   │   ├── api/              # Routes API (dashboard, sensor, sessions, settings, seed)
│   │   ├── page.tsx          # Page d'accueil (Dashboard)
│   │   ├── layout.tsx        # Layout racine (fonts, ThemeProvider)
│   │   └── globals.css       # Styles Tailwind + variables CSS
│   ├── components/
│   │   ├── dashboard/        # Composants métier du dashboard
│   │   ├── ui/               # Composants UI génériques (shadcn/ui)
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/                # Custom hooks (usePolling)
│   └── lib/                  # Prisma singleton, constantes, utilitaires
├── .env                      # Connexion PostgreSQL
├── prisma.config.ts          # Configuration Prisma CLI
└── components.json           # Configuration shadcn/ui
```

---

## Base de données

4 tables PostgreSQL gérées via **Prisma ORM** (fichier : `prisma/schema.prisma`).

### Diagramme des relations

```
Incubator ──── SensorLog (1 → plusieurs)
    │               - température, humidité, heaterOn, fanOn
    │
    ├─── IncubationSession (1 → plusieurs)
    │               - start/end dates, isActive
    │
    └─── Setting (1 → plusieurs)
                    - key/value (ex: targetTemperature, targetHumidity)
```

### Tables

#### `incubators`

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| name | String | Nom (défaut : "Incubator 1") |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Dernière modification |

#### `sensor_logs`

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| incubatorId | UUID (FK → incubators) | Incubateur parent |
| temperature | Float | Température en °C |
| humidity | Float | Humidité en % |
| heaterOn | Boolean | Chauffage actif |
| fanOn | Boolean | Ventilateur actif |
| createdAt | DateTime | Horodatage (indexé) |

#### `incubation_sessions`

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| incubatorId | UUID (FK → incubators) | Incubateur parent |
| name | String? | Nom de la session (optionnel) |
| startedAt | DateTime | Début de l'incubation |
| endedAt | DateTime? | Fin (null si encore active) |
| isActive | Boolean | Session en cours (indexé) |

#### `settings`

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| incubatorId | UUID (FK → incubators) | Incubateur parent |
| key | String | Nom du paramètre |
| value | String | Valeur du paramètre |

- Contrainte unique sur `(incubatorId, key)`
- Toutes les FK ont `onDelete: Cascade`

---

## API Routes

Toutes les routes sont sous `src/app/api/` et utilisent les **App Router Route Handlers** de Next.js.

### `GET /api/dashboard`

Retourne les données complètes du tableau de bord :

```json
{
  "incubator": { ... },
  "current": { "temperature": 37.5, "humidity": 55, "heaterOn": true, "fanOn": false },
  "session": { "startedAt": "...", "currentDay": 5, "remainingDays": 16, "progressPercent": 23.8 },
  "sensorLogs": [ ...100 derniers logs... ],
  "settings": { "targetTemperature": "37.5", "targetHumidity": "55", "incubationDays": "21" }
}
```

### `POST /api/sensor`

Reçoit les données de l'ESP32 :

- Body : `{ temperature, humidity, heaterOn?, fanOn?, incubatorId? }`
- Crée un `SensorLog` et retourne `201 { success, id }`

### `GET/POST /api/sessions`

- **GET** : Les 50 dernières sessions (triées par `startedAt` desc)
- **POST** : Clôture la session active + crée une nouvelle session. Body : `{ name? }`

### `GET/POST /api/settings`

- **GET** : Tous les settings en `Record<string, string>`
- **POST** : Crée ou met à jour un setting. Body : `{ key, value }`. Crée un incubateur si aucun n'existe.

### `POST /api/seed`

Initialisation unique (idempotente) :

- Crée un incubateur "Main Incubator"
- Crée 3 settings par défaut : `targetTemperature=37.5`, `targetHumidity=55`, `incubationDays=21`
- Crée une session active "First Batch"

---

## Frontend & Composants

### Page principale (`/`)

**Fichier :** `src/app/page.tsx` — Client Component

États gérés :
- **Loading** : Icône d'œuf qui pulse
- **Needs seed** : Écran de bienvenue avec bouton "Initialize Incubator"
- **Error** : Message d'erreur avec bouton Retry
- **Dashboard** : Interface complète

Le dashboard affiche :
1. 4 **StatusCards** (Température, Humidité, Chauffage, Ventilateur)
2. **Graphique** Température/Humidité (Recharts LineChart)
3. **Barre de progression** d'incubation (jour actuel / total)
4. **Tableau** des dernières lectures

Données rafraîchies toutes les **5 secondes** via `usePolling`.

### Composants Dashboard (`src/components/dashboard/`)

| Composant | Rôle |
|-----------|------|
| `StatusCard` | Carte métrique avec valeur, unité, icône et statut coloré |
| `TempHumidityChart` | Graphique Recharts à double axe Y (temp rouge, humi bleue) |
| `IncubatorProgress` | Barre de progression avec dates de début/fin estimée |
| `LatestLogs` | Tableau des 15 dernières lectures avec badges |

### Composants UI (`src/components/ui/`)

Composants basés sur **shadcn/ui** (style Base-Nova avec `@base-ui/react`).

| Composant | Variantes |
|-----------|-----------|
| `Button` | default / outline / secondary / ghost / destructive / link + tailles xs à lg |
| `Card` | Card + Header / Title / Description / Content / Footer / Action |
| `Badge` | default / secondary / destructive / outline / ghost / link |
| `Separator` | horizontal / vertical |

### Theme

- `ThemeProvider` : wrapper `next-themes` (attribut `class`, défaut `system`)
- `ThemeToggle` : bouton Light/Dark avec icônes Sun/Moon

---

## Hooks & Utilitaires

### `usePolling(callback, intervalMs, enabled)`

`src/hooks/use-polling.ts`

Appelle `callback` immédiatement, puis toutes les `intervalMs` ms. S'arrête si `enabled = false`.

### `cn(...inputs)`

`src/lib/utils.ts` — Fusionne les classes Tailwind via `clsx` + `tailwind-merge`.

### `formatDateTime(date)`

Formate une date en `MMM DD, HH:MM:SS` (ex: `May 28, 21:36:31`).

### `prisma` (singleton)

`src/lib/prisma.ts` — Instance unique PrismaClient avec adaptateur Neon, évite les duplications en hot-reload.

### Constantes (`src/lib/constants.ts`)

| Constante | Valeur |
|-----------|--------|
| `INCUBATION_DAYS` | 21 |
| `DEFAULT_TEMPERATURE_C` | 37.5 |
| `DEFAULT_HUMIDITY_PCT` | 55 |
| `POLLING_INTERVAL_MS` | 5000 |

---

## ESP32 (Firmware)

Fichier : `ESP32_Example/ESP32_Example.ino`

Envoie les données des capteurs au serveur toutes les 10 secondes :

```cpp
POST /api/sensor
Content-Type: application/json
{
  "temperature": 37.5,
  "humidity": 55.0,
  "heaterOn": true,
  "fanOn": false
}
```

Fonctions à remplacer selon le hardware :
- `readTemperature()` → DHT22 / DS18B20 / BME280
- `readHumidity()` → DHT22 / BME280
- `getHeaterStatus()` → lecture pin relais
- `getFanStatus()` → lecture pin relais

---

## Commandes utiles

```bash
npm run dev              # Lancer le serveur de dev
npm run build            # Build production
npm run db:migrate       # Créer/appliquer une migration Prisma
npm run db:push          # Push le schéma sans migration
npm run db:generate      # Générer le client Prisma
npm run db:studio        # Ouvrir Prisma Studio
npm run db:seed          # Initialiser la BDD (appelle /api/seed)
npm run lint             # Linter ESLint
```
