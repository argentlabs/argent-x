import {
  AddSmartAccountRequest,
  AddSmartAccountResponse,
} from "@argent/x-shared"
import type { Flow } from "./schema"

export interface IArgentAccountService {
  addGuardianToAccount(): Promise<string>
  addSmartAccount(
    request: AddSmartAccountRequest,
  ): Promise<AddSmartAccountResponse>
  validateAccount(flow: Flow): Promise<void>
  confirmEmail(code: string): Promise<void>
  requestEmail(email: string): Promise<void>
  isTokenExpired(): Promise<boolean>
}
