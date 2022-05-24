import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { Button } from "../../components/Button"
import { P, StyledLink } from "../../components/Typography"
import { routes } from "../../routes"
import { startSession } from "../../services/messaging"
import { StickyGroup } from "../actions/ConfirmScreen"
import { recover } from "../recovery/recovery.service"
import { Greetings, GreetingsWrapper } from "./Greetings"
import LogoSvg from "./logo.svg"
import { PasswordForm } from "./PasswordForm"

const LockScreenWrapper = styled.div`
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

  ${StyledLink} {
    margin-top: 16px;
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

export const LockScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <LockScreenWrapper>
      <LogoSvg />
      <Greetings greetings={greetings} />
      <P>Unlock your wallet to continue.</P>

      <PasswordForm
        verifyPassword={async (password) => {
          useAppState.setState({ isLoading: true })
          try {
            await startSession(password)
            const target = await recover()
            useAppState.setState({ isLoading: false })
            navigate(target)
            return true
          } catch {
            useAppState.setState({ isLoading: false })
            return false
          }
        }}
      >
        {(isDirty) => (
          <>
            <StyledLink to={routes.reset()}>reset or recover</StyledLink>
            <StickyGroup>
              <Button type="submit" disabled={!isDirty}>
                Unlock
              </Button>
            </StickyGroup>
          </>
        )}
      </PasswordForm>
    </LockScreenWrapper>
  )
}
