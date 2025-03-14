import { NoShieldSecondaryIcon, ShieldPrimaryIcon } from "@argent/x-ui/icons"
import { Circle, Tooltip } from "@chakra-ui/react"
import type { FC } from "react"

import { getEscapeDisplayAttributes } from "../smartAccount/escape/getEscapeDisplayAttributes"
import {
  hasAccountEscapeExpired,
  type LiveAccountEscapeProps,
} from "../smartAccount/escape/useAccountEscape"

interface AccountListItemSmartAccountBadgeProps {
  liveAccountEscape?: LiveAccountEscapeProps
  size?: number | string
}

export const AccountListItemSmartAccountBadge: FC<
  AccountListItemSmartAccountBadgeProps
> = ({ liveAccountEscape, size = 5 }) => {
  if (liveAccountEscape && !hasAccountEscapeExpired(liveAccountEscape)) {
    const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
    return (
      <Tooltip label={title}>
        <Circle
          position={"absolute"}
          right={-0.5}
          bottom={-0.5}
          size={size}
          bg={`${colorScheme}.500`}
          border={"2px solid"}
          borderColor={"neutrals.800"}
          color={"neutrals.900"}
          fontSize={"2xs"}
        >
          <NoShieldSecondaryIcon />
        </Circle>
      </Tooltip>
    )
  }
  return (
    <Tooltip label="This is a Smart Account and is protected by 2FA">
      <Circle
        position={"absolute"}
        right={-0.5}
        bottom={-0.5}
        size={size}
        bg={"neutrals.800"}
        color={"white"}
        fontSize={"2xs"}
        data-testid="smart-account-on-settings"
      >
        <ShieldPrimaryIcon />
      </Circle>
    </Tooltip>
  )
}
