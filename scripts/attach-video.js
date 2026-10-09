// Usage: node scripts/attach-video.js <YYYY-MM-DD> <video-url> [youtube-id]
// Sets video/youtubeEmbed on the talk held on that date and marks it as past.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const [date, videoUrl, youtubeId] = process.argv.slice(2);
if (!date || !videoUrl) {
    console.error('Usage: node scripts/attach-video.js <YYYY-MM-DD> <video-url> [youtube-id]');
    process.exit(1);
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/talks');
const matches = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ file: path.join(dir, f), data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) }))
    .filter(t => t.data.datePrague === date);

if (matches.length !== 1) {
    console.error(`Expected exactly one talk on ${date}, found ${matches.length}.`);
    process.exit(1);
}

const { file, data } = matches[0];
data.video = encodeURI(decodeURI(videoUrl));
if (youtubeId) data.youtubeEmbed = `https://www.youtube.com/embed/${youtubeId}`;
data.status = 'past';

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`Updated ${path.relative(process.cwd(), file)}`);
