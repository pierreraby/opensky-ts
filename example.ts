import { OpenSkyClient } from './opensky-api.js';

const clientId = process.env.OPENSKY_CLIENT_ID;
const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

async function demonstrateAllMethods() {
    const client = new OpenSkyClient(clientId, clientSecret);
    
    console.log('🚀 Démonstration complète de l\'API OpenSky\n');
    
    try {
        // 1. States - Récupérer tous les états actuels (zone USA Est pour plus d'activité)
        console.log('📡 1. Récupération des états d\'avions sur la côte Est des USA...');
        const states = await client.getAllStates({
            lamin: 35.0,   // Sud (Caroline du Nord/Sud)
            lamax: 45.0,   // Nord (État de New York/Maine)  
            lomin: -85.0,  // Ouest (Tennessee/Kentucky)
            lomax: -70.0,  // Est (Côte atlantique)
            extended: true
        });
        console.log(`   ✅ ${states.states?.length || 0} avions détectés`);
        if (states.states && states.states.length > 0) {
            console.log(`   📍 Exemple: ${states.states[0].callsign?.trim() || 'N/A'} - ${states.states[0].origin_country}`);
        }
        
        // 2. Flights - Récupérer vols dans un intervalle (2h max)
        console.log('\n✈️  2. Récupération des vols des 2 dernières heures...');
        const now = Math.floor(Date.now() / 1000);
        const twoHoursAgo = now - (2 * 3600);
        const flights = await client.getFlightsInInterval(twoHoursAgo, now);
        console.log(`   ✅ ${flights.length} vols trouvés`);
        if (flights.length > 0) {
            const flight = flights[0];
            console.log(`   🛫 Exemple: ${flight.callsign?.trim() || 'N/A'} - ${flight.estDepartureAirport} → ${flight.estArrivalAirport}`);
        }

        // 3. Arrivals - Récupérer arrivées à JFK hier (données historiques)
        console.log('\n🛬 3. Récupération des arrivées à JFK hier (KJFK)...');
        const yesterday = now - (24 * 3600);
        const yesterdayMinus2h = yesterday - (2 * 3600);
        const arrivals = await client.getArrivalsByAirport('KJFK', yesterdayMinus2h.toString(), yesterday.toString());
        console.log(`   ✅ ${arrivals.length} arrivées à JFK`);
        if (arrivals.length > 0) {
            const arrival = arrivals[0];
            console.log(`   📍 Exemple: ${arrival.callsign?.trim() || 'N/A'} depuis ${arrival.estDepartureAirport}`);
        }

        // 4. Departures - Récupérer départs depuis JFK hier (données historiques)
        console.log('\n🛫 4. Récupération des départs depuis JFK hier (KJFK)...');
        const departures = await client.getDeparturesByAirport('KJFK', yesterdayMinus2h.toString(), yesterday.toString());
        console.log(`   ✅ ${departures.length} départs depuis JFK`);
        if (departures.length > 0) {
            const departure = departures[0];
            console.log(`   📍 Exemple: ${departure.callsign?.trim() || 'N/A'} vers ${departure.estArrivalAirport}`);
        }

        // 5. Aircraft flights - Prendre un avion du vol précédent
        if (flights.length > 0) {
            const sampleIcao = flights[0].icao24;
            console.log(`\n🔍 5. Récupération des vols pour l'avion ${sampleIcao}...`);
            const yesterdayStart = now - (24 * 3600);
            const aircraftFlights = await client.getFlightsByAircraft(sampleIcao, yesterdayStart, now);
            console.log(`   ✅ ${aircraftFlights.length} vol(s) pour cet avion`);
            if (aircraftFlights.length > 0) {
                const flight = aircraftFlights[0];
                console.log(`   ✈️  Trajet: ${flight.estDepartureAirport} → ${flight.estArrivalAirport}`);
            }

            // 6. Track - Récupérer trajectoire de l'avion
            console.log(`\n🗺️  6. Récupération de la trajectoire pour l'avion ${sampleIcao}...`);
            try {
                const track = await client.getTrackByAircraft(sampleIcao, flights[0].firstSeen);
                console.log(`   ✅ Trajectoire récupérée: ${track.path?.length || 0} points`);
                console.log(`   🛫 Départ estimé: ${track.estDepartureAirport || 'N/A'}`);
                console.log(`   🛬 Arrivée estimée: ${track.estArrivalAirport || 'N/A'}`);
            } catch (error: any) {
                console.log(`   ⚠️  Trajectoire non disponible: ${error.message}`);
            }
        }

        // 7. Own states (si vous avez des récepteurs)
        console.log('\n📊 7. Tentative de récupération des états de vos propres récepteurs...');
        try {
            const ownStates = await client.getOwnStates();
            console.log(`   ✅ ${ownStates.states?.length || 0} états de vos récepteurs`);
        } catch (error: any) {
            console.log(`   ⚠️  Pas de récepteurs configurés: ${error.message.includes('403') ? 'Accès refusé' : error.message}`);
        }

        console.log('\n🎉 Démonstration terminée avec succès !');

    } catch (error: any) {
        console.error('\n❌ Erreur durant la démonstration:', error.message);
        if (error.message.includes('429')) {
            console.log('💡 Limite de taux atteinte. Réessayez plus tard.');
        } else if (error.message.includes('401')) {
            console.log('💡 Token expiré. Le système va le renouveler automatiquement.');
        }
    }
}

await demonstrateAllMethods().catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exitCode = 1;
});