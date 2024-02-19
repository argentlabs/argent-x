import { TokenWithBalance } from "../../token/__new/types/tokenBalance.model"
import { BaseWalletAccount, WalletAccount } from "../../wallet.model"
import { FeeTokenPreference } from "../types/preference.model"

export interface IFeeTokenService {
  getFeeTokens(
    account: BaseWalletAccount & Pick<WalletAccount, "classHash">,
  ): Promise<TokenWithBalance[]>
  getBestFeeToken(
    account: BaseWalletAccount & Pick<WalletAccount, "classHash">,
  ): Promise<TokenWithBalance>
  getFeeTokenPreference(): Promise<FeeTokenPreference>
  preferFeeToken(tokenAddress: string): Promise<void>
}
