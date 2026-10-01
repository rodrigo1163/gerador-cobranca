import { makeCustomer } from "../../../../test/factories/make-customer"
import { InMemoryChargeRepository } from "../../../../test/repositories/in-memory-charge-repository"
import { InMemoryCustomerRepository } from "../../../../test/repositories/in-memory-customer-repository"
import { FakePaymentService } from "../../../../test/services/fake-payment-service"
import { ResourceNotFoundError } from "../../../../core/errors/errors/resource-not-found-error"
import { GenerateChargeUseCase } from "./generate-charge.use-case"

let inMemoryChargeRepository: InMemoryChargeRepository
let inMemoryCustomerRepository: InMemoryCustomerRepository
let fakePaymentService: FakePaymentService

let sut: GenerateChargeUseCase

describe('Register Charge', () => {
  beforeEach(() => {
    inMemoryChargeRepository = new InMemoryChargeRepository()
    inMemoryCustomerRepository = new InMemoryCustomerRepository()
    fakePaymentService = new FakePaymentService()
    sut = new GenerateChargeUseCase(inMemoryChargeRepository, inMemoryCustomerRepository, fakePaymentService)
  })

  it('should be able to register a new charge', async () => {
    const customer = makeCustomer()

    inMemoryCustomerRepository.items.push(customer)

    const result = await sut.execute({
      customerId: customer.id.toString(),
      amount: 100,
      dueDate: new Date('2026-10-10'),
      description: 'Mensalidade',
    })

    expect(result.isRight()).toBe(true)

    expect(inMemoryChargeRepository.items).toHaveLength(1)

    const charge = inMemoryChargeRepository.items[0]

    expect(charge.customerId).toBe(customer.id.toString())
    expect(charge.amount).toBe(100)
    expect(charge.dueDate).toEqual(new Date('2026-10-10'))
    expect(charge.description).toBe('Mensalidade')
    expect(charge.status).toBe('PENDING')

    expect(charge.externalId).toBe(
      `fake-${charge.id.toString()}`,
    )

    expect(charge.paymentUrl).toBe(
      `https://fake-payment.test/${charge.id.toString()}`,
    )

    expect(result.value).toMatchObject({
      charge,
      payment: {
        externalId: `fake-${charge.id.toString()}`,
        paymentUrl: `https://fake-payment.test/${charge.id.toString()}`,
      },
    })
  })

  it('should not be able to generate a charge for a non-existing customer', async () => {
    const result = await sut.execute({
      customerId: 'non-existing-customer-id',
      amount: 100,
      dueDate: new Date('2026-10-10'),
      description: 'Mensalidade',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(inMemoryChargeRepository.items).toHaveLength(0)
    expect(fakePaymentService.createChargeCalls).toHaveLength(0)
  })

  it('should create the payment with the amount in cents', async () => {
    const customer = makeCustomer()
    inMemoryCustomerRepository.items.push(customer)

    const result = await sut.execute({
      customerId: customer.id.toString(),
      amount: 100,
      dueDate: new Date('2026-10-10'),
    })

    expect(result.isRight()).toBe(true)
    expect(fakePaymentService.createChargeCalls).toHaveLength(1)

    const charge = inMemoryChargeRepository.items[0]
    const paymentCall = fakePaymentService.createChargeCalls[0]

    expect(paymentCall.amountInCents).toBe(10000)
    expect(paymentCall.orderId).toBe(charge.id.toString())
  })

  it('should not persist the charge when payment creation fails', async () => {
    const customer = makeCustomer()
    inMemoryCustomerRepository.items.push(customer)

    vi.spyOn(fakePaymentService, 'createCharge').mockRejectedValueOnce(
      new Error('Payment service unavailable'),
    )

    await expect(
      sut.execute({
        customerId: customer.id.toString(),
        amount: 100,
        dueDate: new Date('2026-10-10'),
      }),
    ).rejects.toThrow('Payment service unavailable')

    expect(inMemoryChargeRepository.items).toHaveLength(0)
  })
})
