import { icons } from "@argent/x-ui"
import { Circle, Tooltip } from "@chakra-ui/react"
import type { FC } from "react"

const { UpgradeSecondaryIcon } = icons

export const AccountListItemUpgradeBadge: FC = () => (
  <Tooltip label="There’s an upgrade available for this account">
    <Circle
      position={"absolute"}
      left={-0.5}
      bottom={-0.5}
      size={5}
      bg="surface-info-vibrant"
      border={"2px solid"}
      borderColor={"neutrals.800"}
      color={"neutrals.800"}
      fontSize={"2xs"}
    >
      <UpgradeSecondaryIcon />
    </Circle>
  </Tooltip>
)
