import getSheetsClient from './sheets_auth.js';
import 'dotenv/config';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

/* 시트 title → sheetId 검색 */
export async function findSheetIdByName(name) {
    const sheets = getSheetsClient();
    const meta = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        fields: 'sheets(properties(sheetId,title))'
    });
    const hit = meta.data.sheets.find(s => s.properties.title === name);
    return hit?.properties.sheetId ?? null;
}

/* EventList_Template 복제 → Event_{Title} 시트 생성 */
export async function createEventSheet(eventTitle) {
    const sheets = getSheetsClient();
    const templateId = await findSheetIdByName('EventList_Template');
    if (!templateId) throw new Error('EventList_Template 시트 없음');

    const copy = await sheets.spreadsheets.sheets.copyTo({
        spreadsheetId: SPREADSHEET_ID,
        sheetId: templateId,
        requestBody: { destinationSpreadsheetId: SPREADSHEET_ID }
    });

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [{
                updateSheetProperties: {
                    properties: { sheetId: copy.data.sheetId, title: `Event_${eventTitle}` },
                    fields: 'title'
                }
            }]
        }
    });
}
