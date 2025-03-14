import type { Address } from "@argent/x-shared"
import type { BaseTokenWithBalance } from "../token/__new/types/tokenBalance.model"
import type { PositionBaseToken } from "./schema"

export const getPositionTokenBalance = (
  accountAddress: Address,
  positionToken: PositionBaseToken,
): BaseTokenWithBalance => {
  return {
    account: accountAddress,
    address: positionToken.address,
    balance: positionToken.balance,
    networkId: positionToken.networkId,
  }
}
