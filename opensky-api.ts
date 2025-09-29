

import fs from 'fs';

// Type definitions based on OpenSky API documentation
export interface StateVector {
    icao24: string;
    callsign: string | null;
    origin_country: string;
    time_position: number | null;
    last_contact: number;
    longitude: number | null;
    latitude: number | null;
    baro_altitude: number | null;
    on_ground: boolean;
    velocity: number | null;
    true_track: number | null;
    vertical_rate: number | null;
    sensors: number[] | null;
    geo_altitude: number | null;
    squawk: string | null;
    spi: boolean;
    position_source: number;
    category: number;
}

export interface StatesResponse {
    time: number;
    states: StateVector[] | null;
}

export interface Flight {
    icao24: string;
    firstSeen: number;
    estDepartureAirport: string | null;
    lastSeen: number;
    estArrivalAirport: string | null;
    callsign: string | null;
    estDepartureAirportHorizDistance: number;
    estDepartureAirportVertDistance: number;
    estArrivalAirportHorizDistance: number;
    estArrivalAirportVertDistance: number;
    departureAirportCandidatesCount: number;
    arrivalAirportCandidatesCount: number;
}

export interface Track {
    icao24: string;
    firstSeen: number;
    estDepartureAirport: string | null;
    lastSeen: number;
    estArrivalAirport: string | null;
    path: Array<[number, number | null, number | null, number | null, boolean]>; // [time, lat, lon, baro_altitude, on_ground]
}

export interface GetAllStatesOptions {
    time?: number;
    icao24?: string | string[];
    lamin?: number;
    lomin?: number; 
    lamax?: number;
    lomax?: number;
    extended?: boolean;
}

export interface GetOwnStatesOptions {
    time?: number;
    icao24?: string | string[];
    serials?: number | number[];
}

export class OpenSkyClient {
    private clientId?: string;
    private clientSecret?: string;
    private accessToken?: string;
    private tokenFilePath: string = '.access_token';

    constructor(clientId?: string, clientSecret?: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    private async fetchAccessToken(): Promise<string> {
        if (!this.clientId || !this.clientSecret) {
            throw new Error("Client ID or Client Secret is not defined in environment variables.");
        }

        const res = await fetch('https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret,
            }),
        });

        if (!res.ok) {
            throw new Error(`Failed to retrieve access token: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data.access_token;
    }

    private loadTokenFromFile(): string | null {
        if (fs.existsSync(this.tokenFilePath) && fs.statSync(this.tokenFilePath).size > 0) {
            return fs.readFileSync(this.tokenFilePath, 'utf-8').trim();
        }
        return null;
    }

    private saveTokenToFile(token: string): void {
        fs.writeFileSync(this.tokenFilePath, token);
    }

    private clearTokenFile(): void {
        if (fs.existsSync(this.tokenFilePath)) {
            fs.unlinkSync(this.tokenFilePath);
        }
    }

    async ensureValidToken(): Promise<string> {
        // Try to load from file first
        if (!this.accessToken) {
            const tokenFromFile = this.loadTokenFromFile();
            if (tokenFromFile) {
                this.accessToken = tokenFromFile;
                console.info('Access Token loaded from file');
                return this.accessToken;
            }
        }

        // Fetch new token if none exists
        console.info('Fetching new access token...');
        this.accessToken = await this.fetchAccessToken();
        this.saveTokenToFile(this.accessToken);
        console.info('Access Token retrieved from API and saved to file');
        
        return this.accessToken;
    }

    private async refreshToken(): Promise<string> {
        console.warn('Token expired or invalid. Refreshing token...');
        this.clearTokenFile();
        this.accessToken = await this.fetchAccessToken();
        this.saveTokenToFile(this.accessToken);
        console.info('New access token obtained');
        return this.accessToken;
    }

    private async makeAuthenticatedRequest(url: string): Promise<any> {
        let token = await this.ensureValidToken();

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Handle 401 errors with token refresh and retry
        if (res.status === 401) {
            token = await this.refreshToken();
            
            // Retry with new token
            const retryRes = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (!retryRes.ok) {
                throw new Error(`API request failed after token refresh: ${retryRes.status}`);
            }
            
            return await retryRes.json();
        }

        if (!res.ok) {
            throw new Error(`API request failed: ${res.status}`);
        }

        return await res.json();
    }

    async getArrivalsByAirport(airport: string, begin: string, end: string): Promise<Flight[]> {
        const url = `https://opensky-network.org/api/flights/arrival?airport=${airport}&begin=${begin}&end=${end}`;
        return await this.makeAuthenticatedRequest(url);
    }

    async getDeparturesByAirport(airport: string, begin: string, end: string): Promise<Flight[]> {
        const url = `https://opensky-network.org/api/flights/departure?airport=${airport}&begin=${begin}&end=${end}`;
        return await this.makeAuthenticatedRequest(url);
    }

    // States endpoints
    async getAllStates(options?: GetAllStatesOptions): Promise<StatesResponse> {
        let url = 'https://opensky-network.org/api/states/all';
        const params = new URLSearchParams();
        
        if (options?.time) params.append('time', options.time.toString());
        if (options?.icao24) {
            if (Array.isArray(options.icao24)) {
                options.icao24.forEach(icao => params.append('icao24', icao));
            } else {
                params.append('icao24', options.icao24);
            }
        }
        if (options?.lamin !== undefined) params.append('lamin', options.lamin.toString());
        if (options?.lomin !== undefined) params.append('lomin', options.lomin.toString());
        if (options?.lamax !== undefined) params.append('lamax', options.lamax.toString());
        if (options?.lomax !== undefined) params.append('lomax', options.lomax.toString());
        if (options?.extended) params.append('extended', '1');
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
        
        return await this.makeAuthenticatedRequest(url);
    }

    async getOwnStates(options?: GetOwnStatesOptions): Promise<StatesResponse> {
        let url = 'https://opensky-network.org/api/states/own';
        const params = new URLSearchParams();
        
        if (options?.time) params.append('time', options.time.toString());
        if (options?.icao24) {
            if (Array.isArray(options.icao24)) {
                options.icao24.forEach(icao => params.append('icao24', icao));
            } else {
                params.append('icao24', options.icao24);
            }
        }
        if (options?.serials) {
            if (Array.isArray(options.serials)) {
                options.serials.forEach(serial => params.append('serials', serial.toString()));
            } else {
                params.append('serials', options.serials.toString());
            }
        }
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
        
        return await this.makeAuthenticatedRequest(url);
    }

    // Flights endpoints  
    async getFlightsInInterval(begin: number, end: number): Promise<Flight[]> {
        const url = `https://opensky-network.org/api/flights/all?begin=${begin}&end=${end}`;
        return await this.makeAuthenticatedRequest(url);
    }

    async getFlightsByAircraft(icao24: string, begin: number, end: number): Promise<Flight[]> {
        const url = `https://opensky-network.org/api/flights/aircraft?icao24=${icao24}&begin=${begin}&end=${end}`;
        return await this.makeAuthenticatedRequest(url);
    }

    // Tracks endpoint
    async getTrackByAircraft(icao24: string, time?: number): Promise<Track> {
        const timeParam = time !== undefined ? time : 0;
        const url = `https://opensky-network.org/api/tracks?icao24=${icao24}&time=${timeParam}`;
        return await this.makeAuthenticatedRequest(url);
    }
}

// Keep legacy functions for backward compatibility
export async function getAccessToken(clientId: string | undefined, clientSecret: string | undefined): Promise<string> {
    const client = new OpenSkyClient(clientId, clientSecret);
    return await client.ensureValidToken();
}

export async function getArrivalByAirport(airport: string, begin: string, end: string, token: string): Promise<any> {
    const url = `https://opensky-network.org/api/flights/arrival?airport=${airport}&begin=${begin}&end=${end}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to retrieve arrival flights: ${res.status}`);
    }

    const data = await res.json();
    return data;
}

export async function getDepartureByAirport(airport: string, begin: string, end: string, token: string | undefined): Promise<any> {
    const url = `https://opensky-network.org/api/flights/departure?airport=${airport}&begin=${begin}&end=${end}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    
    if (!res.ok) {
        throw new Error(`Failed to retrieve departure flights: ${res.status}`);
    }

    const data = await res.json();
    return data;
}
