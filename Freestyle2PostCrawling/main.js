const crawlOfficial = require('./crawlers/official');
const crawlCommunity = require('./crawlers/community');
const { updateEventList, createEventSheet } = require('./google_sheets/sheets_api');

async function main() {
    const events = await crawlOfficial(); // 공식 이벤트 목록

    for (const event of events) {
        await updateEventList(event); // EventList 갱신
        await createEventSheet(event.title); // {EventTitle}_EventData 시트 생성
        await crawlCommunity(event); // 인벤, 루리웹, DC 크롤링하여 이벤트 시트 채우기
    }
}

main();