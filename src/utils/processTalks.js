import { getCollection } from 'astro:content';
import { DateTime } from 'luxon';

async function getTalks() {
    const entries = await getCollection('talks');

    // First, map, sort, and assign the sequential entryId
    const sortedAndAssignedTalks = entries
    .map(({ data }) => {
        const datePrague = DateTime.fromISO(`${data.datePrague}T15:00:00`, {
            zone: 'Europe/Prague'
        });
        const times = {
            utc: datePrague.setZone('UTC').toFormat('MMM dd, HH:mm ccc'),
            prague: datePrague.toFormat('MMM dd, HH:mm ccc'),
            newYork: datePrague.setZone('America/New_York').toFormat('MMM dd, HH:mm ccc'),
            shanghai: datePrague.setZone('Asia/Shanghai').toFormat('MMM dd, HH:mm ccc'),
        };

        return {
            ...data,
            keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()) : [],
            times,
            date: datePrague.toUTC().toJSDate(),
        };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((talk, index) => ({
        ...talk,
        entryId: index + 1
    }));

    let sequenceBroken = false;
    let firstUpcomingFound = false;

    // Next, calculate the showId property based on the unbroken sequence
    const allTalks = sortedAndAssignedTalks.map((talk, index) => {
        if (talk.status === 'past') {
            return { ...talk, showId: true };
        }

        if (talk.status === 'upcoming') {
            // The very next upcoming talk is safe
            if (!firstUpcomingFound) {
                firstUpcomingFound = true;
                return { ...talk, showId: true };
            }

            // If a previous gap already broke the sequence, hide the ID
            if (sequenceBroken) {
                return { ...talk, showId: false };
            }

            // Calculate the gap in days using the JS date objects you already created
            const previousTalk = sortedAndAssignedTalks[index - 1];
            const diffInTime = talk.date.getTime() - previousTalk.date.getTime();
            const diffInDays = diffInTime / (1000 * 3600 * 24);

            // 15 days allows for a 2-week gap plus a 1-day buffer for any time shifts
            if (diffInDays <= 15) {
                return { ...talk, showId: true };
            } else {
                sequenceBroken = true;
                return { ...talk, showId: false };
            }
        }

        return talk;
    });

    // Finally, filter and reverse as you had it originally
    const upcomingTalks = allTalks
    .filter(t => t.status === 'upcoming')
    .reverse();

    const pastTalks = allTalks
    .filter(t => t.status === 'past')
    .reverse();

    return { upcomingTalks, pastTalks };
}

export { getTalks };