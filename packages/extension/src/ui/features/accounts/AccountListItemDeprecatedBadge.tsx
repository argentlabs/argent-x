import { icons } from "@argent/ui"
import { Circle, Tooltip } from "@chakra-ui/react"
import { FC } from "react"

const { AlertIcon } = icons

export const AccountListItemWarningBadge: FC = () => (
  <Tooltip label="This account can no longer be used">
    <Circle
      position="absolute"
      right={-0.5}
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
