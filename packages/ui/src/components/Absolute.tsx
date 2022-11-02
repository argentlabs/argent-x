import { Box, Flex, chakra } from "@chakra-ui/react"

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
