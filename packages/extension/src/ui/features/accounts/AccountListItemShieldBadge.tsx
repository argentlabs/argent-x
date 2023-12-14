import { icons } from "@argent/ui"
import { Circle, Tooltip } from "@chakra-ui/react"
import { FC } from "react"

import { getEscapeDisplayAttributes } from "../shield/escape/EscapeBanner"
import { LiveAccountEscapeProps } from "../shield/escape/useAccountEscape"

const { ArgentShieldIcon } = icons

interface AccountListItemShieldBadgeProps {
  liveAccountEscape?: LiveAccountEscapeProps
}

export const AccountListItemShieldBadge: FC<
  AccountListItemShieldBadgeProps
> = ({ liveAccountEscape }) => {
  if (liveAccountEscape) {
    const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
    return (
      <Tooltip label={title}>
        <Circle
          position={"absolute"}
          right={-0.5}
          bottom={-0.5}
          size={5}
          bg={`${colorScheme}.500`}
          border={"2px solid"}
          borderColor={"neutrals.800"}
          color={"neutrals.900"}
          fontSize={"2xs"}
        >
          <ArgentShieldIcon />
        </Circle>
      </Tooltip>
    )
  }
  return (
    <Tooltip label="This account is protected by Argent Shield 2FA">
      <Circle
        position={"absolute"}
        right={-0.5}
        bottom={-0.5}
        size={5}
        bg={"neutrals.800"}
        color={"white"}
        fontSize={"2xs"}
        data-testid="shield-on-settings"
      >
        <ArgentShieldIcon />
      </Circle>
    </Tooltip>
  )
}
