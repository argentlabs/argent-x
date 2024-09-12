import { AlertButton, iconsDeprecated } from "@argent/x-ui"
import { FC } from "react"

const { MultisigIcon } = iconsDeprecated

export interface ActivateMultisigBannerProps {
  onClick: () => void
}

export const ActivateMultisigBanner: FC<ActivateMultisigBannerProps> = ({
  onClick,
}) => (
  <AlertButton
    size="md"
    title="Activate multisig"
    description="Click to activate the multisig"
    icon={<MultisigIcon color="neutrals.900" fontSize="2xl" />}
    colorScheme="primary"
    bg="primaryExtraDark.500"
    onClick={onClick}
  />
)
