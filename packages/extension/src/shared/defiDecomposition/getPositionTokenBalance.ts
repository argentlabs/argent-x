import type { BaseTokenWithBalance } from "../token/__new/types/tokenBalance.model"
import type { BaseWalletAccount } from "../wallet.model"
import type { PositionBaseToken } from "./schema"

export const getPositionTokenBalance = (
  account: BaseWalletAccount,
  positionToken: PositionBaseToken,
): BaseTokenWithBalance => {
  return {
    account: account.address,
    address: positionToken.address,
    balance: positionToken.balance,
    networkId: positionToken.networkId,
  }
}
