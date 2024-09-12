import { H6, P4 } from "@argent/x-ui"
import { SimpleGrid, Flex, Badge } from "@chakra-ui/react"
import { FC } from "react"
import { LockAsset } from "./LockAsset"
import { OnchainRecoveryAsset } from "./OnchainRecoveryAsset"
import { KeyAsset } from "./KeyAsset"

interface FeatureCardProps {
  bgColor: string
  asset: React.ReactNode
  title: string
  description: string
  badgeText?: string
  badgeBgColor?: string
  link?: string
}

const FeatureCard: FC<FeatureCardProps> = ({
  bgColor,
  asset,
  title,
  description,
  badgeText,
  badgeBgColor,
  link,
}) => (
  <Flex
    as={"a"}
    padding="0"
    m="0"
    justifyContent="start"
    bg={bgColor}
    display={"flex"}
    flexDirection={"column"}
    rounded={"xl"}
    height={"170px"}
    position="relative"
    pt={badgeText ? "4" : "0"}
    cursor={link ? "pointer" : "default"}
    href={link}
    target="_blank"
  >
    {badgeText && (
      <Badge
        position="absolute"
        top={2}
        right={2}
        w="fit-content"
        borderRadius="xl"
        bg={badgeBgColor}
      >
        {badgeText}
      </Badge>
    )}
    {asset}
    <Flex
      flexDir={"column"}
      bg="surface-elevated"
      py={2}
      px={3}
      borderBottomRadius="lg"
    >
      <H6 color="text-primary">{title}</H6>
      <P4 color="text-secondary-web">{description}</P4>
    </Flex>
  </Flex>
)

export const OnboardingSmartAccountFeaturesRow: FC = () => {
  return (
    <SimpleGrid columns={3} gap={3} w={"full"}>
      <FeatureCard
        bgColor="accent-hot-pink"
        asset={<LockAsset height="100%" />}
        title="2FA protection"
        description="Add a 2FA challenge when recovering your account"
        link={"https://www.argent.xyz/blog/argent-shield-2fa-for-argent-x/"}
      />
      <FeatureCard
        bgColor="accent-yellow"
        asset={<OnchainRecoveryAsset height="100%" width="100%" />}
        title="On-chain recovery"
        description="Recovery even if seed phrase is lost"
        badgeText="Coming soon"
        badgeBgColor="#D89202"
      />
      <FeatureCard
        bgColor="accent-green"
        asset={<KeyAsset height="100%" width="100%" />}
        title="Session keys"
        description="Enjoy on-chain gaming without interruptions"
        link={"https://www.argent.xyz/blog/session-keys-with-argent-technical/"}
      />
    </SimpleGrid>
  )
}
