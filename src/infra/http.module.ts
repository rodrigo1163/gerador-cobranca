import { Module } from "@nestjs/common";
import { GenerateOrderPixController } from "./http/controllers/generate-order-pix.controller";
import { GenerateOrderPixUseCase } from "../domain/orders/application/use-cases/generate-order-pix.use-case";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [
    GenerateOrderPixController
  ],
  providers: [GenerateOrderPixUseCase],
})
export class HttpModule { }
