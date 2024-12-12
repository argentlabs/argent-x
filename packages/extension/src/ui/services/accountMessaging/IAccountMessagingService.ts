import type {
  AccountId,
  BaseWalletAccount,
  CreateAccountType,
  SignerType,
} from "../../../shared/wallet.model"

export interface IAccountMessagingService {
  getPrivateKey: (accountId: AccountId) => Promise<string>
  getSeedPhrase: () => Promise<string>
  changeGuardian: (
    account: BaseWalletAccount,
    guardian: string,
  ) => Promise<void>
  cancelEscape: (account: BaseWalletAccount) => Promise<void>
  triggerEscapeGuardian: (account: BaseWalletAccount) => Promise<void>
  escapeAndChangeGuardian: (account: BaseWalletAccount) => Promise<void>
  getPublicKey: (accountId?: string) => Promise<string>
  getNextPublicKey: (
    accountType: CreateAccountType,
    signerType: SignerType,
    networkId: string,
  ) => Promise<{ index: number; derivationPath: string; publicKey: string }>
  getPublicKeysBufferForMultisig(
    start: number,
    buffer: number,
  ): Promise<string[]>
  clearLocalStorageAndRecoverAccounts(password: string): Promise<void>
}
