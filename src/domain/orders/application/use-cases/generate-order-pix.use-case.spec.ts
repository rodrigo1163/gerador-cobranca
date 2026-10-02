import { makeOrder } from '../../../../test/factories/make-order'
import { FakePaymentService } from '../../../../test/services/fake-payment-service'
import { InMemoryOrderChargeLinksRepository } from '../../../../test/repositories/in-memory-order-charge-links-repository'
import { InMemoryOrderRepository } from '../../../../test/repositories/in-memory-order-repository'
import { GenerateOrderPixUseCase } from './generate-order-pix.use-case'
import { InvalidChargeAmountError } from '../errors/invalid-charge-amount-error'

let inMemoryOrderRepository: InMemoryOrderRepository
let inMemoryOrderChargeLinksRepository: InMemoryOrderChargeLinksRepository
let fakePaymentService: FakePaymentService
let sut: GenerateOrderPixUseCase

describe('Generate order Pix', () => {
  beforeEach(() => {
    inMemoryOrderRepository = new InMemoryOrderRepository()
    inMemoryOrderChargeLinksRepository =
      new InMemoryOrderChargeLinksRepository()
    fakePaymentService = new FakePaymentService()

    sut = new GenerateOrderPixUseCase(
      inMemoryOrderRepository,
      inMemoryOrderChargeLinksRepository,
      fakePaymentService,
    )
  })

  it('should be able to generate a Pix charge for an order', async () => {
    const order = makeOrder()
    await inMemoryOrderRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      pixCharge: {
        chargeId: `charge-${order.id.toString()}`,
        pixCopyPaste: `pix-${order.id.toString()}`,
        qrCodeDataUrl: `data:image/png;base64,qr-${order.id.toString()}`,
      },
    })
    expect(fakePaymentService.calls).toEqual([
      {
        orderId: order.id.toString(),
        amountInCents: 1000,
      },
    ])
    expect(inMemoryOrderChargeLinksRepository.items).toHaveLength(1)
    expect(inMemoryOrderChargeLinksRepository.items[0].orderId).toBe(
      order.id.toString(),
    )
    expect(inMemoryOrderChargeLinksRepository.items[0].chargeId).toBe(
      `charge-${order.id.toString()}`,
    )
    expect(inMemoryOrderChargeLinksRepository.items[0].provider).toBe(
      'ABACATEPAY',
    )
    expect(order.status).toBe('PENDING_PAYMENT')
  })

  it('should not generate Pix for a non-existing order', async () => {
    const result = await sut.execute({
      orderId: 'non-existing-order-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toMatchObject({
      message: 'Order not found.',
    })
    expect(fakePaymentService.calls).toHaveLength(0)
  })

  it('should not generate Pix when the order id is empty', async () => {
    const result = await sut.execute({
      orderId: ' ',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toMatchObject({
      message: 'Order id is required.',
    })
    expect(fakePaymentService.calls).toHaveLength(0)
  })

  it('should reject an invalid order amount before calling the payment service', async () => {
    const order = makeOrder({ amountInCents: 99 })
    await inMemoryOrderRepository.create(order)

    const result = await sut.execute({ orderId: order.id.toString() })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidChargeAmountError)
    expect(fakePaymentService.calls).toHaveLength(0)
    expect(inMemoryOrderChargeLinksRepository.items).toHaveLength(0)
    expect(order.status).toBe('PENDING_PAYMENT')
  })
})
