import { icons } from "@argent/x-ui"
import type { FC } from "react"
import type { To } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import type { WalletAccount } from "../../../shared/wallet.model"
import { useIsDeprecatedTxV0 } from "../accounts/accountUpgradeCheck"
import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"
import type { BannerRouteState } from "./UpgradeBanner"

const { WarningCircleSecondaryIcon } = icons

export interface UpgradeBannerProps extends BannerProps {
  to: To
  state?: BannerRouteState
}

export const useShowDeprecatedBanner = (account: WalletAccount) => {
  const isDeprecated = useIsDeprecatedTxV0(account)
  return isDeprecated
}

export const AccountDeprecatedBanner: FC<UpgradeBannerProps> = ({
  to,
  state,
  ...rest
}) => {
  const navigate = useNavigate()
  return (
    <Banner
      title="Account deprecated"
      description="Click to learn more"
      icon={<WarningCircleSecondaryIcon />}
      onClick={() => {
        navigate(to, { state })
      }}
      {...rest}
    />
  )
}
