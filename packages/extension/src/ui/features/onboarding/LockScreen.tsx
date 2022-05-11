import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { Button } from "../../components/Button"
import { P, StyledLink } from "../../components/Typography"
import { routes } from "../../routes"
import { StickyGroup } from "../actions/ConfirmScreen"
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
        onSubmit={() => useAppState.setState({ isLoading: true })}
        onFailure={() => useAppState.setState({ isLoading: false })}
        onSuccess={(target) => {
          useAppState.setState({ isLoading: false })
          navigate(target)
        }}
      >
        {(isDirty) => (
          <>
            <StyledLink to={routes.reset()}>reset or restore backup</StyledLink>
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
