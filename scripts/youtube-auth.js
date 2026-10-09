// One-time local helper: node scripts/youtube-auth.js <client-id> <client-secret>
// Opens a browser for consent and prints the refresh token to store as YOUTUBE_REFRESH_TOKEN.
import { google } from 'googleapis';
import http from 'http';
import { execSync } from 'child_process';

const [clientId, clientSecret] = process.argv.slice(2);
if (!clientId || !clientSecret) {
    console.error('Usage: node scripts/youtube-auth.js <client-id> <client-secret>');
    process.exit(1);
}

const redirect = 'http://127.0.0.1:53682';
const auth = new google.auth.OAuth2(clientId, clientSecret, redirect);
const url = auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl'],
});

const server = http.createServer(async (req, res) => {
    const code = new URL(req.url, redirect).searchParams.get('code');
    if (!code) { res.end('No code.'); return; }
    const { tokens } = await auth.getToken(code);
    res.end('Done, you can close this tab.');
    console.log(`\nYOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
    server.close();
});
server.listen(53682, () => {
    console.log(`Opening ${url}`);
    execSync(`open "${url}"`);
});
