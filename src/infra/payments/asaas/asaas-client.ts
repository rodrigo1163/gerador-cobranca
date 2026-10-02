export class AsaasClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) { }

  async post<T>(
    path: string,
    body: unknown,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyApplication/1.0',
        access_token: this.apiKey,
      },

      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(
        `Asaas request failed: ${response.status}`,
      )
    }

    return response.json() as Promise<T>
  }

  async get<T>(
    path: string,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyApplication/1.0',
        access_token: this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(
        `Asaas request failed: ${response.status}`,
      )
    }

    return response.json() as Promise<T>
  }
}