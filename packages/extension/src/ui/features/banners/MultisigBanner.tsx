import { icons } from "@argent/x-ui"
import { Spinner } from "@chakra-ui/react"
import type { FC } from "react"
import type { BannerProps } from "./Banner"
import { Banner } from "./Banner"

const { MultisigSecondaryIcon } = icons

interface MultisigBannerProps extends BannerProps {
  showActivateMultisigBanner: boolean
  onActivateMultisig: () => void
  isMultisigDeploying: boolean
}

export const MultisigBanner: FC<MultisigBannerProps> = ({
  showActivateMultisigBanner,
  onActivateMultisig,
  isMultisigDeploying,
  ...rest
}) => {
  if (showActivateMultisigBanner) {
    return (
      <Banner
        data-testid="activate-multisig"
        title="Activate multisig"
        description="Click to activate the multisig"
        icon={<MultisigSecondaryIcon />}
        onClick={() => void onActivateMultisig()}
        {...rest}
      />
    )
  }

  if (isMultisigDeploying) {
    return (
      <Banner
        data-testid="activating-multisig"
        colorScheme={"warning"}
        title="Activating multisig"
        description="Waiting for the multisig to be activated"
        icon={<Spinner />}
        {...rest}
      />
    )
  }

  return null
}
