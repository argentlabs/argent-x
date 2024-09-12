import { P1, useToast } from "@argent/x-ui"
import { Box, FormControl, Link, Text } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { resetDevice } from "../../../shared/smartAccount/jwt"
import { coerceErrorToString } from "../../../shared/utils/error"
import { ControlledInput } from "../../components/ControlledInput"
import { routes } from "../../../shared/ui/routes"
import { clientArgentAccountService } from "../../services/argentAccount"
import { emailSchema } from "../argentAccount/argentAccountBaseEmailScreen.model"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { ARGENT_X_LEGAL_PRIVACY_POLICY_URL } from "../../../shared/api/constants"
import { ampli } from "../../../shared/analytics"
import {
  useOnboardingExperiment,
  useShowNewEmailWording,
} from "../../services/onboarding/useOnboardingExperiment"

const OnboardingSmartAccountEmailScreen = () => {
  const navigate = useNavigate()

  const toast = useToast()
  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    control,
  } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(emailSchema),
  })
  const { onboardingExperimentCohort } = useOnboardingExperiment()
  const { showNewEmailWording } = useShowNewEmailWording()
  const onBack = useCallback(() => {
    ampli.onboardingEmailFlowAborted({
      "wallet platform": "browser extension",
      "onboarding experiment": onboardingExperimentCohort,
    })
    navigate(routes.onboardingAccountType.path, { replace: true })
  }, [navigate, onboardingExperimentCohort])

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      /** reset to ensure if new email validates it is always associated with fresh device */
      await resetDevice()
      await clientArgentAccountService.requestEmail(email)

      ampli.onboardingEmailEntered({
        "wallet platform": "browser extension",
        "onboarding experiment": onboardingExperimentCohort,
      })

      navigate(routes.onboardingSmartAccountOTP(email))
    } catch (error) {
      console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to verify email",
        status: "error",
        duration: 3000,
      })
    }
  })

  return (
    <OnboardingScreen
      onBack={onBack}
      length={5} // there are 5 steps in the onboarding process
      currentIndex={3} // this is the 4th step, part of the smart account onboarding
      title={
        showNewEmailWording
          ? "Setup two-factor authentication"
          : "Enter your email"
      }
      subtitle={
        showNewEmailWording ? (
          <P1 color="text-secondary-web">
            Protect your account with a 2FA challenge when recovering the
            accounts. You can also use an encrypted email for extra security and
            privacy.&nbsp;
            <a
              href="https://www.argent.xyz/blog/smart-wallet-features"
              target="_blank"
              style={{ color: "#F36A3D" }}
            >
              Learn more
            </a>
          </P1>
        ) : (
          "Smart Account uses email to enable additional security features on your account"
        )
      }
    >
      <FormControl
        as="form"
        display={"flex"}
        flexDirection={"column"}
        gap={3}
        onSubmit={onSubmit}
      >
        <ControlledInput
          name="email"
          control={control}
          autoFocus
          placeholder="Email"
          isDisabled={isSubmitting}
          isInvalid={Boolean(errors.email)}
          data-testid="email-input"
        />
        <Text mt={3} fontSize={13} color="neutrals.300" lineHeight={4}>
          We will use this email to contact you about our products and services.
          You may unsubscribe at any time. For more details see our{" "}
          <Link
            href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL}
            target="_blank"
            color="primary.500"
          >
            Privacy Policy
          </Link>
        </Text>
        <Box>
          <OnboardingButton
            mt={5}
            type="submit"
            isDisabled={!isDirty || isSubmitting}
          >
            Continue
          </OnboardingButton>
        </Box>
      </FormControl>
    </OnboardingScreen>
  )
}

export default OnboardingSmartAccountEmailScreen
