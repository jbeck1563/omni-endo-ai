/**
 * OMNI-ENDO AI: Secure Backend Proxy
 * Facilitates isolated session management and data acquisition from Glooko Cloud.
 */

import express from 'express';
import originalFetch from 'node-fetch';
import makeFetchCookie from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';
import cors from 'cors';
import path from 'path'; 
import { fileURLToPath } from 'url'; 

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 4000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500; 

// --- MINI-SERVER SETUP ---
const __filename = fileURLToPath(import.meta.url); // ADDED
const __dirname = path.dirname(__filename); // ADDED

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // ADDED

// Helper for rate-limiting retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Encapsulates the multi-step Glooko authentication flow.
 */
async function performLogin(email, password) {
    console.log(`[AUTH] Starting authentication flow for: ${email}`);
    
    const jar = new CookieJar();
    const fetch = makeFetchCookie(originalFetch, jar);
    const baseDomain = 'https://my.glooko.com';

    try {
        const loginPageRes = await fetch(`${baseDomain}/users/sign_in?id=login_form&locale=en-GB`, { 
            redirect: 'manual' 
        });
        const regionalLoginUrl = loginPageRes.headers.get('location') || `${baseDomain}/users/sign_in`;

        const regionalPage = await fetch(regionalLoginUrl);
        const htmlContent = await regionalPage.text();
        const tokenMatch = htmlContent.match(/name="csrf-token" content="([^"]+)"/);
        const authenticityToken = tokenMatch ? tokenMatch[1] : null;

        if (!authenticityToken) throw new Error("SECURITY_TOKEN_MISSING");

        const loginParams = new URLSearchParams({
            'authenticity_token': authenticityToken,
            'user[email]': email,
            'user[password]': password,
            'commit': 'Log In'
        });

        const authResponse = await fetch(regionalLoginUrl, {
            method: 'POST',
            body: loginParams,
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                'Referer': regionalLoginUrl
            }
        });

        const dashboardHtml = await authResponse.text();
        const patientMatch = dashboardHtml.match(/window\.patient\s*=\s*"([^"]+)"/);
        
        if (!patientMatch) throw new Error("CREDENTIAL_MISMATCH");

        const apiMatch = dashboardHtml.match(/apiUrl:\s*'([^']+)'/);
        const scrapedApiUrl = apiMatch ? apiMatch[1] : null;
        let apiBase;

        if (scrapedApiUrl) {
            apiBase = scrapedApiUrl;
        } else {
            const urlObj = new URL(authResponse.url);
            apiBase = `${urlObj.protocol}//${urlObj.hostname.replace('my.glooko', 'api.glooko')}`;
        }

        return {
            fetch,
            patientId: patientMatch[1],
            urls: {
                data: `${apiBase}/api/v3/graph/data`,
                stats: `${apiBase}/api/v3/graph/statistics/overall`,
                settings: `${apiBase}/api/v3/devices_and_settings`
            }
        };
    } catch (err) {
        console.error(`[AUTH_ERROR] ${err.message}`);
        throw err;
    }
}

/**
 * API Route: /my-data
 */
app.post('/my-data', async (req, res) => {
    const { username, password, startDate, endDate } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Required credentials missing from request body." });
    }

    let attempts = 0;
    let session = null;

    const executeFetch = async (currentSession) => {
        const { fetch, patientId, urls } = currentSession;
        const queryString = `patient=${patientId}&startDate=${startDate}&endDate=${endDate}&locale=en-GB&insulinTooltips=true&filterBgReadings=true&splitByDay=false`;
        const seriesString = `&series[]=cgmHigh&series[]=cgmLow&series[]=cgmNormal&series[]=deliveredBolus`;
        
        const url1 = `${urls.data}?${queryString}${seriesString}`;
        const url2 = `${urls.stats}?patient=${patientId}&startDate=${startDate}&endDate=${endDate}&egv=false&includeInsulin=true&includeExercise=true&dow=monday,tuesday,wednesday,thursday,friday,saturday,sunday&includePumpModes=true`;
        const url3 = `${urls.settings}?patient=${patientId}`;

        const requestHeaders = { 
            'Accept': 'application/json', 
            'X-Requested-With': 'XMLHttpRequest' 
        };

        const [r1, r2, r3] = await Promise.all([
            fetch(url1, { headers: requestHeaders }),
            fetch(url2, { headers: requestHeaders }),
            fetch(url3, { headers: requestHeaders })
        ]);

        if ([r1.status, r2.status, r3.status].includes(401)) throw new Error("UNAUTHORIZED");
        if (!r1.ok || !r2.ok || !r3.ok) throw new Error("API_FAILURE");

        const [data1, data2, data3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
        return { startDate, endDate, data1, data2, data3 };
    };

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        try {
            if (!session) {
                session = await performLogin(username, password);
            }
            const result = await executeFetch(session);
            console.log(`[SUCCESS] Data retrieved for Patient ${session.patientId}`);
            return res.json(result);
        } catch (error) {
            console.warn(`[RETRY_${attempts}] Handled error: ${error.message}`);
            if (error.message === "CREDENTIAL_MISMATCH") {
                return res.status(401).json({ 
                    error: "Invalid Glooko credentials. Please verify your username and password." 
                });
            }
            if (attempts >= MAX_ATTEMPTS) {
                return res.status(502).json({ 
                    error: `Service failed after ${MAX_ATTEMPTS} attempts. Message: ${error.message}` 
                });
            }
            session = null;
            await sleep(RETRY_DELAY_MS);
            continue; 
        }
    }
});

// --- FALLBACK ROUTE ---
// Ensures that if a user visits '/', they get your HTML page.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
}); // ADDED

// --- SERVER STARTUP ---
const server = app.listen(PORT, () => {
    console.log(`
    ================================================
    OMNI-ENDO AI SERVICE ACTIVE
    Port: ${PORT}
    URL: http://localhost:${PORT}
    Status: Listening for clinical data requests...
    ================================================`);
});

server.timeout = 300000;
