import type { BoxProps } from "@chakra-ui/react"
import { Box } from "@chakra-ui/react"
import type { FC } from "react"

export const SeedWordBadgeNumber: FC<BoxProps> = (props) => {
  return <Box color="neutrals.400" width="4.5" textAlign="center" {...props} />
}
