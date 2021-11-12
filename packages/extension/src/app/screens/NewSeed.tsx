import { FC, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { InputText } from "../components/Input"
import { StickyArgentFooter } from "../components/StickyArgentFooter"
import { FormError, H2, P } from "../components/Typography"

const NewSeedScreen = styled.div`
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

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

interface NewSeedProps {
  onSubmit?: (password: string) => void
  onBack?: () => void
}

export function isValidPassword(password: string): boolean {
  return password.length > 5
}

export const NewSeed: FC<NewSeedProps> = ({
  onSubmit = noop,
  onBack = noop,
}) => {
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
  return (
    <NewSeedScreen>
      <BackButton onClick={onBack} />
      <H2>New password</H2>
      <P>Enter a password to protect your account</P>
      <form onSubmit={handleSubmit(({ password }) => onSubmit(password))}>
        <Controller
          name="password"
          control={control}
          rules={{ required: true, validate: isValidPassword }}
          render={({ field }) => (
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
          render={({ field }) => (
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
          Create Wallet
        </Button>
      </form>
      <StickyArgentFooter />
    </NewSeedScreen>
  )
}
