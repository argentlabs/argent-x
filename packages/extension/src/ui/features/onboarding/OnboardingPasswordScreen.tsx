import { Box, FormControl } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC, MouseEventHandler } from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { AllowPromise } from "../../../shared/storage/types"
import { ControlledInput } from "../../components/ControlledInput"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { PasswordStrengthIndicator } from "@argent/x-ui"
import { IS_DEV } from "../../../shared/utils/dev"

const MIN_PASSWORD_LENGTH = IS_DEV ? 1 : 8
const setPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `Must contain at least ${MIN_PASSWORD_LENGTH} characters`,
      ),
    repeatPassword: z.string(), // not using passwordSchema here, as we want to show a different error message
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  })

type PasswordForm = z.infer<typeof setPasswordFormSchema>

export interface OnboardingPasswordScreenProps {
  title?: string
  submitText?: {
    start: string
    submitting: string
    retryAfterError?: string
  }
  onSubmit: (password: string) => AllowPromise<void>
  onBack?: MouseEventHandler
  length?: number
  currentIndex?: number
}

export const OnboardingPasswordScreen: FC<OnboardingPasswordScreenProps> = ({
  title = "Password",
  submitText,
  onBack,
  onSubmit,
  length,
  currentIndex,
}) => {
  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PasswordForm>({
    criteriaMode: "firstError",
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      password: "",
      repeatPassword: "",
    },
  })

  const submitButtonText = useMemo(
    () =>
      errors.root?.message
        ? (submitText?.retryAfterError ?? "Retry")
        : isSubmitting
          ? (submitText?.submitting ?? "Continuing...")
          : (submitText?.start ?? "Continue"),
    [isSubmitting, errors.root?.message, submitText],
  )

  const handleForm = handleSubmit(async ({ password }) => {
    try {
      await onSubmit(password)
    } catch {
      setError("root", { message: "Something went wrong" })
    }
  })

  return (
    <OnboardingScreen
      onBack={onBack}
      length={length ?? 5} // there are 5 steps in the onboarding process
      currentIndex={currentIndex ?? 2} // this is the 3rd step
      title={title}
      subtitle="This is used to protect and unlock your wallet"
      illustration="password"
    >
      <FormControl
        as="form"
        display={"flex"}
        flexDirection={"column"}
        gap={3}
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
        onSubmit={handleForm}
      >
        <PasswordStrengthIndicator password={watch("password")}>
          <ControlledInput
            name="password"
            control={control}
            autoFocus
            type="password"
            placeholder="Password"
            isDisabled={isSubmitting}
          />
          <PasswordStrengthIndicator.Label />
          <ControlledInput
            name="repeatPassword"
            control={control}
            type="password"
            placeholder="Repeat password"
            isDisabled={isSubmitting}
          />
          <PasswordStrengthIndicator.Comment />
        </PasswordStrengthIndicator>
        <Box>
          <OnboardingButton
            mt={12}
            type="submit"
            isDisabled={!isDirty || isSubmitting}
          >
            {submitButtonText}
          </OnboardingButton>
        </Box>
      </FormControl>
    </OnboardingScreen>
  )
}
