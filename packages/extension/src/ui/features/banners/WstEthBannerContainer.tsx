import { useAtom, useAtomValue } from "jotai"
import { atomWithStorage, loadable } from "jotai/utils"
import type { FC } from "react"

import { useCallback, useMemo } from "react"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import type { BannerProps } from "./Banner"
import { WstEthBanner } from "./WstEthBanner"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import { deprecatedWstEthTokenOnNetworkView } from "../../views/token"
import { equalToken } from "../../../shared/token/__new/utils"
import { tokenBalancesForAccountAndTokenView } from "../../views/tokenBalances"
import { investmentViewFindAtom } from "../../views/investments"
import { ensureArray } from "@argent/x-shared"

export const hasDismissedWstEthBannerAtom = atomWithStorage(
  "hasDismissedWstEthBanner",
  false,
  undefined,
  { getOnInit: true },
)

export const useWstEthBanner = (account?: BaseWalletAccount) => {
  const hasDismissedWstEthBannerBanner = useAtomValue(
    hasDismissedWstEthBannerAtom,
  )
  const wstEthToken = useView(
    deprecatedWstEthTokenOnNetworkView(account?.networkId),
  )
  const investment = useView(investmentViewFindAtom(account))
  const accountLiquidityTokens = ensureArray(investment?.liquidityTokens)

  // Without memo, the loadable is recreated on every render
  // This causes infinite re-renders
  const loadableBalance = useMemo(
    () =>
      loadable(
        tokenBalancesForAccountAndTokenView({ account, token: wstEthToken }),
      ),
    [account, wstEthToken],
  )

  const wstEthTokenBalanceValue = useView(loadableBalance)

  const isDefaultNetwork = useIsDefaultNetwork()

  return useMemo(() => {
    const hasWstEthLiquidityToken = accountLiquidityTokens.some((token) =>
      equalToken(token, wstEthToken),
    )

    // Early return if the balance is loading or has an error
    if (
      wstEthTokenBalanceValue.state === "loading" ||
      wstEthTokenBalanceValue.state === "hasError"
    ) {
      return (
        isDefaultNetwork &&
        !hasDismissedWstEthBannerBanner &&
        hasWstEthLiquidityToken
      )
    }

    const wstEthTokenBalance = wstEthTokenBalanceValue.data

    const hasWstEthTokenBalance =
      wstEthTokenBalance?.balance &&
      BigInt(wstEthTokenBalance.balance) > BigInt(0)

    const hasWstEth = hasWstEthLiquidityToken || hasWstEthTokenBalance

    return isDefaultNetwork && !hasDismissedWstEthBannerBanner && hasWstEth
  }, [
    accountLiquidityTokens,
    wstEthTokenBalanceValue,
    isDefaultNetwork,
    hasDismissedWstEthBannerBanner,
    wstEthToken,
  ])
}

export interface WstEthBannerContainerProps extends BannerProps {
  account?: BaseWalletAccount
}

export const WstEthBannerContainer: FC<WstEthBannerContainerProps> = (
  props,
) => {
  const [, setHasDismissedPromoStakingBanner] = useAtom(
    hasDismissedWstEthBannerAtom,
  )

  const onClick = useCallback(() => {
    open("https://wstethmigration.starknet.io/", "_blank")
  }, [])

  const onClose = useCallback(() => {
    setHasDismissedPromoStakingBanner(true)
  }, [setHasDismissedPromoStakingBanner])

  return <WstEthBanner onClick={onClick} onClose={onClose} {...props} />
}
