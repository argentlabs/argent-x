import { Button, L2, P3, P4, icons, logos } from "@argent/x-ui"
import { SimpleGrid, VStack, StackProps, Link, Flex } from "@chakra-ui/react"
import { FC } from "react"

import {
  ARGENT_X_LEGAL_PRIVACY_POLICY_URL,
  ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL,
} from "../../../../shared/api/constants"

const { SupportIcon } = icons
const { DiscordLogo, GithubLogo, TwitterLogo } = logos

interface SupportFooterProps extends StackProps {
  privacyStatement?: boolean
}

const SupportFooter: FC<SupportFooterProps> = ({
  privacyStatement = true,
  ...rest
}) => (
  <VStack
    mt={4}
    gap={2}
    borderTop="solid 1px"
    borderTopColor="border"
    {...rest}
  >
    <P3 color="neutrals.400" pt="6">
      Help, support &amp; suggestions:
    </P3>
    <SimpleGrid columns={2} gap="2" w="100%" py={4}>
      <Button
        as={"a"}
        size="sm"
        rounded={"lg"}
        leftIcon={<SupportIcon />}
        href="https://support.argent.xyz/hc/en-us/categories/5767453283473-Argent-X"
        title="Get Argent X Support"
        target="_blank"
      >
        Help
      </Button>
      <Button
        as={"a"}
        size="sm"
        rounded={"lg"}
        leftIcon={<DiscordLogo />}
        href="https://discord.gg/T4PDFHxm6T"
        title="Ask a question on the argent-x-support channel on Discord"
        target="_blank"
      >
        Discord
      </Button>
      <Button
        as="a"
        size="sm"
        rounded={"lg"}
        leftIcon={<GithubLogo />}
        href="https://github.com/argentlabs/argent-x/issues"
        title="Post an issue on Argent X GitHub"
        target="_blank"
      >
        Github
      </Button>
      <Button
        as="a"
        size="sm"
        rounded={"lg"}
        leftIcon={<TwitterLogo />}
        href="https://twitter.com/argenthq"
        title="Follow Argent X on Twitter"
        target="_blank"
      >
        Twitter
      </Button>
    </SimpleGrid>
    {privacyStatement && (
      <Flex color="text-secondary" gap={2}>
        <P4
          as={Link}
          href={ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL}
          target="_blank"
        >
          Terms of Service
        </P4>
        <P4 as={Link} href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL} target="_blank">
          Privacy Policy
        </P4>
      </Flex>
    )}
    <L2 color="neutrals.500">Version: v{process.env.VERSION}</L2>
  </VStack>
)

export { SupportFooter }
