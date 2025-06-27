const crawlOfficial = require('./crawlers/official');
const crawlCommunity = require('./crawlers/community');
const { updateEventList, createEventSheet } = require('./google_sheets/sheets_api');

async function main() {
    const events = await crawlOfficial(); // ���� �̺�Ʈ ���

    for (const event of events) {
        await updateEventList(event); // EventList ����
        await createEventSheet(event.title); // {EventTitle}_EventData ��Ʈ ����
        await crawlCommunity(event); // �κ�, �縮��, DC ũ�Ѹ��Ͽ� �̺�Ʈ ��Ʈ ä���
    }
}

main();