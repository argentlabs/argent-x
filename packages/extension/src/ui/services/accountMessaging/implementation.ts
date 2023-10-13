import { messageClient } from "../messaging/trpc"
import { IAccountMessagingService } from "./interface"
import {
  BaseWalletAccount,
  baseWalletAccountSchema,
} from "../../../shared/wallet.model"
import { decryptFromBackground, generateEncryptedSecret } from "../crypto"

export class AccountMessagingService implements IAccountMessagingService {
  async getPrivateKey(account: BaseWalletAccount) {
    const { secret, encryptedSecret } = await generateEncryptedSecret()

    const encryptedPrivateKey =
      await messageClient.accountMessaging.getEncryptedPrivateKey.mutate({
        account,
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
  async getPublicKey(account?: BaseWalletAccount) {
    let parsedAccount = account

    // account is optional, if we don't pass it, we will use selected account
    if (parsedAccount) {
      parsedAccount = baseWalletAccountSchema.parse(account)
    }

    return messageClient.accountMessaging.getPublicKey.query({
      account: parsedAccount,
    })
  }

  // Cannot be cached as it is network dependent
  async getNextPublicKeyForMultisig(networkId: string) {
    return messageClient.accountMessaging.getNextPublicKeyForMultisig.mutate({
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
}
