import { FC, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import LogoSvg from "../../assets/logo.svg"
import { Button } from "../components/Button"
import { Greetings, GreetingsWrapper } from "../components/Greetings"
import { InputText } from "../components/Input"
import { A, FormError, P } from "../components/Typography"
import { routes } from "../routes"
import { useAppState } from "../states/app"
import { useProgress } from "../states/progress"
import { makeClickable } from "../utils/a11y"
import { monitorProgress, startSession } from "../utils/messaging"
import { recover } from "../utils/recovery"
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
  const navigate = useNavigate()
  const { error } = useAppState()
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

  const verifyPassword = async (password: string) => {
    try {
      monitorProgress((progress) => {
        useProgress.setState({ progress, text: "Decrypting ..." })
      })

      await startSession(password)

      useProgress.setState({ progress: 0, text: "" })
      useAppState.setState({ error: undefined })
      const target = await recover()
      navigate(target)
    } catch {
      useAppState.setState({ error: "Wrong password" })
    }
  }

  return (
    <PasswordScreenWrapper>
      <LogoSvg />
      <Greetings greetings={greetings} />
      <P>Unlock your wallet to continue.</P>

      <form onSubmit={handleSubmit(({ password }) => verifyPassword(password))}>
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
