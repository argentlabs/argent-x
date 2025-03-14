import browser from "webextension-polyfill"
import { messageClient } from "../trpc"
import type { IAccountMessagingService } from "./IAccountMessagingService"
import type {
  AccountId,
  BaseWalletAccount,
  CreateAccountType,
  SignerType,
} from "../../../shared/wallet.model"
import { baseWalletAccountSchema } from "../../../shared/wallet.model"
import { decryptFromBackground, generateEncryptedSecret } from "../crypto"
import { resetDevice } from "../../../shared/smartAccount/jwt"
import { clientRecoveryService } from "../recovery"
import type { IRecoveryStorage } from "../../../shared/recovery/types"
import type { IObjectStore } from "../../../shared/storage/__new/interface"
import { recoveredAtKeyValueStore } from "../../../shared/recovery/storage"
import { ampli } from "../../../shared/analytics"

export class AccountMessagingService implements IAccountMessagingService {
  constructor(private recoveryStore: IObjectStore<IRecoveryStorage>) {}
  async getPrivateKey(accountId: AccountId) {
    const { secret, encryptedSecret } = await generateEncryptedSecret()

    const encryptedPrivateKey =
      await messageClient.accountMessaging.getEncryptedPrivateKey.mutate({
        accountId,
        encryptedSecret,
      })

    return await decryptFromBackground(encryptedPrivateKey, secret)
  }

  async getSeedPhrase() {
    const { secret, encryptedSecret } = await generateEncryptedSecret()

    const encryptedSeedPhrase =
      await messageClient.accountMessaging.getEncryptedSeedPhrase.mutate({
        encryptedSecret,
      })

    return await decryptFromBackground(encryptedSeedPhrase, secret)
  }

  async changeGuardian(account: BaseWalletAccount, guardian: string) {
    const parsedAccount = baseWalletAccountSchema.parse(account)

    return messageClient.accountMessaging.changeGuardian.mutate({
      account: parsedAccount,
      guardian,
    })
  }

  async cancelEscape(account: BaseWalletAccount) {
    const parsedAccount = baseWalletAccountSchema.parse(account)

    return messageClient.accountMessaging.cancelEscape.mutate({
      account: parsedAccount,
    })
  }

  async triggerEscapeGuardian(account: BaseWalletAccount) {
    const parsedAccount = baseWalletAccountSchema.parse(account)

    return messageClient.accountMessaging.triggerEscapeGuardian.mutate({
      account: parsedAccount,
    })
  }

  async escapeAndChangeGuardian(account: BaseWalletAccount) {
    const parsedAccount = baseWalletAccountSchema.parse(account)

    return messageClient.accountMessaging.escapeAndChangeGuardian.mutate({
      account: parsedAccount,
    })
  }

  // Can be cached
  async getPublicKey(accountId?: string) {
    return messageClient.accountMessaging.getPublicKey.query({ accountId })
  }

  // Cannot be cached as it is network dependent
  async getNextPublicKey(
    accountType: CreateAccountType,
    signerType: SignerType,
    networkId: string,
  ) {
    return messageClient.accountMessaging.getNextPublicKey.mutate({
      accountType,
      signerType,
      networkId,
    })
  }

  // Can be cached
  async getPublicKeysBufferForMultisig(start: number, buffer: number) {
    return messageClient.accountMessaging.getPublicKeysBufferForMultisig.query({
      start,
      buffer,
    })
  }

  async getDeploymentData() {
    return messageClient.accountMessaging.getAccountDeploymentPayload.query()
  }

  async clearLocalStorageAndRecoverAccounts(password: string) {
    const { promise } = ampli.walletLocalStorageCleared({
      "wallet platform": "browser extension",
    })
    await promise

    await this.recoveryStore.set({ isClearingStorage: true })
    const seedPhrase = await this.getSeedPhrase()
    try {
      await browser.storage.sync.clear()
      await browser.storage.managed.clear()
      await browser.storage.session.clear()
    } catch (e) {
      console.log(e)
      // Ignore browser.storage.session error "This is a read-only store"
    }
    try {
      await resetDevice()
      localStorage.clear()
      await clientRecoveryService.bySeedPhrase(seedPhrase, password)
      await this.recoveryStore.set({ isClearingStorage: false })
      void recoveredAtKeyValueStore.set("lastRecoveredAt", Date.now())
    } catch {
      await this.recoveryStore.set({ isClearingStorage: false })
    }
  }
}
