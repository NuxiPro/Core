// ./httpClientPlunk.ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
    baseUrl: string;
    endpoint: string;
    method: HttpMethod;
    token: string;
    body?: unknown;
}

export async function apiRequest<T>({ baseUrl, endpoint, method, token, body }: RequestOptions): Promise<T> {
    const res = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error [${res.status}]: ${errorText}`);
    }

    return res.json() as Promise<T>;
}
