import { Charge } from "../../enterprise/entities/charge";

export abstract class ChargesRepository {
  abstract findById(id: string): Promise<Charge | null>
  abstract create(charge: Charge): Promise<void>
}