import { HelpIcon } from "@argent/x-ui/icons"
import { Button, L2, P3 } from "@argent/x-ui"
import type { ButtonProps, StackProps } from "@chakra-ui/react"
import { Flex, forwardRef, Link, SimpleGrid, VStack } from "@chakra-ui/react"
import type { FC } from "react"

import {
  ARGENT_X_LEGAL_PRIVACY_POLICY_URL,
  ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL,
} from "../../../../shared/api/constants"

import { DiscordLogo, GithubLogo, XLogo } from "@argent/x-ui/logos-deprecated"

interface SupportFooterProps extends StackProps {
  privacyStatement?: boolean
}

const SupportButton = forwardRef<ButtonProps, "button">((props, ref) => (
  <Button ref={ref} rounded={"xl"} size="sm" minHeight={12} {...props} />
))

export const SupportFooter: FC<SupportFooterProps> = ({
  privacyStatement = true,
  ...rest
}) => (
  <VStack
    borderTop="solid 1px"
    borderTopColor="stroke-default"
    p={4}
    gap={4}
    {...rest}
  >
    <P3 color="text-secondary">Help, support &amp; suggestions:</P3>
    <SimpleGrid columns={{ base: 2, md: 4 }} gap={2} w="full">
      <SupportButton
        as={"a"}
        target="_blank"
        leftIcon={<HelpIcon />}
        href="https://support.argent.xyz/hc/en-us/categories/5767453283473-Argent-X"
        title="Get Argent X Support"
      >
        Help
      </SupportButton>
      <SupportButton
        as={"a"}
        target="_blank"
        leftIcon={<DiscordLogo />}
        href="https://discord.gg/T4PDFHxm6T"
        title="Ask a question on the argent-x-support channel on Discord"
      >
        Discord
      </SupportButton>
      <SupportButton
        as="a"
        target="_blank"
        leftIcon={<GithubLogo />}
        href="https://github.com/argentlabs/argent-x/issues"
        title="Post an issue on Argent X GitHub"
      >
        GitHub
      </SupportButton>
      <SupportButton
        as="a"
        target="_blank"
        leftIcon={<XLogo />}
        href="https://twitter.com/argenthq"
        title="Follow Argent on X"
      />
    </SimpleGrid>
    {privacyStatement && (
      <Flex color="text-secondary" gap={2}>
        <L2
          as={Link}
          href={ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL}
          target="_blank"
        >
          Terms of Service
        </L2>
        <L2 as={Link} href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL} target="_blank">
          Privacy Policy
        </L2>
      </Flex>
    )}
    <L2 color="text-secondary">Version: v{process.env.VERSION}</L2>
  </VStack>
)
