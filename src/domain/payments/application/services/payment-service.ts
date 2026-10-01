export interface CreateChargeParams {
  chargeId: string
  customer: {
    id: string
    name: string
    document: string
    email?: string
  }
  amount: number
  dueDate: Date
  description?: string
}

export interface CreateChargeResponse {
  externalId: string
  paymentUrl: string
}

export abstract class PaymentService {
  abstract createCharge(
    params: CreateChargeParams,
  ): Promise<CreateChargeResponse>
}