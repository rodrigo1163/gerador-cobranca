
export class AbacatePayClient {
  private readonly baseUrl = 'https://api.abacatepay.com'

  constructor(
    private readonly apiKey: string = process.env.ABACATEPAY_API_KEY ?? '',
  ) {
    if (!apiKey) {
      throw new Error('ABACATEPAY_API_KEY is required')
    }
  }

  async post<T>(
    path: string,
    body: unknown,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`AbacatePay request failed: ${response.status}`)
    }

    return response.json() as Promise<T>
  }
}
