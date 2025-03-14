import { bigDecimal, formatTruncatedAddress } from "@argent/x-shared"
import { useMemo } from "react"
import {
  isCollateralizedDebtBorrowingPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
  type ParsedPosition,
} from "../../../../../shared/defiDecomposition/schema"
import type { BaseWalletAccount } from "../../../../../shared/wallet.model"
import { useView } from "../../../../views/implementation/react"
import { knownDappWithId } from "../../../../views/knownDapps"
import { strkDelegatedStakingPositionUsdValueAtom } from "../../../../views/staking"
import urlJoin from "url-join"

interface UseDefiPositionBreakdownInfoProps {
  position: ParsedPosition
  account: BaseWalletAccount
  dappId?: string
}

const dappManageUrls: Record<string, string> = {
  nostra: "https://app.nostra.finance/lend-borrow",
  vesu: "https://vesu.xyz",
  nimbora: "https://app.nimbora.io/",
  ekubo: "https://app.ekubo.org",
  zklend: "https://app.zklend.com/markets",
}

export const useDefiPositionBreakdownInfo = ({
  position,
  account,
  dappId,
}: UseDefiPositionBreakdownInfoProps) => {
  const dapp = useView(knownDappWithId(dappId))

  const stakedStrkPosition = useView(
    strkDelegatedStakingPositionUsdValueAtom({
      account,
      positionId: position.id,
    }),
  )

  const rewards = stakedStrkPosition
    ? {
        balance: stakedStrkPosition.balance.rewards,
        usdValue: stakedStrkPosition.usdValue.rewards,
        token: stakedStrkPosition.token,
      }
    : {
        balance: "0",
        usdValue: "0",
        token: undefined,
      }

  const netApyPercentage = useMemo(() => {
    let apyPercentage
    if (isCollateralizedDebtBorrowingPosition(position)) {
      let collateralizedApySum = 0
      let debtApySum = 0
      position.collateralizedPositions.forEach((pos) => {
        if (pos.totalApy) {
          collateralizedApySum += Number(pos.totalApy)
        }
      })

      position.debtPositions.forEach((pos) => {
        if (pos.totalApy) {
          debtApySum += Number(pos.totalApy)
        }
      })
      apyPercentage = (collateralizedApySum - debtApySum).toString()
    } else if (
      isStakingPosition(position) ||
      isStrkDelegatedStakingPosition(position)
    ) {
      apyPercentage = position.totalApy
    }
    if (apyPercentage) {
      return bigDecimal.formatUnits(
        bigDecimal.mul(
          bigDecimal.parseUnits(apyPercentage),
          bigDecimal.toBigDecimal(100, 0),
        ),
      )
    }
  }, [position])

  const { providerInfo, managePositionUrl } = useMemo(() => {
    let providerInfo
    let managePositionUrl
    if (isStrkDelegatedStakingPosition(position)) {
      if (position.stakerInfo?.name || position.stakerInfo?.address) {
        const name =
          position.stakerInfo.name ??
          formatTruncatedAddress(position.stakerInfo.address ?? "")
        providerInfo = {
          url: position.stakerInfo.iconUrl,
          name,
        }
      }
    } else if (dapp) {
      if (dapp.logoUrl && dapp.name) {
        providerInfo = { url: dapp.logoUrl, name: dapp.name }

        const dappNameLower = dapp.name.toLowerCase()
        const manageUrl = dappManageUrls[dappNameLower]

        if (manageUrl) {
          if (dappNameLower === "vesu") {
            const path = isCollateralizedDebtBorrowingPosition(position)
              ? "borrow"
              : "lend"
            managePositionUrl = urlJoin(manageUrl, path)
          } else if (dappNameLower === "ekubo") {
            const path = isDelegatedTokensPosition(position)
              ? "governance/delegate"
              : "positions"
            managePositionUrl = urlJoin(manageUrl, path)
          } else {
            managePositionUrl = manageUrl
          }
        }
      }
    }
    return { providerInfo, managePositionUrl }
  }, [dapp, position])

  return {
    rewards,
    netApyPercentage,
    providerInfo,
    managePositionUrl,
  }
}
