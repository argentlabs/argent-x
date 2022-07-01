import { FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { Button } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { InputText } from "../../components/InputText"
import { FormError, H2, P } from "../../components/Typography"
import { routes } from "../../routes"
import { analytics, usePageTracking } from "../../services/analytics"
import { connectAccount } from "../../services/backgroundAccounts"
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
  ${Button} {
    margin-top: 116px;
  }
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

  const password = watch("password")

  const handleDeploy = async (password?: string) => {
    if (!password) {
      return
    }
    useAppState.setState({ isLoading: true })

    if (overrideSubmit) {
      await overrideSubmit({ password })
    } else {
      try {
        const newAccount = await deployAccount(switcherNetworkId, password)
        addAccount(newAccount)
        connectAccount(newAccount)
        analytics.track("createWallet", {
          status: "success",
          networkId: newAccount.networkId,
        })
        navigate(await recover())
      } catch (error: any) {
        useAppState.setState({ error })
        analytics.track("createWallet", {
          status: "failure",
          errorMessage: error.message,
          networkId: switcherNetworkId,
        })
        navigate(routes.error())
      }
    }
    useAppState.setState({ isLoading: false })
  }

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
                {...field}
              />
            )}
          />
          {errors.repeatPassword?.type === "validate" && (
            <FormError>Passwords do not match</FormError>
          )}

          <StickyGroup>
            <Button type="submit" disabled={!isDirty}>
              {overrideSubmitText || "Create wallet"}
            </Button>
          </StickyGroup>
        </form>
      </Container>
    </>
  )
}
