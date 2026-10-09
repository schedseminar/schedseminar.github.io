// Prints the watch URL of the latest talk that has a YouTube video but no uploaded video yet.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/talks');
const pending = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')))
    .filter(t => t.youtubeEmbed && !t.video)
    .sort((a, b) => b.datePrague.localeCompare(a.datePrague))[0];

if (!pending) {
    console.error('No talk is waiting for a video upload.');
    process.exit(1);
}

const id = new URL(pending.youtubeEmbed).pathname.split('/').pop();
console.log(`https://www.youtube.com/watch?v=${id}`);
