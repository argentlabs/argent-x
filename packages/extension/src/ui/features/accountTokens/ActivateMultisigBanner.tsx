import { AlertButton, icons } from "@argent/ui"
import { FC } from "react"

const { MultisigIcon } = icons

export const ActivateMultisigBanner: FC = () => (
  <AlertButton
    size="md"
    title="Activate multisig"
    description="Click to activate the multisig"
    icon={<MultisigIcon color="neutrals.900" fontSize="2xl" />}
    colorScheme="primary"
    bg="primaryExtraDark.500"
  />
)
