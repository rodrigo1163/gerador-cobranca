import { UseCaseError } from '../../../../core/errors/use-case-error';

export class InvalidBoletoGatewayResponseError
  extends Error
  implements UseCaseError
{
  constructor(message = 'Boleto gateway returned an invalid response.') {
    super(message);
  }
}
