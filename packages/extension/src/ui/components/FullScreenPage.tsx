import { Button, Center, Flex, chakra } from "@chakra-ui/react"

export const Panel = chakra(Center, {
  baseStyle: {
    flexDirection: "column",
    width: "full",
    px: 0,
    py: 14,
    _last: {
      width: [null, "40%"],
      height: [null, "100%"],
    },
  },
})

export const DecoratedPanel = chakra(Panel, {
  baseStyle: {
    _last: {
      background: [
        null,
        `url('./assets/onboarding-background.jpg') no-repeat center`,
      ],
      backgroundSize: [null, "cover"],
    },
  },
})

export const PageWrapper = chakra(Flex, {
  baseStyle: {
    flexDirection: ["column-reverse", "row"],
    alignItems: "center",
    justifyContent: "flex-end",
    width: "full",
    mt: ["max(120px, 15vh)", 0],
    height: [null, "100vh"],
  },
})

export const ContentWrapper = chakra(Flex, {
  baseStyle: {
    mx: "auto",
    my: 4,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "full",
    maxWidth: "600px",
  },
})

export const ActionButton = chakra(Button, {
  baseStyle: {
    width: "200px",
    colorScheme: "primary",
    padding: "19px 32px",
    bg: "primary.500",
  },
})
