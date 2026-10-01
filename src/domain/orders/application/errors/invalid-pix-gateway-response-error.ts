import { UseCaseError } from '../../../../core/errors/use-case-error'

export class InvalidPixGatewayResponseError extends Error implements UseCaseError {
  constructor(message = 'Pix gateway returned an invalid response.') {
    super(message)
  }
}
