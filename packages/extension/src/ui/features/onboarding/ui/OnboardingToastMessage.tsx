import { ChromeExtensionIcon, PinIcon } from "@argent/x-ui/icons"
import { H5, P2 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC } from "react"

import { ArgentXLogo } from "@argent/x-ui/logos-deprecated"

export const OnboardingToastMessage: FC = () => {
  return (
    <Flex
      direction={"column"}
      width={"274px"}
      p={3}
      gap={3}
      rounded={"lg"}
      color={"neutrals.900"}
      bg={"white"}
      shadow={"menu"}
    >
      <Flex alignItems={"center"} gap={3} pl={1}>
        <ChromeExtensionIcon flexShrink={0} fontSize={"xl"} />
        <P2>Pin the Argent X extension for quick access</P2>
      </Flex>
      <Flex alignItems={"center"} p={3} gap={3} rounded={"lg"} bg={"#f0f0f0"}>
        <ArgentXLogo flexShrink={0} fontSize={"xl"} color={"primary.500"} />
        <H5 mr={"auto"}>Argent X</H5>
        <PinIcon fontSize={"xl"} color={"#2E75E0"} />
      </Flex>
    </Flex>
  )
}
