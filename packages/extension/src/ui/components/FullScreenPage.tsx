import { Button, Flex, chakra } from "@chakra-ui/react"

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
