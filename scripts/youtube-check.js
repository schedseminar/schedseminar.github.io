// Read-only check that the YouTube credentials work; prints the channel, recent videos and playlists.
import { google } from 'googleapis';
import { playlistTitle } from './lib/youtube-text.js';

const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN } = process.env;
if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    console.error('YouTube credentials not set.');
    process.exit(1);
}

const auth = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);
auth.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth });

const channel = await youtube.channels.list({ part: ['snippet', 'contentDetails'], mine: true });
const ch = channel.data.items?.[0];
if (!ch) {
    console.error('Authenticated, but no channel found for this account.');
    process.exit(1);
}
console.log(`Channel: ${ch.snippet.title} (${ch.id})`);

const uploads = await youtube.playlistItems.list({
    part: ['snippet'],
    playlistId: ch.contentDetails.relatedPlaylists.uploads,
    maxResults: 5,
});
console.log('Recent uploads:');
for (const i of uploads.data.items) console.log(`  ${i.snippet.publishedAt}  ${i.snippet.title}`);

const playlists = await youtube.playlists.list({ part: ['snippet'], mine: true, maxResults: 50 });
console.log('Playlists:');
for (const p of playlists.data.items) console.log(`  ${p.snippet.title}`);

console.log(`Next talk would use playlist: ${playlistTitle(new Date().toISOString().slice(0, 10))}`);
