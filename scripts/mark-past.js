// Marks upcoming talks as past once their 15:00-16:30 Prague slot has ended.
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/talks');

for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const file = path.join(dir, f);
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (data.status !== 'upcoming' || !data.datePrague) continue;

    const end = DateTime.fromISO(data.datePrague, { zone: 'Europe/Prague' }).set({ hour: 16, minute: 30 });
    if (DateTime.now() > end) {
        data.status = 'past';
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        console.log(`Marked past: ${f}`);
    }
}
