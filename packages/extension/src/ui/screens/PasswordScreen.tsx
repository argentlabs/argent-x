import { FC, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import LogoSvg from "../../assets/logo.svg"
import { sendMessage } from "../../shared/messages"
import { Button } from "../components/Button"
import { Greetings, GreetingsWrapper } from "../components/Greetings"
import { InputText } from "../components/Input"
import { A, FormError, P } from "../components/Typography"
import { routes } from "../routes"
import { useGlobalState } from "../states/global"
import { makeClickable } from "../utils/a11y"
import { isValidPassword } from "./NewSeedScreen"

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

export const greetings = [
  "gm!",
  "Hello!",
  "Guten Tag!",
  "Привет!",
  "gm, ser!",
  "hi fren",
]

export const PasswordScreen: FC = ({}) => {
  const { error } = useGlobalState()
  const navigate = useNavigate()
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    setError,
  } = useForm<{ password: string }>()

  useEffect(() => {
    setError("password", { message: error })
  }, [error])

  const handleResetClick = () => navigate(routes.reset)

  return (
    <PasswordScreenWrapper>
      <LogoSvg />
      <Greetings greetings={greetings} />
      <P>Unlock your wallet to continue.</P>

      <form
        onSubmit={handleSubmit(({ password }) => {
          // send({ type: "SUBMIT_PASSWORD", data: { password } })
        })}
      >
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

        <A {...makeClickable(handleResetClick)}>reset or import backup</A>
        <Button type="submit" disabled={!isDirty}>
          Unlock
        </Button>
      </form>
    </PasswordScreenWrapper>
  )
}
