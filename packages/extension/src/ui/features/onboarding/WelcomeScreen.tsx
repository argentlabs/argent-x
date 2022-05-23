import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button, ButtonGroup } from "../../components/Button"
import { P } from "../../components/Typography"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { Greetings, GreetingsWrapper } from "./Greetings"
import LogoSvg from "./logo.svg"
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

export const WelcomeScreen: FC = () => {
  const navigate = useNavigate()
  usePageTracking("welcome")

  return (
    <WelcomeScreenWrapper>
      <LogoSvg />
      <Greetings greetings={greetings} />
      <P>Enjoy the security of Ethereum with the scale of StarkNet</P>
      <ButtonGroup>
        <Button onClick={() => navigate(routes.disclaimer())}>
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
