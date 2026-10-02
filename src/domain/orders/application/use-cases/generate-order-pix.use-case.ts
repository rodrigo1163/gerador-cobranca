import { Either, left, right } from '../../../../core/either'
import { OrderChargeLinksRepository } from '../repositories/order-charge-links-repository'
import { OrdersRepository } from '../repositories/orders-repository'
import {
  PaymentService,
  CreatePixChargeResponse,
} from '../services/payment-service'
import { InvalidPixChargeInputError } from '../errors/invalid-pix-charge-input-error'
import { OrderNotFoundError } from '../errors/order-not-found-error'
import { OrderChargeLink } from '../../enterprise/entities/value-objects/order-charge-link'

interface GenerateOrderPixUseCaseRequest {
  orderId: string
}

type GenerateOrderPixUseCaseResponse = Either<
  OrderNotFoundError | InvalidPixChargeInputError,
  {
    pixCharge: CreatePixChargeResponse
  }
>

export class GenerateOrderPixUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private orderChargeLinksRepository: OrderChargeLinksRepository,
    private paymentService: PaymentService,
  ) { }

  async execute({
    orderId,
  }: GenerateOrderPixUseCaseRequest): Promise<GenerateOrderPixUseCaseResponse> {
    if (!orderId.trim()) {
      return left(new InvalidPixChargeInputError('Order id is required.'))
    }

    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new OrderNotFoundError())
    }

    const pixCharge = await this.paymentService.createPixCharge({
      orderId: order.id.toString(),
      amountInCents: order.amountInCents,
    })

    const orderChargeLink = OrderChargeLink.create({
      orderId: order.id.toString(),
      chargeId: pixCharge.chargeId,
      provider: this.paymentService.provider,
    })

    await this.orderChargeLinksRepository.create(orderChargeLink)

    return right({ pixCharge })
  }
}
