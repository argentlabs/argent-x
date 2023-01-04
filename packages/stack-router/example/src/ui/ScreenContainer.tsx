import { chakra } from "@chakra-ui/react"

export const ScreenContainer = chakra("div", {
  baseStyle: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#333332",
    color: "white",
    overflow: "hidden",
  },
})
