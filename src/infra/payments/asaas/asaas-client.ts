export class AsaasClient {
  constructor(
    private readonly baseUrl: string = process.env.ASAAS_BASE_URL ??
      'https://api-sandbox.asaas.com/v3',
    private readonly apiKey: string = process.env.ASAAS_API_KEY ?? '',
  ) {
    if (!apiKey.trim()) {
      throw new Error('ASAAS_API_KEY is required');
    }
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GeradorCobranca/1.0.0 (Node.js)',
        access_token: this.apiKey,
      },

      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Asaas request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GeradorCobranca/1.0.0 (Node.js)',
        access_token: this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Asaas request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}
