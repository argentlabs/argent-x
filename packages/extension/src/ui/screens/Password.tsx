import { FC, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import styled from "styled-components"

import LogoSvg from "../../assets/logo.svg"
import { Button } from "../components/Button"
import { Greetings, GreetingsWrapper } from "../components/Greetings"
import { InputText } from "../components/Input"
import { A, FormError, P } from "../components/Typography"
import { makeClickable } from "../utils/a11y"
import { isValidPassword } from "./NewSeed"

const PasswordScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 32px;
  text-align: center;

  > ${GreetingsWrapper} {
    margin: 48px 0 32px;
  }

  > form {
    margin-top: 32px;
    width: 100%;
  }

  ${A} {
    margin-top: 16px;
  }

  ${Button} {
    margin-top: 64px;
  }
`

interface PasswordScreenProps {
  onSubmit?: (password: string) => void
  onForgotPassword?: () => void
  error?: string
}

export const greetings = [
  "gm!",
  "Hello!",
  "Guten Tag!",
  "Привет!",
  "gm, ser!",
  "hi fren",
]

export const PasswordScreen: FC<PasswordScreenProps> = ({
  onSubmit,
  onForgotPassword,
  error,
}) => {
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    setError,
  } = useForm<{ password: string }>()

  useEffect(() => {
    setError("password", {
      message: error,
    })
  }, [error])

  return (
    <PasswordScreenWrapper>
      <LogoSvg />
      <Greetings greetings={greetings} />
      <P>Unlock your wallet to continue.</P>

      <form onSubmit={handleSubmit(({ password }) => onSubmit?.(password))}>
        <Controller
          name="password"
          control={control}
          rules={{ required: true, validate: isValidPassword }}
          defaultValue=""
          render={({ field: { ref, ...field } }) => (
            <InputText
              autoFocus
              placeholder="Password"
              type="password"
              {...field}
            />
          )}
        />
        {errors.password?.type === "validate" && (
          <FormError>Password is too short</FormError>
        )}
        {errors.password?.type === "required" && (
          <FormError>Password is required</FormError>
        )}
        {errors.password?.message && (
          <FormError>{errors.password.message}</FormError>
        )}

        <A {...makeClickable(onForgotPassword)}>reset or import backup</A>
        <Button type="submit" disabled={!isDirty}>
          Unlock
        </Button>
      </form>
    </PasswordScreenWrapper>
  )
}
