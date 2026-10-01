import { UniqueEntityId } from '../../../../core/entities/unique-entity-id'
import { GeneratePixCharge } from '../services/generate-pix-charge'
import { GenerateOrderPixUseCase } from './generate-order-pix.use-case'
import { InMemoryOrderChargeLinksRepository } from '../../../../test/repositories/in-memory-order-charge-links-repository'
import { InMemoryOrderRepository } from '../../../../test/repositories/in-memory-order-repository'
import { makeOrder } from '../../../../test/factories/make-order'

class FakeGeneratePixCharge implements GeneratePixCharge {
  readonly provider = 'ABACATEPAY' as const
  public calls: Array<{ orderId: string; amountInCents: number }> = []

  async execute(params: { orderId: string; amountInCents: number }) {
    this.calls.push(params)

    return {
      chargeId: `charge-${params.orderId}`,
      pixCopyPaste: `pix-${params.orderId}`,
      qrCodeDataUrl: `data:image/png;base64,qr-${params.orderId}`,
    }
  }
}

describe('Generate order Pix', () => {
  it('generates a Pix charge using the order amount in cents', async () => {
    const ordersRepository = new InMemoryOrderRepository()
    const linksRepository = new InMemoryOrderChargeLinksRepository()
    const pixGateway = new FakeGeneratePixCharge()
    const order = makeOrder({}, new UniqueEntityId('order-1'))

    await ordersRepository.create(order)

    const sut = new GenerateOrderPixUseCase(
      ordersRepository,
      linksRepository,
      pixGateway,
    )

    const result = await sut.execute({ orderId: order.id.toString() })

    expect(result.isRight()).toBe(true)
    expect(pixGateway.calls).toEqual([
      {
        orderId: 'order-1',
        amountInCents: 1000,
      },
    ])
    expect(result.value).toEqual({
      chargeId: 'charge-order-1',
      pixCopyPaste: 'pix-order-1',
      qrCodeDataUrl: 'data:image/png;base64,qr-order-1',
    })
    expect(linksRepository.items).toHaveLength(1)
    expect(linksRepository.items[0].orderId).toBe('order-1')
    expect(linksRepository.items[0].chargeId).toBe('charge-order-1')
    expect(linksRepository.items[0].provider).toBe('ABACATEPAY')
    expect(order.status).toBe('PENDING_PAYMENT')
  })

  it('does not generate Pix for a missing order', async () => {
    const pixGateway = new FakeGeneratePixCharge()
    const sut = new GenerateOrderPixUseCase(
      new InMemoryOrderRepository(),
      new InMemoryOrderChargeLinksRepository(),
      pixGateway,
    )

    const result = await sut.execute({ orderId: 'missing-order' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toMatchObject({ message: 'Order not found.' })
    expect(pixGateway.calls).toHaveLength(0)
  })

  it('rejects an empty order id', async () => {
    const pixGateway = new FakeGeneratePixCharge()
    const sut = new GenerateOrderPixUseCase(
      new InMemoryOrderRepository(),
      new InMemoryOrderChargeLinksRepository(),
      pixGateway,
    )

    const result = await sut.execute({ orderId: ' ' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toMatchObject({ message: 'Order id is required.' })
    expect(pixGateway.calls).toHaveLength(0)
  })
})
