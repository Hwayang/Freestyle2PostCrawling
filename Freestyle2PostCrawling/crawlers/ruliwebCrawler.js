import axios from 'axios';
import cheerio from 'cheerio';
import { delay } from '../utils/throttler.js';

export async function crawlRuliweb(event, match) {
    const results = [];
    const BASE = 'https://bbs.ruliweb.com/family/5252/board/184257';

    for (let page = 1; page <= 20; page++) {
        const { data } = await axios.get(`${BASE}?page=${page}`);
        const $ = cheerio.load(data);

        $('tr.table_body').each((_, row) => {
            const $row = $(row);
            const title = $row.find('.subject').text().trim();
            const link = $row.find('.subject a').attr('href');
            const id = link.split('/').pop();
            const raw = $row.find('.time').attr('title');        // 2025-06-08 12:34:56
            const date = raw ? raw.slice(0, 10) : '';
            const up = parseInt($row.find('.recomd').text() || '0', 10);
            const cmt = parseInt($row.find('.num_reply').text() || '0', 10);

            const post = { id: `ru-${id}`, title, content: title, date, link, upvotes: up, comments: cmt };
            if (match(post) && date >= event.start && date <= event.end) results.push(post);
        });
        await delay();
    }
    return results;
}
