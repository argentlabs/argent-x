import { FC } from "react"

import { Banner } from "../../components/Banner"
import { UpdateIcon } from "../../components/Icons/UpdateIcon"

interface UpgradeBannerProps {
  canNotPay?: boolean
}

export const UpgradeBanner: FC<UpgradeBannerProps> = ({
  canNotPay = false,
}) => (
  <Banner
    title="Upgrade Required"
    description={
      canNotPay
        ? "Add ETH to upgrade and use this account"
        : "Upgrade to continue using this account"
    }
    icon={<UpdateIcon />}
  />
)
