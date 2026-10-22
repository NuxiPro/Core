// ./plunk.ts
import { apiRequest } from './httpClientPlunk';

const BASE_URL = 'https://api.useplunk.com/v1';
const TOKEN = process.env.PLUNK_SECRET_KEY || '';

// --- TYPES ---
interface TransactionalEmailPayload {
  to: string;
  templateId: string;
}

// --- SERVICE PLUNK ---
export const plunk = {
    // 1. Emails Transactionnels
    sendTransactional: (data: TransactionalEmailPayload) =>
        apiRequest({
            baseUrl: BASE_URL,
            endpoint: '/send',
            method: 'POST',
            token: TOKEN,
            body: data
        }),
};
