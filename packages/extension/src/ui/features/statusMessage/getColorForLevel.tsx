import { DefaultTheme } from "styled-components"

import { IStatusMessageLevel } from "../../../shared/statusMessage/types"

export const getColorForLevel = ({
  theme,
  level,
}: {
  theme: DefaultTheme
  level: IStatusMessageLevel
}) => {
  switch (level) {
    case "danger":
      return theme.red1
    case "warn":
      return theme.yellow1
    case "info":
      return theme.blue0
  }
  return theme.white
}
