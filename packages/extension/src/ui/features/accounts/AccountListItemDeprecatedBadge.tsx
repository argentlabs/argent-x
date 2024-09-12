import { iconsDeprecated } from "@argent/x-ui"
import { Circle, Tooltip } from "@chakra-ui/react"
import { FC } from "react"

const { AlertIcon } = iconsDeprecated

export const AccountListItemWarningBadge: FC = () => (
  <Tooltip label="This account can no longer be used">
    <Circle
      position="absolute"
      left={-0.5}
      bottom={-0.5}
      size={5}
      bg="primary.500"
      border="2px solid"
      borderColor="neutrals.800"
      color="neutrals.800"
      fontSize="2xs"
    >
      <AlertIcon />
    </Circle>
  </Tooltip>
)
