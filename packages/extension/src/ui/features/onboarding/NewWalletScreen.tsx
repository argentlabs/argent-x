import { FC, useCallback, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { Button } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { InputText } from "../../components/InputText"
import { routes } from "../../routes"
import { analytics, usePageTracking } from "../../services/analytics"
import { connectAccount } from "../../services/backgroundAccounts"
import { FormError, H2, P } from "../../theme/Typography"
import { deployAccount } from "../accounts/accounts.service"
import { useAccounts } from "../accounts/accounts.state"
import { StickyGroup } from "../actions/ConfirmScreen"
import { recover } from "../recovery/recovery.service"
import { validatePassword } from "../recovery/seedRecovery.state"

const Container = styled.div`
  padding: 48px 40px 24px;
  display: flex;
  flex-direction: column;

  ${InputText} {
    margin-top: 15px;
  }
`

const ErrorText = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${({ theme }) => theme.red2};
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

export const NewWalletScreen: FC<NewWalletScreenProps> = ({
  overrideSubmit,
  overrideTitle,
  overrideSubmitText,
}) => {
  usePageTracking("createWallet")
  const navigate = useNavigate()
  const { addAccount } = useAccounts()
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
          const newAccount = await deployAccount(switcherNetworkId, password)
          addAccount(newAccount)
          connectAccount(newAccount)
          analytics.track("createWallet", {
            status: "success",
            networkId: newAccount.networkId,
          })
          setIsDeploying(false)
          navigate(await recover())
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
    [addAccount, navigate, overrideSubmit, switcherNetworkId],
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
    <>
      <IconBar back={routes.welcome()} />
      <Container>
        <H2>{overrideTitle || "New wallet"}</H2>
        <P>Enter a password to protect your wallet</P>
        <form onSubmit={handleSubmit(({ password }) => handleDeploy(password))}>
          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: true, validate: validatePassword }}
            render={({ field: { ref, ...field } }) => (
              <InputText
                autoFocus
                type="password"
                placeholder="Password"
                disabled={isDeploying}
                {...field}
              />
            )}
          />
          {errors.password?.type === "required" && (
            <FormError>A new password is required</FormError>
          )}
          {errors.password?.type === "validate" && (
            <FormError>Password is too short</FormError>
          )}
          <Controller
            name="repeatPassword"
            control={control}
            rules={{ validate: (x) => x === password }}
            defaultValue=""
            render={({ field: { ref, ...field } }) => (
              <InputText
                type="password"
                placeholder="Repeat password"
                disabled={isDeploying}
                {...field}
              />
            )}
          />
          {errors.repeatPassword?.type === "validate" && (
            <FormError>Passwords do not match</FormError>
          )}
          <StickyGroup>
            {deployFailed && (
              <ErrorText>
                Sorry, unable to create wallet. Please try again later.
              </ErrorText>
            )}
            <Button type="submit" disabled={!isDirty || isDeploying}>
              {buttonText}
            </Button>
          </StickyGroup>
        </form>
      </Container>
    </>
  )
}
