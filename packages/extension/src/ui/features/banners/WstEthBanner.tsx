import { UpgradePrimaryIcon } from "@argent/x-ui/icons"
import type { FC } from "react"

import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"

export const WstEthBanner: FC<BannerProps> = (props) => {
  return (
    <Banner
      title="Upgrade your staked ETH "
      description={`A new wstETH contract has been set up. Click here to upgrade your wstETH.`}
      colorScheme="success"
      iconColor="surface-warning-vibrant"
      icon={<UpgradePrimaryIcon />}
      {...props}
    />
  )
}
