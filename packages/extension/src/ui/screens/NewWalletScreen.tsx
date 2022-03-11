import { FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import { InputText } from "../components/InputText"
import { StickyArgentFooter } from "../components/StickyArgentFooter"
import { FormError, H2, P } from "../components/Typography"
import { routes } from "../routes"
import { useAccount } from "../states/account"
import { useAppState } from "../states/app"
import { useLocalhostPort } from "../states/localhostPort"
import { connectAccount, deployAccount } from "../utils/accounts"
import { recover } from "../utils/recovery"

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

export function isValidPassword(password: string): boolean {
  return password.length > 5
}

export const NewWalletScreen: FC = () => {
  const navigate = useNavigate()
  const { addAccount } = useAccount()
  const { switcherNetworkId } = useAppState()
  const { localhostPort } = useLocalhostPort()
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<{
    password: string
    repeatPassword: string
  }>({
    criteriaMode: "firstError",
  })
  const password = watch("password")

  const handleDeploy = async (password?: string) => {
    try {
      const newAccount = await deployAccount(
        switcherNetworkId,
        localhostPort,
        "local_secret",
        password,
      )
      addAccount(newAccount)
      connectAccount(newAccount, switcherNetworkId, localhostPort)
      navigate(await recover())
    } catch (error: any) {
      useAppState.setState({ error })
      navigate(routes.error())
    }
  }

  return (
    <>
      <Header>
        <BackButton to={routes.welcome()} />
      </Header>
      <Container>
        <H2>New wallet</H2>
        <P>Enter a password to protect your wallet</P>
        <form onSubmit={handleSubmit(({ password }) => handleDeploy(password))}>
          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: true, validate: isValidPassword }}
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

          <Button type="submit" disabled={!isDirty}>
            Create wallet
          </Button>
        </form>
        <StickyArgentFooter />
      </Container>
    </>
  )
}
