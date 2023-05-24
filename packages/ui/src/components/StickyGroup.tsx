import { Box, chakra } from "@chakra-ui/react"

export const StickyGroup = chakra(Box, {
  baseStyle: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    bottom: 0,
    left: 0,
    right: 0,
    background:
      "linear-gradient(180deg, rgba(16, 16, 20, 0) 0%, #101014 66.54%)",
  },
})
