import { UseCaseError } from '../../../../core/errors/use-case-error'

export class InvalidPixChargeInputError extends Error implements UseCaseError {
  constructor(message = 'Invalid Pix charge input.') {
    super(message)
  }
}
