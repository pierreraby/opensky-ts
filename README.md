# OpenSky TypeScript Client 🛫

A modern and robust TypeScript client for the OpenSky Network API with automatic OAuth2 token management and intelligent retry logic.

> [🇫🇷 Version française](README.fr.md)

## ✨ Features

- 🔐 **OAuth2 Authentication** with automatic token management
- 🔄 **Automatic retry** on token expiration (401)
- 📝 **Complete TypeScript types** for all API responses
- 🌍 **Full API coverage** - Implements all OpenSky endpoints
- 💾 **Persistent token cache** on disk
- 🚀 **Top-level await** with centralized error handling

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/pierreraby/opensky-ts
cd opensky-ts

# Install dependencies
pnpm install

# Configure credentials
cp .env.example .env
# Edit .env with your OpenSky credentials
```

## 🔑 Configuration

1. Create an account on [OpenSky Network](https://opensky-network.org/)
2. Generate your API credentials in your [OpenSky account](https://opensky-network.org/my-opensky/account)
3. Configure the `.env` file:

```bash
OPENSKY_CLIENT_ID=votre_client_id
OPENSKY_CLIENT_SECRET=votre_client_secret
```

## 🚀 Usage

### Basic Example

```typescript
import { OpenSkyClient } from './opensky-api.js';

const client = new OpenSkyClient(
    process.env.OPENSKY_CLIENT_ID,
    process.env.OPENSKY_CLIENT_SECRET
);

// Get arrivals at an airport
const arrivals = await client.getArrivalsByAirport('EDDF', '1700000000', '1700086400');
console.log(`${arrivals.length} arrivals found`);
```

### Example with Error Handling

```typescript
async function main() {
    const client = new OpenSkyClient(clientId, clientSecret);
    
    try {
        // Client automatically handles tokens and retries
        const flights = await client.getFlightsInInterval(begin, end);
        console.log(`${flights.length} flights found`);
    } catch (error) {
        console.error('API Error:', error.message);
    }
}

await main().catch(console.error);
```

## 📋 Available API

### States (Aircraft States)

```typescript
// All current states with geographic filters
const states = await client.getAllStates({
    lamin: 45.0, lamax: 55.0,  // Latitude
    lomin: -5.0, lomax: 15.0,  // Longitude
    extended: true
});

// States from your own receivers
const ownStates = await client.getOwnStates({
    serials: [123456, 789012]
});
```

### Flights

```typescript
// Flights in time interval
const flights = await client.getFlightsInInterval(begin, end);

// Flights by specific aircraft
const aircraftFlights = await client.getFlightsByAircraft('3c675a', begin, end);

// Airport arrivals
const arrivals = await client.getArrivalsByAirport('EDDF', begin, end);

// Airport departures
const departures = await client.getDeparturesByAirport('KJFK', begin, end);
```

### Tracks

```typescript
// Aircraft trajectory
const track = await client.getTrackByAircraft('3c675a', timestamp);
```

## 🎯 Usage Examples

### Simple Script - Frankfurt Arrivals

```bash
pnpm start
```

### Complete Demonstration

```bash
node --env-file=.env dist/example.js
```

## 🏗️ Project Structure

```
opensky-ts/
├── opensky-api.ts       # Main client with all methods
├── main.ts             # Simple example (EDDF arrivals)
├── example.ts          # Complete API demonstration
├── package.json        # Project configuration
└── tsconfig.json       # TypeScript configuration
```

## 🔧 Available Scripts

```bash
# Development with watch mode
pnpm run dev

# Production build
pnpm run build

# Run main example
pnpm start

# Build + run in one command
pnpm run prod
```

## 📊 TypeScript Types

The client provides complete types for all responses:

```typescript
interface StateVector {
    icao24: string;
    callsign: string | null;
    origin_country: string;
    latitude: number | null;
    longitude: number | null;
    // ... other properties
}

interface Flight {
    icao24: string;
    firstSeen: number;
    estDepartureAirport: string | null;
    estArrivalAirport: string | null;
    callsign: string | null;
    // ... other properties
}
```

## 🌍 Recommended Geographic Areas

### Western Europe
```typescript
const states = await client.getAllStates({
    lamin: 45.0, lamax: 55.0,
    lomin: -5.0, lomax: 15.0
});
```

### USA East Coast (more activity)
```typescript
const states = await client.getAllStates({
    lamin: 35.0, lamax: 45.0,
    lomin: -85.0, lomax: -70.0
});
```

## ⚠️ API Limitations

- **Anonymous users**: 400 credits/day, real-time data only
- **Authenticated users**: 4000 credits/day, 1h history
- **Active contributors**: 8000 credits/day, extended history
- **Arrivals/departures data**: Updated by batch process (previous day data)

## 🔄 Automatic Token Management

The client automatically handles:
- 🔐 Initial OAuth2 token retrieval
- 💾 Persistent disk storage (`.access_token`)
- 🔄 Expiration detection (401 errors)
- ⚡ Automatic refresh and transparent retry
- 📝 Informative process logging

## 🐛 Error Handling

```typescript
try {
    const data = await client.getAllStates();
} catch (error) {
    if (error.message.includes('401')) {
        // Token expired - handled automatically
    } else if (error.message.includes('429')) {
        // Rate limit reached
    } else if (error.message.includes('404')) {
        // Data not available for this period
    }
}
```

## 📈 Example Results

```bash
📡 Aircraft states on USA East Coast: 1646 aircraft detected
✈️  Flights last 2h: 242 flights found
🛬 JFK arrivals yesterday: 91 arrivals
🛫 JFK departures yesterday: 36 departures
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Open an issue to report a bug
- Suggest improvements
- Submit a pull request

## 📄 License

MIT License - See the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [OpenSky Network](https://opensky-network.org/)
- [OpenSky API Documentation](https://opensky-network.org/apidoc/)
- [Create API Account](https://opensky-network.org/my-opensky/account)

---

**Made with ❤️ and TypeScript**