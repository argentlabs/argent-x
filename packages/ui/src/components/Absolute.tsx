import { Flex, Box, chakra } from "@chakra-ui/react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as _ from "@chakra-ui/layout" /** Fixes 'cannot be named without a reference' type error */

export const AbsoluteBox = chakra(Box, {
  baseStyle: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
})

export const AbsoluteFlex = chakra(Flex, {
  baseStyle: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
})
