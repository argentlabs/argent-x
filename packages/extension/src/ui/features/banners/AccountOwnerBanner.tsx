import { WarningCircleSecondaryIcon } from "@argent/x-ui/icons"
import type { FC } from "react"
import type { LinkProps } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import type { WalletAccount } from "../../../shared/wallet.model"
import { useAccountOwnerIsSelf } from "../accounts/useAccountOwner"
import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"

export interface AccountOwnerBannerProps
  extends Pick<LinkProps, "to" | "state">,
    BannerProps {}

export const useShowAccountOwnerBanner = (account: WalletAccount) => {
  const accountOwnerIsSelf = useAccountOwnerIsSelf(account)
  return !accountOwnerIsSelf
}

export const AccountOwnerBanner: FC<AccountOwnerBannerProps> = ({
  to,
  state,
  ...rest
}) => {
  const navigate = useNavigate()
  return (
    <Banner
      title="Can’t access account"
      description="Click to learn more"
      icon={<WarningCircleSecondaryIcon />}
      onClick={() => navigate(to, { state })}
      {...rest}
    />
  )
}
