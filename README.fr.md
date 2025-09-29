# OpenSky TypeScript Client 🛫

Un client TypeScript moderne et robuste pour l'API OpenSky Network avec gestion automatique des tokens OAuth2 et retry intelligent.

> [🇬🇧 English version](README.md)

## ✨ Fonctionnalités

- 🔐 **Authentification OAuth2** avec gestion automatique des tokens
- 🔄 **Retry automatique** sur expiration de token (401)
- 📝 **Types TypeScript** complets pour toutes les réponses API
- 🌍 **API complète** - Implémente tous les endpoints OpenSky
- 💾 **Cache de tokens** persistant sur disque
- 🚀 **Top-level await** avec gestion d'erreur centralisée

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/pierreraby/opensky-ts
cd opensky-ts

# Installer les dépendances
pnpm install

# Configurer les credentials
cp .env.example .env
# Éditer .env avec vos credentials OpenSky
```

## 🔑 Configuration

1. Créez un compte sur [OpenSky Network](https://opensky-network.org/)
2. Générez vos credentials API dans votre [compte OpenSky](https://opensky-network.org/my-opensky/account)
3. Configurez le fichier `.env` :

```bash
OPENSKY_CLIENT_ID=votre_client_id
OPENSKY_CLIENT_SECRET=votre_client_secret
```

## 🚀 Utilisation

### Exemple basique

```typescript
import { OpenSkyClient } from './opensky-api.js';

const client = new OpenSkyClient(
    process.env.OPENSKY_CLIENT_ID,
    process.env.OPENSKY_CLIENT_SECRET
);

// Récupérer les arrivées à un aéroport
const arrivals = await client.getArrivalsByAirport('EDDF', '1700000000', '1700086400');
console.log(`${arrivals.length} arrivées trouvées`);
```

### Exemple avec gestion d'erreur

```typescript
async function main() {
    const client = new OpenSkyClient(clientId, clientSecret);
    
    try {
        // Le client gère automatiquement les tokens et les retry
        const flights = await client.getFlightsInInterval(begin, end);
        console.log(`${flights.length} vols trouvés`);
    } catch (error) {
        console.error('Erreur API:', error.message);
    }
}

await main().catch(console.error);
```

## 📋 API Disponible

### States (États des avions)

```typescript
// Tous les états actuels avec filtres géographiques
const states = await client.getAllStates({
    lamin: 45.0, lamax: 55.0,  // Latitude
    lomin: -5.0, lomax: 15.0,  // Longitude
    extended: true
});

// États de vos propres récepteurs
const ownStates = await client.getOwnStates({
    serials: [123456, 789012]
});
```

### Flights (Vols)

```typescript
// Vols dans un intervalle de temps
const flights = await client.getFlightsInInterval(begin, end);

// Vols d'un avion spécifique
const aircraftFlights = await client.getFlightsByAircraft('3c675a', begin, end);

// Arrivées à un aéroport
const arrivals = await client.getArrivalsByAirport('EDDF', begin, end);

// Départs depuis un aéroport
const departures = await client.getDeparturesByAirport('KJFK', begin, end);
```

### Tracks (Trajectoires)

```typescript
// Trajectoire d'un avion
const track = await client.getTrackByAircraft('3c675a', timestamp);
```

## 🎯 Exemples d'utilisation

### Script simple - Arrivées Frankfurt

```bash
pnpm start
```

### Démonstration complète

```bash
node --env-file=.env dist/example.js
```

## 🏗️ Structure du projet

```
opensky-ts/
├── opensky-api.ts       # Client principal avec toutes les méthodes
├── main.ts             # Exemple simple (arrivées EDDF)
├── example.ts          # Démonstration complète de l'API
├── package.json        # Configuration du projet
└── tsconfig.json       # Configuration TypeScript
```

## 🔧 Scripts disponibles

```bash
# Développement avec watch
pnpm run dev

# Build production
pnpm run build

# Exécuter l'exemple principal
pnpm start

# Build + run en une commande
pnpm run prod
```

## 📊 Types TypeScript

Le client fournit des types complets pour toutes les réponses :

```typescript
interface StateVector {
    icao24: string;
    callsign: string | null;
    origin_country: string;
    latitude: number | null;
    longitude: number | null;
    // ... autres propriétés
}

interface Flight {
    icao24: string;
    firstSeen: number;
    estDepartureAirport: string | null;
    estArrivalAirport: string | null;
    callsign: string | null;
    // ... autres propriétés
}
```

## 🌍 Zones géographiques recommandées

### Europe Occidentale
```typescript
const states = await client.getAllStates({
    lamin: 45.0, lamax: 55.0,
    lomin: -5.0, lomax: 15.0
});
```

### USA Côte Est (plus d'activité)
```typescript
const states = await client.getAllStates({
    lamin: 35.0, lamax: 45.0,
    lomin: -85.0, lomax: -70.0
});
```

## ⚠️ Limitations API

- **Utilisateurs anonymes** : 400 crédits/jour, données temps réel uniquement
- **Utilisateurs authentifiés** : 4000 crédits/jour, historique 1h
- **Contributeurs actifs** : 8000 crédits/jour, historique étendu
- **Données arrivées/départs** : Mises à jour par batch process (données du jour précédent)

## 🔄 Gestion automatique des tokens

Le client gère automatiquement :
- 🔐 Récupération initiale du token OAuth2
- 💾 Sauvegarde persistante sur disque (`.access_token`)
- 🔄 Détection d'expiration (erreur 401)
- ⚡ Refresh automatique et retry transparent
- 📝 Logging informatif du processus

## 🐛 Gestion d'erreur

```typescript
try {
    const data = await client.getAllStates();
} catch (error) {
    if (error.message.includes('401')) {
        // Token expiré - géré automatiquement
    } else if (error.message.includes('429')) {
        // Limite de taux atteinte
    } else if (error.message.includes('404')) {
        // Données non disponibles pour cette période
    }
}
```

## 📈 Exemples de résultats

```bash
📡 États d'avions sur côte Est USA: 1646 avions détectés
✈️  Vols dernières 2h: 242 vols trouvés
🛬 Arrivées JFK hier: 91 arrivées
🛫 Départs JFK hier: 36 départs
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer des améliorations
- Soumettre une pull request

## 📄 Licence

MIT License - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🔗 Liens utiles

- [OpenSky Network](https://opensky-network.org/)
- [Documentation API OpenSky](https://opensky-network.org/apidoc/)
- [Créer un compte API](https://opensky-network.org/my-opensky/account)

---

**Fait avec ❤️ et TypeScript**