import {
  addressSchema,
  estimatedFeesToMaxFeeTotalV2,
  type Address,
  getNativeFeeTokenAddress,
  getAccountTxVersion,
} from "@argent/x-shared"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import type { EstimatedFeesV2 } from "@argent/x-shared/simulation"
import { tokenBalancesForAccountViewFamily } from "../../views/tokenBalances"
import { useView } from "../../views/implementation/react"
import { equalToken } from "../../../shared/token/__new/utils"
import { tokensInNetwork, useMapToRawTokens } from "./tokens.state"
import { useMemo } from "react"

const useBaseFeeTokenBalances = (
  account?: BaseWalletAccount,
  feeTokenAddresses?: Address[],
) => {
  const tokenBalances = useView(tokenBalancesForAccountViewFamily(account))
  if (!account || !tokenBalances || !feeTokenAddresses) {
    return []
  }

  return feeTokenAddresses.map((feeTokenAddress) => {
    const tokenBalance = tokenBalances.find((tokenBalance) =>
      equalToken(tokenBalance, {
        address: feeTokenAddress,
        networkId: account.networkId,
      }),
    )
    return {
      address: feeTokenAddress,
      networkId: account.networkId,
      balance: tokenBalance?.balance ?? "0",
      account: account.address,
    }
  })
}

export const useFeeTokenBalances = (
  account?: BaseWalletAccount,
  feeTokenAddresses?: Address[],
) => {
  const feeTokenBalances = useBaseFeeTokenBalances(account, feeTokenAddresses)
  const tokens = useView(tokensInNetwork(account?.networkId))

  const mappedTokensWithBalances = useMapToRawTokens(
    tokens,
    feeTokenBalances,
    false,
  )

  return useMemo(() => {
    if (!account) {
      return []
    }

    return mappedTokensWithBalances.map((token) => ({
      ...token,
      account,
      balance: token.balance,
    }))
  }, [account, mappedTokensWithBalances])
}

export const useHasFeeTokenBalance = (
  account?: BaseWalletAccount,
  feeTokenAddresses?: Address[],
) => {
  const feeTokenBalances = useFeeTokenBalances(account, feeTokenAddresses)
  return feeTokenBalances.some(({ balance }) => balance > 0n)
}

export const useTokenBalancesForFeeEstimates = (
  account?: WalletAccount,
  estimatedFees?: EstimatedFeesV2[],
) => {
  const feeTokenAddresses = useMemo(() => {
    if (!estimatedFees) return []
    return estimatedFees.reduce((addresses, fee) => {
      if (account?.type !== "multisig" || fee.type === "native") {
        addresses.push(fee.transactions.feeTokenAddress)
      }
      return addresses
    }, [] as Address[])
  }, [account?.type, estimatedFees])
  const feeTokenBalances = useFeeTokenBalances(account, feeTokenAddresses)

  return useMemo(() => {
    if (!estimatedFees?.length) {
      return []
    }

    // Create map of fee token address to max estimate for O(1) lookups
    const maxEstimatesMap = new Map(
      estimatedFees.map((fee) => [
        fee.transactions.feeTokenAddress,
        { type: fee.type, max: estimatedFeesToMaxFeeTotalV2(fee) },
      ]),
    )

    return feeTokenBalances.filter((feeToken) => {
      const estimate = maxEstimatesMap.get(
        addressSchema.parse(feeToken.address),
      )
      if (!estimate) {
        return false
      }
      return feeToken.balance >= estimate.max || estimate.type === "native"
    })
  }, [estimatedFees, feeTokenBalances])
}

export const useNativeFeeTokenBalances = (account?: WalletAccount) => {
  const accountTxVersion = account ? getAccountTxVersion(account) : "0x3"
  const nativeFeeToken = getNativeFeeTokenAddress(accountTxVersion)
  const feeTokenBalances = useFeeTokenBalances(account, [nativeFeeToken])
  return feeTokenBalances
}

export const useHasNativeFeeTokenBalance = (account?: WalletAccount) => {
  const feeTokenBalances = useNativeFeeTokenBalances(account)
  return useMemo(
    () => feeTokenBalances.some((ftb) => BigInt(ftb.balance) > 0n),
    [feeTokenBalances],
  )
}
