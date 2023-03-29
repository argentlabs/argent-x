import {
  BarBackButton,
  Button,
  CellStack,
  FlowHeader,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Flex, Link } from "@chakra-ui/react"
import { FC, useCallback } from "react"

import {
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  ShieldValidationErrorMessage,
} from "../../../shared/shield/validation"
import { ZENDESK_LINK } from "../userReview/ReviewFeedbackScreen"
import { useShieldTracking } from "./useShieldTracking"

const { AlertIcon } = icons

export interface ShieldValidationErrorScreenProps {
  onBack?: () => void
  error: ShieldValidationErrorMessage
  onDone: () => void
}

export const ShieldValidationErrorScreen: FC<
  ShieldValidationErrorScreenProps
> = ({ onBack, error, onDone }) => {
  const { trackSuccess } = useShieldTracking("argentShieldError", {
    errorId:
      error === SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2
        ? "emailNotMatch"
        : "emailAlreadyInUseForOtherSeedphrase",
  })

  const onDoneClick = useCallback(() => {
    trackSuccess()
    onDone()
  }, [onDone, trackSuccess])

  const subtitle =
    error === SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1 ? (
      <>
        This address is associated with accounts from another seedphrase.
        <br />
        <br />
        Please enter another email address to continue.
      </>
    ) : error === SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2 ? (
      <>
        Please use the same email address that you used to add Argent Shield to
        your other accounts
      </>
    ) : (
      <>
        This address is associated with accounts from another seedphrase.
        <br />
        <br />
        Please enter the right email address to continue
        <br />
        <br />
        If you can’t remember your email address, please{" "}
        <Link href={ZENDESK_LINK} target="_blank" textDecoration="underline">
          contact support
        </Link>
      </>
    )
  return (
    <NavigationContainer
      leftButton={onBack ? <BarBackButton onClick={onBack} /> : null}
      title={"Argent Shield"}
    >
      <CellStack flex={1}>
        <FlowHeader
          icon={AlertIcon}
          title={"Oops, wrong email"}
          subtitle={subtitle}
        />
        <Flex flex={1} />
        <Button onClick={onDoneClick} colorScheme={"primary"}>
          Try again
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
