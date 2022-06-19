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
    title="Upgrade Available"
    description={
      canNotPay
        ? "You need ETH to cover transaction fees!"
        : "This update is required to use this wallet."
    }
    icon={<UpdateIcon />}
  />
)
