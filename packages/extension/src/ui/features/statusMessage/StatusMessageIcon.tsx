import { icons } from "@argent/x-ui"
import type { ChakraComponent } from "@chakra-ui/react"
import type { ComponentProps, FC } from "react"

import type { IStatusMessageLevel } from "../../../shared/statusMessage/types"

const {
  WarningCircleSecondaryIcon,
  AlertSecondaryIcon,
  InfoCircleSecondaryIcon,
} = icons

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
