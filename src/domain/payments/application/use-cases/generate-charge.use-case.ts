import { Either, left, right } from "../../../../core/either"
import { ResourceNotFoundError } from "../../../../core/errors/errors/resource-not-found-error"
import { Charge } from "../../enterprise/entities/charge"
import { ChargesRepository } from "../repositories/charges-repository"
import { CustomersRepository } from "../repositories/customers-repository"
import { CreateChargeResponse, PaymentService } from "../services/payment-service"

interface GenerateChargeUseCaseRequest {
  customerId: string
  amount: number
  dueDate: Date
  description?: string
}

type GenerateChargeUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    charge: Charge,
    payment: CreateChargeResponse
  }
>
export class GenerateChargeUseCase {
  constructor(
    private chargesRepository: ChargesRepository,
    private customersRepository: CustomersRepository,
    private paymentService: PaymentService
  ) { }

  async execute({
    customerId,
    amount,
    dueDate,
    description,
  }: GenerateChargeUseCaseRequest): Promise<GenerateChargeUseCaseResponse> {

    const customer = await this.customersRepository.findById(customerId)

    if (!customer) {
      return left(new ResourceNotFoundError())
    }

    const charge = Charge.create({
      customerId,
      amount,
      dueDate,
      description,
    })

    const payment = await this.paymentService.createCharge({
      orderId: charge.id.toString(),
      amountInCents: amount * 100,
    })

    charge.attachPayment({
      externalId: payment.externalId,
      paymentUrl: payment.paymentUrl,
    })

    await this.chargesRepository.create(charge)

    return right({
      charge,
      payment
    })
  }
}
