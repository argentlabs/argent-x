import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button, ButtonGroup } from "../../components/Button"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { P } from "../../theme/Typography"
import { extensionIsInTab, openExtensionInTab } from "../browser/tabs"
import { Greetings, GreetingsWrapper } from "../lock/Greetings"
import LogoSvg from "../lock/logo.svg"
import { StickyArgentFooter } from "./StickyArgentFooter"

const WelcomeScreenWrapper = styled.div`
  padding: 70px 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > ${GreetingsWrapper} {
    text-align: center;
  }

  > ${P} {
    text-align: center;
    margin-top: 1em;
  }

  > ${ButtonGroup} {
    margin-top: 64px;
  }
`

const greetings = [
  "Get started",
  "Welcome!",
  "gm!",
  "Hello!",
  "Guten Tag!",
  "Привет!",
  "gm, ser!",
  "hi fren",
]

export const OnboardingStartScreen: FC = () => {
  const navigate = useNavigate()
  usePageTracking("welcome")

  useEffect(() => {
    const init = async () => {
      const inTab = await extensionIsInTab()
      if (!inTab) {
        /** Note: cannot detect and focus an existing extension tab here, so open a new one */
        await openExtensionInTab()
        window.close()
      }
    }
    init()
  }, [])

  return (
    <WelcomeScreenWrapper>
      <LogoSvg />
      <Greetings greetings={greetings} />
      <P>Enjoy the security of Ethereum with the scale of StarkNet</P>
      <ButtonGroup>
        <Button onClick={() => navigate(routes.onboardingDisclaimer())}>
          New wallet
        </Button>
        <Button onClick={() => navigate(routes.seedRecovery())}>
          Restore wallet
        </Button>
      </ButtonGroup>
      <StickyArgentFooter />
    </WelcomeScreenWrapper>
  )
}
