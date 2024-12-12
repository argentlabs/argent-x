import type { Address, Hex } from "@argent/x-shared"
import type {
  ImportValidationResult,
  ValidatedImport,
} from "../../../shared/accountImport/types"
import type { messageClient } from "../trpc"
import type { IAccountImportClientService } from "./IClientImportAccount"

export class AccountImportClientService implements IAccountImportClientService {
  constructor(private trpcMessageClient: typeof messageClient) {}

  async validateImport(
    address: Address,
    pk: Hex,
    networkId: string,
  ): Promise<ImportValidationResult> {
    return this.trpcMessageClient.importAccount.validate.query({
      address,
      pk,
      networkId,
    })
  }

  async importAccount(account: ValidatedImport) {
    return this.trpcMessageClient.importAccount.import.mutate(account)
  }
}
