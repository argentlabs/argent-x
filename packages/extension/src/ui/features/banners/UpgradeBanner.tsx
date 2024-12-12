import { icons } from "@argent/x-ui"
import { Spinner } from "@chakra-ui/react"
import type { FC } from "react"

import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"

const { UpgradeSecondaryIcon } = icons

export interface BannerRouteState {
  from?: string
}

export interface UpgradeBannerProps extends BannerProps {
  loading?: boolean
  learnMoreLink?: string
}

export const UpgradeBanner: FC<UpgradeBannerProps> = ({
  loading,
  learnMoreLink,
  ...rest
}) => {
  return (
    <Banner
      colorScheme="info"
      title="Upgrade available"
      description={"Upgrade to use the latest features"}
      icon={loading ? <Spinner /> : <UpgradeSecondaryIcon h={5} w={5} />}
      linkTitle="Learn more"
      linkUrl={learnMoreLink}
      {...rest}
    />
  )
}
