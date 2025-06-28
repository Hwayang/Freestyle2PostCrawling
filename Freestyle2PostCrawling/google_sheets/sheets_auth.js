import { google } from 'googleapis';
import 'dotenv/config';

/* 서비스 계정 인증 */
export default function getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    return google.sheets({ version: 'v4', auth });
}
