import { Module } from "@nestjs/common";
import { GenerateOrderPixController } from "./http/controllers/generate-order-pix.controller";
import { GenerateOrderPixUseCase } from "../domain/orders/application/use-cases/generate-order-pix.use-case";

@Module({
  controllers: [
    GenerateOrderPixController
  ],
  providers: [GenerateOrderPixUseCase],
})
export class HttpModule { }
