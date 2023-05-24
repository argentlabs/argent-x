import { icons } from "@argent/ui"
import { Circle, SimpleGrid } from "@chakra-ui/react"
import { FC, MouseEventHandler } from "react"

import { OnboardingRectButton } from "./ui/OnboardingRectButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

const { WalletIcon, RestoreIcon } = icons

interface OnboardingStartScreenProps {
  /** Called when user clicks to create a new wallet */
  onCreate: MouseEventHandler
  /** Called when user clicks to restore an existing wallet */
  onRestore: MouseEventHandler
}

export const OnboardingStartScreen: FC<OnboardingStartScreenProps> = ({
  onCreate,
  onRestore,
}) => {
  return (
    <OnboardingScreen
      length={4}
      currentIndex={0}
      title="Welcome to Argent X"
      subtitle="Enjoy the security of Ethereum with the scale of StarkNet"
    >
      <SimpleGrid columns={2} gap={3} w={"full"}>
        <OnboardingRectButton onClick={onCreate}>
          <Circle size={16} bg={"primary.500"}>
            <WalletIcon fontSize={"2xl"} />
          </Circle>
          Create a new wallet
        </OnboardingRectButton>
        <OnboardingRectButton onClick={onRestore}>
          <Circle size={16} bg={"neutrals.700"}>
            <RestoreIcon fontSize={"2xl"} />
          </Circle>
          Restore an existing wallet
        </OnboardingRectButton>
      </SimpleGrid>
    </OnboardingScreen>
  )
}
