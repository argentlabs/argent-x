import type { Address } from "@argent/x-shared"
import {
  getAccountTxVersion,
  getNativeFeeTokenAddress,
  STRK_TOKEN_ADDRESS,
  type TokenWithBalance,
} from "@argent/x-shared"
import { AccountError } from "../../../shared/errors/account"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import { tokenBalancesForAccountAndTokenView } from "../../views/tokenBalances"
import { tokensFindFamily } from "../accountTokens/tokens.state"
import { useMemo } from "react"

export const useNativeFeeToken = (
  account: WalletAccount | undefined,
): TokenWithBalance => {
  if (!account) {
    throw new AccountError({ code: "NOT_FOUND" })
  }
  const feeTokenAddress = getNativeFeeTokenAddress(getAccountTxVersion(account))
  const baseFeeToken = {
    address: feeTokenAddress,
    networkId: account.networkId,
  }
  const feeToken = useView(tokensFindFamily(baseFeeToken))
  if (!feeToken) {
    throw new Error("Native fee token not found")
  }
  const feeTokenBalances = useView(
    tokenBalancesForAccountAndTokenView({
      account,
      token: feeToken,
    }),
  )
  return {
    ...feeToken,
    balance: BigInt(feeTokenBalances?.balance ?? "0"),
  }
}

export const useNativeFeeTokenAddress = (
  account: WalletAccount | undefined,
): Address => {
  return useMemo(() => {
    if (!account) {
      return STRK_TOKEN_ADDRESS
    }
    return getNativeFeeTokenAddress(getAccountTxVersion(account))
  }, [account])
}
