import { InvestSecondaryIcon } from "@argent/x-ui/icons"
import type { FC } from "react"

import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"

interface PromoStakingBannerProps extends BannerProps {
  apyPercentage: string
}

export const PromoStakingBanner: FC<PromoStakingBannerProps> = ({
  apyPercentage,
  ...props
}) => {
  return (
    <Banner
      title="STRK staking is here"
      description={`Start earning with ${apyPercentage}% APY`}
      colorScheme="success"
      icon={<InvestSecondaryIcon />}
      {...props}
    />
  )
}
