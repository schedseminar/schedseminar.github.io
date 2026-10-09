// Usage: node scripts/youtube-metadata.js [YYYY-MM-DD]
// Prints the YouTube title and description (keywords, then abstract) for a talk and copies them to the clipboard.
// Without a date, uses the most recent talk whose date is today or earlier.
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { youtubeText } from './lib/youtube-text.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/talks');
const talks = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')));

const wanted = process.argv[2];
const today = new Date().toISOString().slice(0, 10);
const talk = wanted
    ? talks.find(t => t.datePrague === wanted)
    : talks.filter(t => t.datePrague <= today).sort((a, b) => b.datePrague.localeCompare(a.datePrague))[0];

if (!talk) {
    console.error(`No talk found for ${wanted ?? 'today or earlier'}.`);
    process.exit(1);
}

const { title, description } = youtubeText(talk);

console.log(`TITLE:\n${title}\n\nDESCRIPTION:\n${description}`);

try {
    execSync('pbcopy', { input: description });
    console.error('\n(description copied to clipboard)');
} catch {
    // clipboard unavailable
}
