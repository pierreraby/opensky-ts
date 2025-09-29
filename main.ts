import { OpenSkyClient } from './opensky-api.js';

const clientId = process.env.OPENSKY_CLIENT_ID;
const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

async function main() {
    const client = new OpenSkyClient(clientId, clientSecret);
    
    // Get arrivals for Frankfurt Airport (EDDF)
    const arrivals = await client.getArrivalsByAirport('EDDF', '1700000000', '1700086400');
    
    if (arrivals && arrivals.length > 0) {
        console.log(`Number of arrivals at EDDF: ${arrivals.length}`);
        console.log('Sample arrival:', arrivals[0]);
    } else {
        console.log('No arrivals found for the specified time period');
    }
}

await main().catch((error) => {
    console.error('Error during startup:', error);
    process.exitCode = 1;
});
