// Sets title/description on today's livestream VOD and stores its embed link in the talk JSON.
// Needs YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN (see scripts/youtube-auth.js).
import { google } from 'googleapis';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { youtubeText, playlistTitle } from './lib/youtube-text.js';

const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN } = process.env;
if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    console.log('YouTube credentials not set, skipping.');
    process.exit(0);
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/talks');
const today = DateTime.now().setZone('Europe/Prague').toISODate();

const entry = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ file: path.join(dir, f), data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) }))
    .find(t => t.data.datePrague === today);

if (!entry) {
    console.log(`No talk on ${today}.`);
    process.exit(0);
}
if (entry.data.youtubeEmbed) {
    console.log('Talk already has a YouTube link.');
    process.exit(0);
}

const auth = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);
auth.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth });

const channel = await youtube.channels.list({ part: ['contentDetails'], mine: true });
const uploads = channel.data.items[0].contentDetails.relatedPlaylists.uploads;
const items = await youtube.playlistItems.list({ part: ['contentDetails'], playlistId: uploads, maxResults: 10 });
const ids = items.data.items.map(i => i.contentDetails.videoId);

const videos = await youtube.videos.list({ part: ['snippet', 'liveStreamingDetails'], id: ids });
const candidates = videos.data.items.filter(v => {
    const when = v.liveStreamingDetails?.actualStartTime ?? v.snippet.publishedAt;
    return DateTime.fromISO(when).setZone('Europe/Prague').toISODate() === today;
});

if (candidates.length !== 1) {
    console.error(`Expected one video from ${today}, found ${candidates.length}.`);
    process.exit(1);
}

const video = candidates[0];
const { title, description } = youtubeText(entry.data);
const { categoryId, tags, defaultLanguage } = video.snippet;

await youtube.videos.update({
    part: ['snippet'],
    requestBody: {
        id: video.id,
        snippet: { title: title.slice(0, 100), description: description.slice(0, 5000), categoryId, tags, defaultLanguage },
    },
});

entry.data.youtubeEmbed = `https://www.youtube.com/embed/${video.id}`;
fs.writeFileSync(entry.file, JSON.stringify(entry.data, null, 2));
console.log(`Updated video ${video.id} and linked it to "${entry.data.title}".`);

const wantedPlaylist = playlistTitle(entry.data.datePrague);
let playlistId;
let pageToken;
do {
    const res = await youtube.playlists.list({ part: ['snippet'], mine: true, maxResults: 50, pageToken });
    playlistId = res.data.items.find(p => p.snippet.title.toLowerCase() === wantedPlaylist.toLowerCase())?.id;
    pageToken = res.data.nextPageToken;
} while (!playlistId && pageToken);

if (!playlistId) {
    const created = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: { snippet: { title: wantedPlaylist }, status: { privacyStatus: 'public' } },
    });
    playlistId = created.data.id;
    console.log(`Created playlist "${wantedPlaylist}".`);
}

await youtube.playlistItems.insert({
    part: ['snippet'],
    requestBody: { snippet: { playlistId, resourceId: { kind: 'youtube#video', videoId: video.id } } },
});
console.log(`Added video to "${wantedPlaylist}".`);
