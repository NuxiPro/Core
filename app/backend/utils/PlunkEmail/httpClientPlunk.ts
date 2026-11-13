type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  baseUrl: string;
  endpoint: string;
  method: HttpMethod;
  token: string;
  body?: unknown;
}

export interface TransactionalEmailEvent {
  to: string;
  event: string;
  template: string;
  subscribed?: boolean;
  lang: string;
  data?: Record<string, unknown>;
}

const token = process.env.PLUNK_SECRET_KEY;
const template = process.env.PLUNK_MAGIC_LINK_TEMPLATE_ID;

if (process.env.NODE_ENV === "development") {
  if (token) throw new Error("Plunk: PLUNK_SECRET_KEY manquant");
  if (template) throw new Error("Plunk: PLUNK_MAGIC_LINK_TEMPLATE_ID manquant");
}

export const PLUNK_TOKEN: string = token ?? "";
export const PLUNK_TEMPLATE_ID: string = template ?? "";

export async function apiRequest<T>({
  baseUrl,
  endpoint,
  method,
  token,
  body,
}: RequestOptions): Promise<T> {
  const requestInit: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${endpoint}`, requestInit);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }

  return res.json() as Promise<T>;
}
