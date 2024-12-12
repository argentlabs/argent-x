import { H5 } from "@argent/x-ui"
import type { TextProps } from "@chakra-ui/react"
import type { FC } from "react"

export const DefiPositionTitle: FC<TextProps> = (props) => {
  return <H5 sx={{ textDecorationThickness: "1px" }} {...props} />
}
