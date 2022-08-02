import { SvgIconProps } from "@mui/material"
import { FC } from "react"

import { IStatusMessageLevel } from "../../../shared/statusMessage/types"
import {
  ErrorOutlineRoundedIcon,
  InfoOutlinedIcon,
  WarningRoundedIcon,
} from "../../components/Icons/MuiIcons"

export interface IStatusMessageIcon extends SvgIconProps {
  level: IStatusMessageLevel
}

export const StatusMessageIcon: FC<IStatusMessageIcon> = ({
  level,
  ...rest
}) => {
  switch (level) {
    case "danger":
      return <ErrorOutlineRoundedIcon {...rest} />
    case "warn":
      return <WarningRoundedIcon {...rest} />
  }
  return <InfoOutlinedIcon {...rest} />
}
