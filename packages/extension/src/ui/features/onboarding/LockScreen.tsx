import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { Button } from "../../components/Button"
import { routes } from "../../routes"
import { unlockedExtensionTracking } from "../../services/analytics"
import { startSession } from "../../services/backgroundSessions"
import { P, StyledLink } from "../../theme/Typography"
import { useActions } from "../actions/actions.state"
import { StickyGroup } from "../actions/ConfirmScreen"
import { EXTENSION_IS_POPUP } from "../browser/constants"
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
            unlockedExtensionTracking()
            const target = await recover()

            // If only called by dapp (in popup) because the wallet was locked, but the dapp is already whitelisted/no transactions requested (actions=0), then close
            if (EXTENSION_IS_POPUP && !useActions.getState().actions.length) {
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
