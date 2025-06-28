import getSheetsClient from './sheets_auth.js';
import { createEventSheet } from './sheets_utils.js';
import { suggestCategories } from '../utils/keywordHelper.js';
import 'dotenv/config';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'EventList';

export async function upsertEventRows(eventArray) {
    const sheets = getSheetsClient();

    /* 1. ���� ���� �������� */
    const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:A`
    });
    const existing = new Set(data.values?.flat() || []);

    /* 2. �ű� �̺�Ʈ�� */
    const newEvents = eventArray.filter(ev => !existing.has(ev.title));
    if (!newEvents.length) return;

    const startRow = (data.values?.length || 0) + 2;   // 1�� �Ӹ���
    const rows = [];

    for (const [idx, ev] of newEvents.entries()) {
        await createEventSheet(ev.title);

        const cats = suggestCategories(ev.title).join(', ');
        rows.push([
            ev.title,
            `${ev.start} ~ ${ev.end}`,
            '', '',                                  // MCU, ACU
            cats,
            `=SPARKLINE(SPLIT(E${startRow + idx},", "),{"charttype","bar"})`
        ]);
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:F`,
        valueInputOption: 'RAW',
        requestBody: { values: rows }
    });
}
