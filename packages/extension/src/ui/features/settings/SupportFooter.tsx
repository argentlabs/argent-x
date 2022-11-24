import { B3, Button, Input, L2, P3, icons, logos } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"
import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../routes"

const SupportButton: FC<{ leftIcon: ReactNode; children: ReactNode }> = ({
  leftIcon,
  children,
  ...rest
}) => {
  return (
    <Button
      display="flex"
      flex="1"
      gap={2}
      p={4}
      w="100%"
      h={"initial"}
      rounded={"lg"}
      justifyContent={"center"}
      {...rest}
    >
      <Flex fontSize="base">{leftIcon}</Flex>
      <B3>{children}</B3>
    </Button>
  )
}

const { SupportIcon } = icons
const { Discord, Github } = logos

const SupportFooter: FC = () => (
  <VStack mt={4} borderTop="solid 1px" borderTopColor="neutrals.700">
    <P3 color="neutrals.400" pt="6">
      Help, support &amp; suggestions:
    </P3>
    <Flex gap="2" w="100%" py={4}>
      <a
        style={{ display: "flex", flex: 1 }}
        href="https://support.argent.xyz/hc/en-us/categories/5767453283473-Argent-X"
        title="Get ArgentX Support"
        target="_blank"
      >
        <SupportButton leftIcon={<SupportIcon />}>Help</SupportButton>
      </a>
      <a
        style={{ display: "flex", flex: 1 }}
        href="https://discord.gg/T4PDFHxm6T"
        title="Ask a question on the argent-x-support channel on Discord"
        target="_blank"
      >
        <SupportButton leftIcon={<Discord />}>Discord</SupportButton>
      </a>
      <a
        style={{ display: "flex", flex: 1 }}
        href="https://github.com/argentlabs/argent-x/issues"
        title="Post an issue on Argent X GitHub"
        target="_blank"
      >
        <SupportButton leftIcon={<Github />}>Github</SupportButton>
      </a>
    </Flex>
    <Link to={routes.settingsPrivacyStatement()}>
      <L2 color="neutrals.400" cursor="inherit" textDecoration="underline">
        Privacy Statement
      </L2>
    </Link>
    <L2 color="neutrals.500" py="2">
      Version: v{process.env.VERSION}
    </L2>
  </VStack>
)

export { SupportFooter }
