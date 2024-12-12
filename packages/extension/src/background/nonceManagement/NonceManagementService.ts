import type { BigNumberish } from "starknet"
import { num } from "starknet"
import type { IMultisigBackendService } from "../../shared/multisig/service/backend/IMultisigBackendService"
import type { AccountId, BaseWalletAccount } from "../../shared/wallet.model"
import type { INonceManagementService } from "./INonceManagementService"
import type { IObjectStore } from "../../shared/storage/__new/interface"
import type { NonceMap } from "./store"
import type { WalletAccountStarknetService } from "../wallet/account/WalletAccountStarknetService"
import type { Hex } from "@argent/x-shared"
import { hexSchema } from "@argent/x-shared"
import type { WalletAccountSharedService } from "../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { AccountError } from "../../shared/errors/account"

export class NonceManagementService implements INonceManagementService {
  constructor(
    private readonly nonceStore: IObjectStore<NonceMap>,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly accountStarknetService: WalletAccountStarknetService,
    private readonly multisigBackendService: IMultisigBackendService,
  ) {}

  async getNonce(accountId: AccountId): Promise<Hex> {
    const account = await this.accountSharedService.getAccount(accountId)

    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const { local } = await this.nonceStore.get()
    const localNonce = local[accountId]
    const onchainNonce = await this.getOnchainNonce(accountId)

    if (account.type === "multisig") {
      return this.getMultisigNonce(account, onchainNonce)
    }

    if (localNonce && num.toBigInt(localNonce) >= onchainNonce) {
      // If the stored nonce is greater than or equal to the onchain nonce, use the stored nonce
      return localNonce
    }

    // Otherwise, set the stored nonce to the onchain nonce
    // and return the onchain nonce
    await this.setNonce(accountId, onchainNonce)
    return this.hexifyNonce(onchainNonce)
  }

  async increaseLocalNonce(accountId: AccountId): Promise<void> {
    const { local } = await this.nonceStore.get()
    const currentNonce = local[accountId]
    if (currentNonce) {
      const newNonce = this.addNonces(currentNonce, 1)
      return this.setNonce(accountId, newNonce)
    }
  }

  async resetLocalNonce(accountId: AccountId): Promise<void> {
    const { local } = await this.nonceStore.get()
    delete local[accountId]
    await this.nonceStore.set({ local })
  }

  private async getMultisigNonce(
    account: BaseWalletAccount,
    onchainNonce: bigint,
  ): Promise<Hex> {
    const { content } =
      await this.multisigBackendService.fetchMultisigTransactionRequests(
        account,
      )

    if (content.length === 0) {
      return this.hexifyNonce(onchainNonce)
    }

    const maxNonce = Math.max(...content.map((tx) => tx.nonce))
    return this.hexifyNonce(maxNonce + 1) // Increment the nonce by 1 if there are pending transactions
  }

  private async getOnchainNonce(accountId: AccountId): Promise<bigint> {
    try {
      const account =
        await this.accountStarknetService.getStarknetAccount(accountId)
      const result = await account.getNonce()
      return num.toBigInt(result)
    } catch {
      return BigInt(0)
    }
  }

  private async setNonce(accountId: AccountId, nonce: BigNumberish) {
    const { local } = await this.nonceStore.get()
    return this.nonceStore.set({
      local: {
        ...local,
        [accountId]: this.hexifyNonce(nonce),
      },
    })
  }

  private addNonces(aNonce: BigNumberish, bNonce: BigNumberish) {
    return num.toHex(num.toBigInt(aNonce) + num.toBigInt(bNonce))
  }
  private hexifyNonce(nonce: BigNumberish): Hex {
    return hexSchema.parse(num.toHex(nonce))
  }
}
