import { google } from 'googleapis';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// --- Configuration ---
const TALKS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/talks');
const CALENDAR_ID = process.env.CALENDAR_ID;
// GOOGLE_CALENDAR_CREDENTIALS should be the JSON string of the service account key
const ACTION_CREDENTIALS = process.env.GOOGLE_CALENDAR_CREDENTIALS;

if (!CALENDAR_ID) {
    console.error('Missing CALENDAR_ID environment variable.');
    process.exit(1);
}

if (!ACTION_CREDENTIALS) {
    console.error('Missing GOOGLE_CALENDAR_CREDENTIALS environment variable.');
    process.exit(1);
}

const credentials = JSON.parse(ACTION_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
});

console.log(`Authenticating as Service Account: ${credentials.client_email}`);
console.log(`Target Calendar ID: ${CALENDAR_ID}`);

const calendar = google.calendar({ version: 'v3', auth });

// --- Helpers ---
function getHash(str) {
    return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

function parseTalks() {
    const files = fs.readdirSync(TALKS_DIR).filter(file => file.endsWith('.json'));
    const talks = [];

    for (const file of files) {
        const filePath = path.join(TALKS_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (!content.datePrague) continue;

        // Parse the date (Day/Month/Year) from the file
        const baseDate = DateTime.fromISO(content.datePrague, { zone: 'Europe/Prague' });

        // Explicitly set Start to 15:00:00
        const startDate = baseDate.set({ hour: 15, minute: 0, second: 0, millisecond: 0 });

        // Explicitly set End to 16:30:00
        const endDate = baseDate.set({ hour: 16, minute: 30, second: 0, millisecond: 0 });

        const id = `schedseminar${getHash(file)}`;

        talks.push({
            id: id,
            title: content.title,
            description: content.abstract || '',
            start: startDate,
            end: endDate,
            originalFile: file,
            presenter: Array.isArray(content.presenter)
                ? content.presenter.map(p => p.name).join(', ')
                : content.presenter.name
        });
    }
    return talks;
}

async function sync() {
    console.log('📅 Starting Calendar Sync...');

    // 1. Filter Future Talks
    const allTalks = parseTalks();
    const now = DateTime.now();
    const futureTalks = allTalks.filter(t => t.start > now);

    console.log(`Found ${allTalks.length} total talks, ${futureTalks.length} in the future.`);

    if (futureTalks.length === 0) {
        console.log(' No future talks to sync.');
        return;
    }

    // 2. Fetch Existing Future Events from Calendar
    console.log('Fetching upcoming events from Google Calendar...');
    const res = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: now.toISO(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    const existingEvents = res.data.items || [];
    const existingTitles = new Set(existingEvents.map(e => e.summary));
    console.log(`Found ${existingEvents.length} existing future events in Calendar.`);

    // 3. Sync
    let addedCount = 0;
    let skippedCount = 0;

    for (const talk of futureTalks) {
        // Check duplication by Title
        if (existingTitles.has(talk.title)) {
            console.log(`    Skipping "${talk.title}" (Title match found in calendar).`);
            skippedCount++;
            continue;
        }

        console.log(`  Adding "${talk.title}"...`);

        try {
            await calendar.events.insert({
                calendarId: CALENDAR_ID,
                id: talk.id, // Try to set our deterministic ID
                requestBody: {
                    id: talk.id,
                    summary: talk.title,
                    description: `${talk.description}\n\nPresenter: ${talk.presenter}\nYou can watch the talk online at: https://www.youtube.com/channel/UCUoCNnaAfw5NAntItILFn4A/live`,
                    start: {
                        dateTime: talk.start.toISO(),
                        timeZone: 'Europe/Prague',
                    },
                    end: {
                        dateTime: talk.end.toISO(),
                        timeZone: 'Europe/Prague',
                    },
                },
            });
            console.log(`     Created event for "${talk.title}"`);
            addedCount++;
        } catch (error) {
            if (error.code === 409) {
                console.log(`      Event with ID ${talk.id} already exists (but title didn't match?). Skipping.`);
            } else {
                console.error(`     Failed to add "${talk.title}":`, error.message);
            }
        }
    }

    console.log(`\nSync Complete. Added: ${addedCount}, Skipped: ${skippedCount}.`);
}

sync().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});