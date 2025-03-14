import type {
  LiquidStakingInvestment,
  StrkDelegatedStakingInvestment,
} from "@argent/x-shared"
import { useDappId } from "@argent/x-ui"

export const useInvestmentProviderInfo = (
  investment?: StrkDelegatedStakingInvestment | LiquidStakingInvestment,
): { name: string | undefined; iconUrl: string | undefined } | undefined => {
  const dapp = useDappId(investment?.dappId || "")

  if (!investment) {
    return
  }

  if (
    investment?.category === "strkDelegatedStaking" &&
    "stakerInfo" in investment
  ) {
    return {
      name: investment.stakerInfo.name,
      iconUrl: investment.stakerInfo.iconUrl,
    }
  }

  return {
    name: dapp?.name,
    iconUrl: dapp?.logoUrl,
  }
}
