import {
  apiRequest,
  PLUNK_TEMPLATE_ID,
  PLUNK_TOKEN,
  type TransactionalEmailEvent,
} from "./httpClientPlunk";

const BASE_URL = "https://next-api.useplunk.com";

// --- SERVICE PLUNK ---
export const plunk = {
  // Prévu pour d'autres actions du système (factures, notifications, etc.)
  sendTransactional: (data: TransactionalEmailEvent) =>
    apiRequest({
      baseUrl: BASE_URL,
      endpoint: "/v1/send",
      method: "POST",
      token: PLUNK_TOKEN,
      body: data,
    }),

  sendMagicLink: (to: string, url: string, lang: string = "en") =>
    apiRequest({
      baseUrl: BASE_URL,
      endpoint: "/v1/send",
      method: "POST",
      token: PLUNK_TOKEN,
      body: {
        to,
        template: PLUNK_TEMPLATE_ID,
        event: "auth.magic_link",
        lang,
        data: {
          url: {
            value: url,
            persistent: false,
          },
        },
      } satisfies TransactionalEmailEvent,
    }),
};
