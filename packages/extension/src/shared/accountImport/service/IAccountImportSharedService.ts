import type { Address, Hex } from "@argent/x-shared"
import type { WalletAccount } from "../../wallet.model"
import type { ValidatedImport, ImportValidationResult } from "../types"

export interface IAccountImportSharedService {
  validateImport: (
    address: Address,
    pk: Hex,
    networkId: string,
  ) => Promise<ImportValidationResult>

  importAccount: (
    validatedAccount: ValidatedImport,
    password: string,
  ) => Promise<WalletAccount>
}
