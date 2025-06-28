import 'dotenv/config';
import { fetchOfficialEvents } from './crawlers/officialCrawler.js';
import { crawlInven } from './crawlers/invenCrawler.js';
import { crawlRuliweb } from './crawlers/ruliwebCrawler.js';
import { crawlDC } from './crawlers/dcCrawler.js';
import { upsertEventRows } from './google_sheets/event_list_updater.js';
import { writeEventData } from './google_sheets/event_sheet_generator.js';
import { buildMatcher } from './utils/keywordHelper.js';

async function processEvent(ev) {
    const match = buildMatcher(ev.title);

    const [inven, ruli, dc] = await Promise.all([
        crawlInven(ev, match),
        crawlRuliweb(ev, match),
        crawlDC(ev, match)
    ]);

    const merged = [...inven, ...ruli, ...dc]
        .sort((a, b) => a.date.localeCompare(b.date));

    await writeEventData(ev, merged);
}

async function run() {
    const events = await fetchOfficialEvents();
    await upsertEventRows(events);

    const today = new Date().toISOString().slice(0, 10);
    const recentEvents = events.filter(ev => ev.end >= today || ev.end >= minusDays(today, 30));

    for (const ev of recentEvents) await processEvent(ev);
}

/* YYYY-MM-DD → N일 전 계산 */
function minusDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

run().catch(console.error);
