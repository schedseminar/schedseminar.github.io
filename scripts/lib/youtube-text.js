export function playlistTitle(datePrague) {
    const [year, month] = datePrague.split('-').map(Number);
    const season = month <= 3 ? 'Winter' : month <= 8 ? 'Spring' : 'Fall';
    return `Scheduling seminar ${season} ${year}`;
}

export function youtubeText(talk) {
    const presenters = Array.isArray(talk.presenter) ? talk.presenter : [talk.presenter];
    const speakers = presenters.map(p => `${p.name} (${p.affiliation})`).join(', ');
    return {
        title: `${speakers} ${talk.title}`,
        description: [talk.keywords, talk.abstract].filter(Boolean).join('\n\n'),
    };
}
