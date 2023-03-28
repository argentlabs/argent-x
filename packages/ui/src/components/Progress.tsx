import { Progress, defineStyleConfig } from "@chakra-ui/react"

export { Progress }

export const progressTheme = defineStyleConfig({
  baseStyle: () => {
    return {
      borderRadius: "lg",
      filledTrack: {
        bg: "primary.500",
      },
      track: {
        bg: "#803820",
      },
    }
  },
})
