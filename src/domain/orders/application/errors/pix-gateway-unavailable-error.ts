import { UseCaseError } from '../../../../core/errors/use-case-error'

export class PixGatewayUnavailableError extends Error implements UseCaseError {
  constructor(message = 'Pix gateway is unavailable.') {
    super(message)
  }
}
