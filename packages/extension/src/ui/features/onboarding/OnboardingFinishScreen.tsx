import { iconsDeprecated, logosDeprecated } from "@argent/x-ui"
import { Circle, SimpleGrid, Flex } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

import { useOnboardingToastMessage } from "./hooks/useOnboardingToastMessage"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingRectButton } from "./ui/OnboardingRectButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { OnboardingSmartAccountFeaturesRow } from "./ui/OnboardingSmartAccountFeaturesRow"
import { ArgentLinksRow } from "./ui/ArgentLinksRow"
import { useShowExperimentalFinishScreen } from "../../services/onboarding/useOnboardingExperiment"
import { useView } from "../../views/implementation/react"
import { selectedAccountView } from "../../views/account"

const { TickCircleIcon } = iconsDeprecated
const { XLogo, DiscordLogo } = logosDeprecated

export interface OnboardingFinishScreenProps {
  onFinish: ReactEventHandler
}

export const OnboardingFinishScreen: FC<OnboardingFinishScreenProps> = ({
  onFinish,
}) => {
  const selectedAccount = useView(selectedAccountView)
  const { showExperimentalFinishScreen } = useShowExperimentalFinishScreen()
  useOnboardingToastMessage()
  const isSmart = selectedAccount?.type === "smart"
  if (showExperimentalFinishScreen) {
    return (
      <OnboardingScreen
        length={5} // there are 5 steps in the onboarding process
        currentIndex={4} // this is the last step
        title={
          isSmart ? "Your smart account is ready!" : "Your account is ready!"
        }
        subtitle="Get ready to experience the power of Argent + Starknet"
        icon={<TickCircleIcon data-testid={"TickCircleIcon"} />}
      >
        <Flex flexDir="column" gap="8">
          {isSmart && <OnboardingSmartAccountFeaturesRow />}
          <ArgentLinksRow />
        </Flex>
      </OnboardingScreen>
    )
  }
  return (
    <OnboardingScreen
      length={5} // there are 5 steps in the onboarding process
      currentIndex={4} // this is the last step
      title="Your wallet is ready!"
      subtitle="Follow us for product updates or if you have any questions"
      icon={<TickCircleIcon data-testid={"TickCircleIcon"} />}
    >
      <SimpleGrid columns={2} gap={3} w={"full"}>
        <OnboardingRectButton
          as="a"
          href="https://twitter.com/argenthq"
          title="Follow Argent on X"
          target="_blank"
        >
          <Circle size={16} bg="black" color="white">
            <XLogo fontSize={"2xl"} />
          </Circle>
          Follow Argent on X
        </OnboardingRectButton>
        <OnboardingRectButton
          as="a"
          href="https://discord.gg/T4PDFHxm6T"
          title="Join the Argent Discord"
          target="_blank"
        >
          <Circle size={16} bg={"#5865F2"} color="white">
            <DiscordLogo fontSize={"2xl"} />
          </Circle>
          Join the Argent Discord
        </OnboardingRectButton>
      </SimpleGrid>
      <OnboardingButton mt={8} onClick={onFinish}>
        Finish
      </OnboardingButton>
    </OnboardingScreen>
  )
}
