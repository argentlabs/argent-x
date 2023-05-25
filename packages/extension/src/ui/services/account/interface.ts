import { CreateAccountType, WalletAccount } from "../../../shared/wallet.model"

export interface IAccountService {
  // TODO: redefine Account model
  createAccount(
    networkId: string,
    type: CreateAccountType,
  ): Promise<WalletAccount>
}
