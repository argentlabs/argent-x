import { P4, icons } from "@argent/x-ui"
import { Button, Flex, Link } from "@chakra-ui/react"
import { FC, MouseEventHandler } from "react"

import { OnboardingScreen } from "./ui/OnboardingScreen"
import { ARGENT_X_LEGAL_PRIVACY_POLICY_URL } from "../../../shared/api/constants"

const { TickIcon } = icons

interface OnboardingStartScreenProps {
  onAccept: MouseEventHandler
  onRefuse: MouseEventHandler
  onBack: () => void
  length?: number
}

export const PrivacyScreen: FC<OnboardingStartScreenProps> = ({
  onAccept,
  onRefuse,
  onBack,
  length,
}) => {
  return (
    <OnboardingScreen
      length={length ?? 4}
      currentIndex={1}
      title="Help us improve Argent X"
      subtitle="Argent would like to track anonymous usage data to help identify issues, prioritise features and build a better product without compromising your privacy"
      onBack={onBack}
    >
      <Flex
        alignItems={"start"}
        p={4}
        rounded={"lg"}
        border="1px solid #404040"
        direction="column"
        pr={20}
        mb={8}
      >
        <P4 display="flex" alignItems="center" my={1}>
          <TickIcon color="success.500" mr={2} />
          Opt-out at any time via settings
        </P4>
        <P4 display="flex" alignItems="center" my={1}>
          <TickIcon color="success.500" mr={2} />
          Send anonymized clicks and pageview events
        </P4>
        <P4 display="flex" alignItems="center" my={1}>
          <TickIcon color="success.500" mr={2} />
          We never sell your data!
        </P4>
      </Flex>
      <Link
        href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL}
        target="_blank"
        color="primary.500"
      >
        Privacy Policy
      </Link>
      <Flex mt={8}>
        <Button px={8} mr={4} maxW="160" onClick={onRefuse}>
          No thanks
        </Button>
        <Button
          data-testid="agree-button"
          px={8}
          maxW="160"
          onClick={onAccept}
          colorScheme="primary"
        >
          I agree
        </Button>
      </Flex>
    </OnboardingScreen>
  )
}
