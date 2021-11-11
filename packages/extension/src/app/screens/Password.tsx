import { FC, useMemo, useState } from "react"
import styled from "styled-components"

import LogoSvg from "../../assets/logo.svg"
import { Button } from "../components/Button"
import { Greetings, GreetingsWrapper } from "../components/Greetings"
import { InputText } from "../components/Input"
import { A, P } from "../components/Typography"
import { makeClickable } from "../utils/a11y"
import { isValidPassword } from "./NewSeed"

const PasswordScreen = styled.div`
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

interface PasswordProps {
  onSubmit?: (password: string) => void
  onForgotPassword?: () => void
}

const greetings = [
  "gm!",
  "Hello!",
  "Guten Tag!",
  "Привет!",
  "gm, ser!",
  "hi fren",
]

export const Password: FC<PasswordProps> = ({ onSubmit, onForgotPassword }) => {
  const [password, setPassword] = useState("")

  const disableSubmit = useMemo(() => {
    return !isValidPassword(password)
  }, [password])

  return (
    <PasswordScreen>
      <LogoSvg />
      <Greetings greetings={greetings} />
      <P>Unlock your wallet to continue.</P>

      <form onSubmit={() => onSubmit?.(password)}>
        <InputText
          autoFocus
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
        />
        <A {...makeClickable(onForgotPassword)}>or import backup</A>
        <Button type="submit" disabled={disableSubmit}>
          Unlock
        </Button>
      </form>
    </PasswordScreen>
  )
}
