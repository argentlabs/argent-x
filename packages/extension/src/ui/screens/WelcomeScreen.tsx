import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button, ButtonGroup } from "../components/Button"
import { Greetings, GreetingsWrapper } from "../components/Greetings"
import { StickyArgentFooter } from "../components/StickyArgentFooter"
import { P } from "../components/Typography"
import { useCustomNavigate } from "../hooks/useCustomNavigate"
import { routes } from "../routes"

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
  const customNavigate = useCustomNavigate()

  return (
    <WelcomeScreenWrapper>
      <img width="112" height="112" src='../../assets/logo.png' />
      <Greetings greetings={greetings} />
      <P>Enjoy the security of Ethereum with the scale of StarkNet</P>
      <ButtonGroup>
        <Button onClick={() => navigate(routes.newWallet())}>New wallet</Button>
        <Button
          onClick={async () => await customNavigate(routes.backupRecovery())}
        >
          Restore wallet
        </Button>
      </ButtonGroup>
      <StickyArgentFooter />
    </WelcomeScreenWrapper>
  )
}
