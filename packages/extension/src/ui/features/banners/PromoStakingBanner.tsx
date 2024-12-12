import { icons } from "@argent/x-ui"
import type { FC } from "react"

import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"

const { InvestSecondaryIcon } = icons

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
