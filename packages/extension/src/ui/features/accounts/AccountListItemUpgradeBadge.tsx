import { icons } from "@argent/ui"
import { Circle, Tooltip } from "@chakra-ui/react"
import { FC } from "react"

const { UpgradeIcon } = icons

export const AccountListItemUpgradeBadge: FC = () => (
  <Tooltip label="This account needs to be upgraded">
    <Circle
      position={"absolute"}
      right={-0.5}
      bottom={-0.5}
      size={5}
      bg={"primary.500"}
      border={"2px solid"}
      borderColor={"neutrals.800"}
      color={"neutrals.800"}
      fontSize={"2xs"}
    >
      <UpgradeIcon />
    </Circle>
  </Tooltip>
)
