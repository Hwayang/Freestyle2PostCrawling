import getSheetsClient from './sheets_auth.js';
import { createEventSheet } from './sheets_utils.js';
import 'dotenv/config';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

export async function writeEventData(event, postList) {
    const sheets = getSheetsClient();
    const sheetTitle = `Event_${event.title}`;

    /* 필요 시 템플릿 복제 */
    if (!await findSheetIdOrNull(sheetTitle)) await createEventSheet(event.title);

    /* 시트 본문 데이터 준비 */
    const values = postList.map(p => [
        p.id,
        p.title,
        p.date,
        Array.isArray(p.keywords) ? p.keywords.join(', ') : '',
        p.link,
        p.upvotes,
        p.comments
    ]);

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetTitle}!B6:H${6 + values.length}`,
        valueInputOption: 'RAW',
        requestBody: { values }
    });

    /* 머리쪽 이벤트 기간/일수 기입 */
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetTitle}!G2:I2`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[event.start, event.end, `=DATEDIF(G2,H2,"D")+1`]]
        }
    });
}

/* 내부 유틸 */
async function findSheetIdOrNull(title) {
    const sheets = getSheetsClient();
    const meta = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        fields: 'sheets(properties(sheetId,title))'
    });
    return meta.data.sheets.find(s => s.properties.title === title)?.properties.sheetId || null;
}
