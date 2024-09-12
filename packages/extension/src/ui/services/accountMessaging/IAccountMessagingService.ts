import {
  BaseWalletAccount,
  CreateAccountType,
  SignerType,
} from "../../../shared/wallet.model"

export interface IAccountMessagingService {
  getPrivateKey: (account: BaseWalletAccount) => Promise<string>
  getSeedPhrase: () => Promise<string>
  changeGuardian: (
    account: BaseWalletAccount,
    guardian: string,
  ) => Promise<void>
  cancelEscape: (account: BaseWalletAccount) => Promise<void>
  triggerEscapeGuardian: (account: BaseWalletAccount) => Promise<void>
  escapeAndChangeGuardian: (account: BaseWalletAccount) => Promise<void>
  getPublicKey: (account?: BaseWalletAccount) => Promise<string>
  getNextPublicKey: (
    accountType: CreateAccountType,
    signerType: SignerType,
    networkId: string,
  ) => Promise<string>
  getPublicKeysBufferForMultisig(
    start: number,
    buffer: number,
  ): Promise<string[]>
  clearLocalStorageAndRecoverAccounts(password: string): Promise<void>
}
