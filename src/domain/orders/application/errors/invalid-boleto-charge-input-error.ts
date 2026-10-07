import { UseCaseError } from '../../../../core/errors/use-case-error';

export class InvalidBoletoChargeInputError
  extends Error
  implements UseCaseError
{
  constructor(message = 'Invalid boleto charge input.') {
    super(message);
  }
}
