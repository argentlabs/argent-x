import type { TokenWithBalance } from "../../token/__new/types/tokenBalance.model"
import type { BaseWalletAccount, WalletAccount } from "../../wallet.model"
import type { FeeTokenPreference } from "../types/preference.model"

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
