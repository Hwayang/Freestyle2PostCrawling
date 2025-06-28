import axios from 'axios';
import cheerio from 'cheerio';
import { delay } from '../utils/throttler.js';

export async function crawlDC(event, match) {
    const results = [];
    const BASE = 'https://m.dcinside.com/board/freestyle2';

    for (let page = 1; page <= 30; page++) {
        const { data } = await axios.get(`${BASE}?page=${page}`);
        const $ = cheerio.load(data);

        $('ul.gall-li').each((_, li) => {
            const $li = $(li);
            const title = $li.find('.gall-tit').text().trim();
            const link = 'https://m.dcinside.com' + $li.find('a').attr('href');
            const id = link.split('/').pop();
            const date = $li.find('.gall-date').attr('title').slice(0, 10);   // YYYY-MM-DD
            const up = parseInt($li.find('.gall-recommend').text() || '0', 10);
            const cmt = parseInt($li.find('.reply-num').text().replace(/\D/g, '') || '0', 10);

            const post = { id: `dc-${id}`, title, content: title, date, link, upvotes: up, comments: cmt };
            if (match(post) && date >= event.start && date <= event.end) results.push(post);
        });
        await delay();
    }
    return results;
}
