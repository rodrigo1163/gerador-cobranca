import { UseCaseError } from '../../../../core/errors/use-case-error';

export class InvalidChargeAmountError extends Error implements UseCaseError {
  constructor() {
    super('Charge amount must be at least 100 cents.');
  }
}
