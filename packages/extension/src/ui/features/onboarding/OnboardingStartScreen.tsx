import { WalletSecondaryIcon, ResetPrimaryIcon } from "@argent/x-ui/icons"
import { P3 } from "@argent/x-ui"
import { Circle, Flex, Link, SimpleGrid } from "@chakra-ui/react"
import type { FC, MouseEventHandler } from "react"

import { OnboardingRectButton } from "./ui/OnboardingRectButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import {
  ARGENT_X_LEGAL_PRIVACY_POLICY_URL,
  ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL,
} from "../../../shared/api/constants"
import { IS_DEV } from "../../../shared/utils/dev"

interface OnboardingStartScreenProps {
  /** Called when user clicks to create a new wallet */
  onCreate: MouseEventHandler
  /** Called when user clicks to restore an existing wallet */
  onRestore: MouseEventHandler
  /** Called when user clicks to restore from preset seed (env variable) */
  onRestorePreset: MouseEventHandler
}

export const OnboardingStartScreen: FC<OnboardingStartScreenProps> = ({
  onCreate,
  onRestore,
  onRestorePreset,
}) => {
  return (
    <OnboardingScreen
      length={5} // there are 5 steps in the onboarding process
      currentIndex={0} // this is the first step
      title="Welcome to Argent X"
      subtitle="Enjoy the security of Ethereum with the scale of Starknet"
    >
      <Flex
        alignItems={"center"}
        px={4}
        py={3}
        bg={"surface-elevated"}
        rounded={"lg"}
        w={"full"}
      >
        <P3>
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
        </P3>
      </Flex>
      <SimpleGrid columns={{ md: 2 }} gap={3} w={"full"} mt={8}>
        <OnboardingRectButton onClick={onCreate}>
          <Circle size={16} bg={"primary.500"}>
            <WalletSecondaryIcon fontSize={"2xl"} />
          </Circle>
          Create a new wallet
        </OnboardingRectButton>
        <OnboardingRectButton onClick={onRestore}>
          <Circle size={16} bg={"neutrals.700"}>
            <ResetPrimaryIcon fontSize={"2xl"} />
          </Circle>
          Restore an existing wallet
        </OnboardingRectButton>
        {IS_DEV && (
          <OnboardingRectButton onClick={onRestorePreset}>
            <Circle size={16} bg={"neutrals.700"}>
              <ResetPrimaryIcon fontSize={"2xl"} />
            </Circle>
            Restore from preset seed
          </OnboardingRectButton>
        )}
      </SimpleGrid>
    </OnboardingScreen>
  )
}
