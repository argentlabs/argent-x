import { FC, useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { StyledControlledInput } from "../../components/InputText"
import { routes } from "../../routes"
import {
  analytics,
  usePageTracking,
  useTimeSpentWithSuccessTracking,
} from "../../services/analytics"
import { selectAccount } from "../../services/backgroundAccounts"
import { FormError } from "../../theme/Typography"
import { createAccount } from "../accounts/accounts.service"
import { validatePassword } from "../recovery/seedRecovery.state"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: stretch;
`

const StyledOnboardingButton = styled(OnboardingButton)`
  margin-top: 20px;
`

interface FieldValues {
  password: string
  repeatPassword: string
}

interface NewWalletScreenProps {
  overrideSubmit?: (values: { password: string }) => Promise<void>
  overrideTitle?: string
  overrideSubmitText?: string
}

export const OnboardingPasswordScreen: FC<NewWalletScreenProps> = ({
  overrideSubmit,
  overrideTitle,
  overrideSubmitText,
}) => {
  usePageTracking("createWallet")
  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "newWalletPassword" },
  )
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { control, handleSubmit, formState, watch } = useForm<FieldValues>({
    criteriaMode: "firstError",
  })
  const { errors, isDirty } = formState
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployFailed, setDeployFailed] = useState(false)

  const password = watch("password")

  const handleDeploy = useCallback(
    async (password?: string) => {
      if (!password) {
        return
      }
      if (overrideSubmit) {
        useAppState.setState({ isLoading: true })
        await overrideSubmit({ password })
        useAppState.setState({ isLoading: false })
      } else {
        setIsDeploying(true)
        setDeployFailed(false)
        try {
          const newAccount = await createAccount(switcherNetworkId, password)
          selectAccount(newAccount)
          analytics.track("createWallet", {
            status: "success",
            networkId: newAccount.networkId,
          })
          setIsDeploying(false)
          trackSuccess()
          navigate(routes.onboardingFinish.path, { replace: true })
        } catch (error: any) {
          analytics.track("createWallet", {
            status: "failure",
            errorMessage: error.message,
            networkId: switcherNetworkId,
          })
          setIsDeploying(false)
          setDeployFailed(true)
        }
      }
    },
    [navigate, overrideSubmit, switcherNetworkId, trackSuccess],
  )

  const buttonText = useMemo(() => {
    if (overrideSubmitText) {
      return overrideSubmitText
    }
    if (isDeploying) {
      return "Creating wallet…"
    }
    return deployFailed ? "Retry create wallet" : "Create wallet"
  }, [deployFailed, isDeploying, overrideSubmitText])

  return (
    <OnboardingScreen
      back
      length={4}
      currentIndex={2}
      title={overrideTitle || "New wallet"}
      subtitle="Enter a password to protect your wallet"
    >
      <Form onSubmit={handleSubmit(({ password }) => handleDeploy(password))}>
        <StyledControlledInput
          name="password"
          control={control}
          defaultValue=""
          rules={{ required: true, validate: validatePassword }}
          autoFocus
          type="password"
          placeholder="Password"
          disabled={isDeploying}
          variant="neutrals800"
        />
        {errors.password?.type === "required" && (
          <FormError>A new password is required</FormError>
        )}
        {errors.password?.type === "validate" && (
          <FormError>Password is too short</FormError>
        )}
        <StyledControlledInput
          name="repeatPassword"
          control={control}
          defaultValue=""
          rules={{ validate: (x) => x === password }}
          type="password"
          placeholder="Repeat password"
          disabled={isDeploying}
          variant="neutrals800"
        />
        {errors.repeatPassword?.type === "validate" && (
          <FormError>Passwords do not match</FormError>
        )}
        {deployFailed && (
          <FormError>
            Sorry, unable to create wallet. Please try again later.
          </FormError>
        )}
        <StyledOnboardingButton
          type="submit"
          disabled={!isDirty || isDeploying}
        >
          {buttonText}
        </StyledOnboardingButton>
      </Form>
    </OnboardingScreen>
  )
}
