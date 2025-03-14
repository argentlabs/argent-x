import type { FC } from "react"
import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"
import { UpgradeSecondaryIcon } from "@argent/x-ui/icons"
import { Spinner } from "@chakra-ui/react"

const LegacyVersionBanner: FC<BannerProps & { isLoading: boolean }> = ({
  isLoading,
  ...props
}) => {
  return (
    <Banner
      colorScheme="danger"
      title="UPGRADE NOW"
      icon={isLoading ? <Spinner /> : <UpgradeSecondaryIcon />}
      description="Please upgrade to latest version to continue accessing the account."
      {...props}
    />
  )
}

export { LegacyVersionBanner }
