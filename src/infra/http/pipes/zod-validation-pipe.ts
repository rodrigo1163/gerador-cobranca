import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, type output as ZodOutput, ZodType } from 'zod';

export class ZodValidationPipe<TSchema extends ZodType>
  implements PipeTransform<unknown, ZodOutput<TSchema>>
{
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): ZodOutput<TSchema> {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.issues.map((issue) => issue.message));
      }

      throw error;
    }
  }
}
