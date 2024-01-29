import { FC } from "react"
import { useCurrentNetwork } from "../../../networks/hooks/useCurrentNetwork"
import { networkRepo } from "../../../../../shared/network/store"
import { BetaFeaturesSettingsScreen } from "./BetaFeaturesSettingsScreen"

export const BetaFeaturesSettingsScreenContainer: FC = () => {
  return <BetaFeaturesSettingsScreen />
}
