import { BoletoGatewayUnavailableError } from '../../../domain/orders/application/errors/boleto-gateway-unavailable-error';
import { InvalidBoletoGatewayResponseError } from '../../../domain/orders/application/errors/invalid-boleto-gateway-response-error';
import { AsaasBoletoGateway } from './asaas-boleto.gateway';
import { AsaasClient } from './asaas-client';

class FakeAsaasClient extends AsaasClient {
  readonly calls: Array<{
    method: 'GET' | 'POST';
    path: string;
    body?: unknown;
  }> = [];

  fail = false;
  invalidIdentification = false;

  constructor() {
    super('https://api-sandbox.asaas.com/v3', 'test-key');
  }

  override post<T>(path: string, body: unknown): Promise<T> {
    this.calls.push({ method: 'POST', path, body });

    if (this.fail) {
      throw new Error('network failure');
    }

    if (path === '/customers') {
      return Promise.resolve({ id: 'cus_test' } as T);
    }

    if (path === '/payments') {
      const payment = body as { dueDate: string };

      return Promise.resolve({
        id: 'pay_test',
        bankSlipUrl: 'https://sandbox.asaas.com/b/pdf/pay_test',
        dueDate: payment.dueDate,
      } as T);
    }

    throw new Error(`Unexpected POST ${path}`);
  }

  override get<T>(path: string): Promise<T> {
    this.calls.push({ method: 'GET', path });

    if (this.invalidIdentification) {
      return Promise.resolve({ identificationField: '', barCode: '' } as T);
    }

    return Promise.resolve({
      identificationField: '00190000090275928800021932978170187890000005000',
      barCode: '00191878900000050000000002759288002193297817',
    } as T);
  }
}

describe('Asaas boleto gateway', () => {
  const originalCustomerId = process.env.ASAAS_CUSTOMER_ID;

  beforeEach(() => {
    delete process.env.ASAAS_CUSTOMER_ID;
  });

  afterAll(() => {
    if (originalCustomerId === undefined) {
      delete process.env.ASAAS_CUSTOMER_ID;
      return;
    }

    process.env.ASAAS_CUSTOMER_ID = originalCustomerId;
  });

  it('maps an Asaas boleto to the application contract', async () => {
    const client = new FakeAsaasClient();
    const gateway = new AsaasBoletoGateway(client);

    const result = await gateway.createCharge({
      orderId: 'order-1',
      amountInCents: 1500,
      dueDate: '2099-01-15',
    });

    expect(client.calls).toHaveLength(3);
    expect(client.calls[0]).toMatchObject({
      method: 'POST',
      path: '/customers',
    });
    expect(client.calls[0].body).toEqual({
      name: 'Teste E2E Gerador Cobranca',
      cpfCnpj: '24971563792',
      notificationDisabled: true,
    });
    expect(client.calls[1]).toEqual({
      method: 'POST',
      path: '/payments',
      body: {
        customer: 'cus_test',
        billingType: 'BOLETO',
        value: 15,
        dueDate: '2099-01-15',
        externalReference: 'order-1',
      },
    });
    expect(client.calls[2]).toEqual({
      method: 'GET',
      path: '/payments/pay_test/identificationField',
    });
    expect(result).toEqual({
      chargeId: 'pay_test',
      barcode: '00191878900000050000000002759288002193297817',
      digitableLine: '00190000090275928800021932978170187890000005000',
      boletoUrl: 'https://sandbox.asaas.com/b/pdf/pay_test',
      dueDate: '2099-01-15',
    });
  });

  it('rejects an invalid Asaas identification response', async () => {
    const client = new FakeAsaasClient();
    client.invalidIdentification = true;
    const gateway = new AsaasBoletoGateway(client);

    await expect(
      gateway.createCharge({
        orderId: 'order-1',
        amountInCents: 1500,
        dueDate: '2099-01-15',
      }),
    ).rejects.toBeInstanceOf(InvalidBoletoGatewayResponseError);
  });

  it('maps transport failures to a gateway unavailable error', async () => {
    const client = new FakeAsaasClient();
    client.fail = true;
    const gateway = new AsaasBoletoGateway(client);

    await expect(
      gateway.createCharge({
        orderId: 'order-1',
        amountInCents: 1500,
        dueDate: '2099-01-15',
      }),
    ).rejects.toBeInstanceOf(BoletoGatewayUnavailableError);
  });
});
