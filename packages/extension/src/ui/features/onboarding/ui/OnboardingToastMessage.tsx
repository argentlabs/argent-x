import { H6, P3, icons, logos } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

const { ChromeExtensionIcon, PinIcon } = icons
const { ArgentXLogo } = logos

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
        <P3>Pin the Argent X extension for quick access</P3>
      </Flex>
      <Flex alignItems={"center"} p={3} gap={3} rounded={"lg"} bg={"#f0f0f0"}>
        <ArgentXLogo flexShrink={0} fontSize={"xl"} color={"primary.500"} />
        <H6 mr={"auto"}>Argent X</H6>
        <PinIcon fontSize={"xl"} color={"#2E75E0"} />
      </Flex>
    </Flex>
  )
}
