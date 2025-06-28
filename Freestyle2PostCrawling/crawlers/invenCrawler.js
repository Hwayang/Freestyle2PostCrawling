import axios from 'axios';
import cheerio from 'cheerio';
import { delay } from '../utils/throttler.js';

export async function crawlInven(event, match) {
    const results = [];
    const BASE = 'https://fs2.inven.co.kr/board/fs2';

    for (let page = 1; page <= 20; page++) {
        const { data } = await axios.get(`${BASE}?page=${page}`, { timeout: 10000 });
        const $ = cheerio.load(data);
        const rows = $('table.board_list tr[data-role]');
        if (!rows.length) break;

        rows.each((_, row) => {
            const $row = $(row);
            const title = $row.find('.subject-link').text().trim();
            const link = $row.find('.subject-link').attr('href');
            const id = link.split('/').pop();
            const date = $row.find('.date').text().trim();        // YYYY-MM-DD
            const up = parseInt($row.find('.vote').text() || '0', 10);
            const cmt = parseInt($row.find('.replyNum').text() || '0', 10);

            const post = { id: `inv-${id}`, title, content: title, date, link, upvotes: up, comments: cmt };
            if (match(post) && date >= event.start && date <= event.end) results.push(post);
        });
        await delay();
    }
    return results;
}
