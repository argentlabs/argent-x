import {
  WarningCircleSecondaryIcon,
  AlertSecondaryIcon,
  InfoCircleSecondaryIcon,
} from "@argent/x-ui/icons"
import type { ChakraComponent } from "@chakra-ui/react"
import type { ComponentProps, FC } from "react"

import type { IStatusMessageLevel } from "../../../shared/statusMessage/types"

export type StatusMessageIconProps = ComponentProps<ChakraComponent<"svg">> & {
  level?: IStatusMessageLevel
}

export const StatusMessageIcon: FC<StatusMessageIconProps> = ({
  level,
  ...rest
}) => {
  switch (level) {
    case "danger":
      return <WarningCircleSecondaryIcon {...rest} />
    case "warning":
      return <AlertSecondaryIcon {...rest} />
  }
  return <InfoCircleSecondaryIcon {...rest} />
}
