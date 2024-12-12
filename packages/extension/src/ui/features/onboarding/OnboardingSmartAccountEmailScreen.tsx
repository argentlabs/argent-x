import { voidify } from "@argent/x-shared"
import { P1 } from "@argent/x-ui"
import { Box, FormControl, Link, Text } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { ARGENT_X_LEGAL_PRIVACY_POLICY_URL } from "../../../shared/api/constants"
import { ControlledInput } from "../../components/ControlledInput"
import { emailSchema } from "../argentAccount/argentAccountBaseEmailScreen.model"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

interface OnboardingSmartAccountEmailScreenProps {
  onBack: () => void
  onSubmit: (data: z.infer<typeof emailSchema>) => void
}

export const OnboardingSmartAccountEmailScreen: FC<
  OnboardingSmartAccountEmailScreenProps
> = ({ onBack, onSubmit: onSubmitProp }) => {
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

  const onSubmit = handleSubmit(onSubmitProp)

  return (
    <OnboardingScreen
      onBack={onBack}
      length={5}
      currentIndex={3}
      title={"Setup two-factor authentication"}
      illustration={"2fa"}
      subtitle={
        <P1 color="text-secondary-web">
          Protect your account with a 2FA challenge when recovering the
          accounts. You can also use an encrypted email for extra security and
          privacy.&nbsp;
          <Link
            href="https://www.argent.xyz/blog/smart-wallet-features"
            target="_blank"
            color="text-brand"
          >
            Learn more
          </Link>
        </P1>
      }
    >
      <FormControl
        as="form"
        display={"flex"}
        flexDirection={"column"}
        gap={3}
        onSubmit={voidify(onSubmit)}
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
          We use email for security alerts. For unsubscribing and other details
          see our{" "}
          <Link
            href={ARGENT_X_LEGAL_PRIVACY_POLICY_URL}
            target="_blank"
            color="text-brand"
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
