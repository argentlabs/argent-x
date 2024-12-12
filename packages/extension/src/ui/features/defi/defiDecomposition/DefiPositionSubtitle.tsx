import { P4 } from "@argent/x-ui"
import type { TextProps } from "@chakra-ui/react"
import type { FC } from "react"

export const DefiPositionSubtitle: FC<TextProps> = (props) => {
  return (
    <P4
      overflow="hidden"
      textOverflow="ellipsis"
      sx={{ textDecorationThickness: "1px" }}
      {...props}
    />
  )
}
