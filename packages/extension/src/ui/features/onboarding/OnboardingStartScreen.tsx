import { P4, icons } from "@argent/ui"
import { Circle, Flex, Link, SimpleGrid } from "@chakra-ui/react"
import { FC, MouseEventHandler } from "react"

import { OnboardingRectButton } from "./ui/OnboardingRectButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import {
  ARGENT_X_LEGAL_PRIVACY_POLICY_URL,
  ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL,
} from "../../../shared/api/constants"

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
      length={3}
      currentIndex={0}
      title="Welcome to Argent X"
      subtitle="Enjoy the security of Ethereum with the scale of Starknet"
    >
      <Flex
        alignItems={"center"}
        px={4}
        py={3}
        bg={"surface.elevated"}
        rounded={"lg"}
        w={"full"}
      >
        <P4>
          By creating or restoring a wallet, you agree to Argent’s{" "}
          <Link
            href={ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL}
            target="_blank"
            color="primary.500"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL}
            target="_blank"
            color="primary.500"
          >
            Privacy Policy
          </Link>
        </P4>
      </Flex>
      <SimpleGrid columns={2} gap={3} w={"full"} mt={8}>
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
