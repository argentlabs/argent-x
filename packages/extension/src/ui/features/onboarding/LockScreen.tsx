import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { Button } from "../../components/Button"
import { P, StyledLink } from "../../components/Typography"
import { routes } from "../../routes"
import { unlockedExtensionTodayTracking } from "../../services/analytics"
import { startSession } from "../../services/backgroundSessions"
import { useActions } from "../actions/actions.state"
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

const isPopup = new URLSearchParams(window.location.search).has("popup")

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
            unlockedExtensionTodayTracking()
            const target = await recover()

            // If only called by dapp (in popup) because the wallet was locked, but the dapp is already whitelisted/no transactions requested (actions=0), then close
            if (isPopup && !useActions.getState().actions.length) {
              window.close()
            }

            useAppState.setState({ isLoading: false })
            navigate(target)
            return true
          } catch {
            useAppState.setState({
              isLoading: false,
              error: "Incorrect password",
            })
            return false
          }
        }}
      >
        {({ isDirty, isSubmitting }) => (
          <>
            <StyledLink to={routes.reset()}>reset or recover</StyledLink>
            <StickyGroup>
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                Unlock
              </Button>
            </StickyGroup>
          </>
        )}
      </PasswordForm>
    </LockScreenWrapper>
  )
}
