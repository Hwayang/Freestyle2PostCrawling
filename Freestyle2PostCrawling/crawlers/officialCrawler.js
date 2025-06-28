import axios from 'axios';
import cheerio from 'cheerio';

/* 공식 이벤트 공지 → [{ title, start, end }] */
export async function fetchOfficialEvents() {
    const BASE = 'https://fs2.joycity.com/event';
    const { data: html } = await axios.get(BASE);
    const $ = cheerio.load(html);

    const list = [];
    $('.event-list li').each((_, li) => {
        const title = $(li).find('.tit').text().trim();
        const url = 'https://fs2.joycity.com' + $(li).find('a').attr('href');
        const date = $(li).find('.date').text().trim();          // 2025.06.01 ~ 2025.06.14
        const [start, end] = date.split('~').map(s => s.replace(/\./g, '-').trim());

        list.push({ title, start, end, url });
    });
    return list;
}
