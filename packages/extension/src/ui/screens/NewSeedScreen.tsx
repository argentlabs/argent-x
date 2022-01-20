import { FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { InputText } from "../components/Input"
import { StickyArgentFooter } from "../components/StickyArgentFooter"
import { FormError, H2, P } from "../components/Typography"
import { routes } from "../routes"
import { useGlobalState } from "../states/global"
import { deployWallet } from "../utils/wallet"

const NewSeedScreenWrapper = styled.div`
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

export const NewSeedScreen: FC = () => {
  const { networkId, localhostPort, addWallet } = useGlobalState()
  const navigate = useNavigate()
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

  const handleDeploy = async (password: string) => {
    try {
      const newWallet = await deployWallet(networkId, localhostPort, password)
      addWallet(newWallet)
      useGlobalState.setState({ selectedWallet: newWallet.address })
      navigate(routes.account)
    } catch {
      navigate(routes.accounts)
    }
  }

  return (
    <NewSeedScreenWrapper>
      <BackButton />
      <H2>New password</H2>
      <P>Enter a password to protect your account</P>
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
    </NewSeedScreenWrapper>
  )
}
