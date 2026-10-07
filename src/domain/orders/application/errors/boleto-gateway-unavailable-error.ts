import { UseCaseError } from '../../../../core/errors/use-case-error';

export class BoletoGatewayUnavailableError
  extends Error
  implements UseCaseError
{
  constructor(message = 'Boleto gateway is unavailable.') {
    super(message);
  }
}
