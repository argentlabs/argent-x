import { H5, P3 } from "@argent/x-ui"
import type { ButtonProps, SimpleGridProps } from "@chakra-ui/react"
import { SimpleGrid, Flex, Button, Image } from "@chakra-ui/react"
import type { FC } from "react"

interface FeatureCardProps extends ButtonProps {
  href?: string
  title: string
  description: string
  imageSrc?: string
}

const FeatureCard: FC<FeatureCardProps> = ({
  href,
  title,
  description,
  imageSrc,
  ...rest
}) => {
  return (
    <Button
      as={href ? "a" : "div"}
      href={href}
      target="_blank"
      overflow="hidden"
      size="auto"
      rounded="lg"
      height="full"
      width="full"
      flexDirection="column"
      pointerEvents={href ? undefined : "none"}
      textAlign="left"
      fontWeight="initial"
      alignItems="flex-start"
      justifyContent="flex-start"
      {...rest}
    >
      <Image w="full" h={25} src={imageSrc} objectFit="cover" />
      <Flex flexDir={"column"} p={2}>
        <H5>{title}</H5>
        <P3 sx={{ textWrap: "wrap" }} color="text-secondary-web">
          {description}
        </P3>
      </Flex>
    </Button>
  )
}

export const OnboardingFinishSmartAccountFeaturesRow: FC<SimpleGridProps> = (
  props,
) => {
  return (
    <SimpleGrid columns={{ sm: 3 }} gap={3} w={"full"} {...props}>
      <FeatureCard
        imageSrc="./assets/onboarding/finish/2fa-protection.svg"
        title="2FA protection"
        description="Add a 2FA challenge when recovering your account"
        href="https://www.argent.xyz/blog/argent-shield-2fa-for-argent-x/"
      />
      <FeatureCard
        imageSrc="./assets/onboarding/finish/on-chain-recovery.svg"
        title="On-chain recovery"
        description="Recovery even if seed phrase is lost"
      />
      <FeatureCard
        imageSrc="./assets/onboarding/finish/session-keys.svg"
        title="Session keys"
        description="Enjoy on-chain gaming without interruptions"
        href="https://www.argent.xyz/blog/session-keys-with-argent-technical/"
      />
    </SimpleGrid>
  )
}
