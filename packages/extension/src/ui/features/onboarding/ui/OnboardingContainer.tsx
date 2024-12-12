import type { CenterProps, FlexProps } from "@chakra-ui/react"
import { Center, Flex, Image } from "@chakra-ui/react"

export type OnboardingIllustration =
  | "2fa"
  | "account-smart"
  | "account-standard"
  | "default"
  | "email-wrong"
  | "email"
  | "improve"
  | "password-created"
  | "password"

export function OnboardingContainer(props: FlexProps) {
  return <Flex flex={1} position="relative" {...props} />
}

interface OnboardingIllustrationProps extends CenterProps {
  illustration?: OnboardingIllustration
}

export function OnboardingIllustration({
  illustration = "default",
  ...rest
}: OnboardingIllustrationProps) {
  return (
    <Center
      flexDirection="column"
      flexBasis="31%"
      maxWidth="450px"
      bgColor="surface-elevated"
      display={{ base: "none", md: "flex" }}
      p={4}
      {...rest}
    >
      <Image alt="" src={`./assets/onboarding/${illustration}.svg`} />
    </Center>
  )
}

export function OnboardingContent(props: FlexProps) {
  return (
    <Flex
      flex={1}
      px={4}
      pb={4}
      pt={{ base: 4, md: "calc(min(10%, 170px))" }}
      mx="auto"
      flexDirection="column"
      maxWidth="600px"
      alignItems="flex-start"
      {...props}
    />
  )
}
