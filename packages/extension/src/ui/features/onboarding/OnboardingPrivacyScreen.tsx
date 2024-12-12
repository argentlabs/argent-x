import { icons, P3 } from "@argent/x-ui"
import { Button, Flex, Link } from "@chakra-ui/react"
import type { FC, MouseEventHandler } from "react"

import { OnboardingScreen } from "./ui/OnboardingScreen"
import { ARGENT_X_LEGAL_PRIVACY_POLICY_URL } from "../../../shared/api/constants"
import { OnboardingButton } from "./ui/OnboardingButton"

const { CheckmarkSecondaryIcon } = icons

interface OnboardingPrivacyScreenProps {
  onAccept: MouseEventHandler
  onRefuse: MouseEventHandler
  onBack: () => void
  length?: number
}

export const OnboardingPrivacyScreen: FC<OnboardingPrivacyScreenProps> = ({
  onAccept,
  onRefuse,
  onBack,
  length,
}) => {
  return (
    <OnboardingScreen
      length={length ?? 5}
      currentIndex={1}
      illustration={"improve"}
      title="Help us improve Argent X"
      subtitle="Argent would like to track anonymous usage data to help identify issues, prioritise features and build a better product without compromising your privacy"
      onBack={onBack}
    >
      <Flex
        alignItems={"start"}
        p={4}
        rounded={"xl"}
        border="1px solid #404040"
        direction="column"
        pr={20}
        mb={8}
      >
        <P3 display="flex" alignItems="center" my={1}>
          <CheckmarkSecondaryIcon color="success.500" mr={2} />
          Opt-out at any time via settings
        </P3>
        <P3 display="flex" alignItems="center" my={1}>
          <CheckmarkSecondaryIcon color="success.500" mr={2} />
          Send anonymized clicks and pageview events
        </P3>
        <P3 display="flex" alignItems="center" my={1}>
          <CheckmarkSecondaryIcon color="success.500" mr={2} />
          We never sell your data!
        </P3>
      </Flex>
      <Link
        href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL}
        target="_blank"
        color="primary.500"
      >
        Privacy Policy
      </Link>
      <Flex mt={15}>
        <Button px={8} mr={4} onClick={onRefuse}>
          No thanks
        </Button>
        <OnboardingButton
          data-testid="agree-button"
          onClick={onAccept}
          colorScheme="primary"
        >
          I agree
        </OnboardingButton>
      </Flex>
    </OnboardingScreen>
  )
}
