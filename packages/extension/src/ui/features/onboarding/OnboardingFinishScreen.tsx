import { icons, logos } from "@argent/x-ui"
import { Circle, SimpleGrid } from "@chakra-ui/react"
import { FC, ReactEventHandler } from "react"

import { useOnboardingToastMessage } from "./hooks/useOnboardingToastMessage"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingRectButton } from "./ui/OnboardingRectButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

const { TickCircleIcon } = icons
const { TwitterLogo, DiscordLogo } = logos

export interface OnboardingFinishScreenProps {
  onFinish: ReactEventHandler
}

export const OnboardingFinishScreen: FC<OnboardingFinishScreenProps> = ({
  onFinish,
}) => {
  useOnboardingToastMessage()
  return (
    <OnboardingScreen
      length={4}
      currentIndex={3}
      title="Your wallet is ready!"
      subtitle="Follow us for product updates or if you have any questions"
      icon={<TickCircleIcon data-testid={"TickCircleIcon"} />}
    >
      <SimpleGrid columns={2} gap={3} w={"full"}>
        <OnboardingRectButton
          as="a"
          href="https://twitter.com/argenthq"
          title="Follow Argent X on Twitter"
          target="_blank"
        >
          <Circle size={16} bg={"#1DA1F2"}>
            <TwitterLogo fontSize={"2xl"} />
          </Circle>
          Follow Argent X on Twitter
        </OnboardingRectButton>
        <OnboardingRectButton
          as="a"
          href="https://discord.gg/T4PDFHxm6T"
          title="Join the Argent X Discord"
          target="_blank"
        >
          <Circle size={16} bg={"#5865F2"}>
            <DiscordLogo fontSize={"2xl"} />
          </Circle>
          Join the Argent X Discord
        </OnboardingRectButton>
      </SimpleGrid>
      <OnboardingButton mt={8} onClick={onFinish}>
        Finish
      </OnboardingButton>
    </OnboardingScreen>
  )
}
