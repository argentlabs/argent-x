import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button, ButtonGroup, PressableButton } from "../../components/Button"
import {
  AccountBalanceWalletIcon,
  RefreshIcon,
} from "../../components/Icons/MuiIcons"
import { Title } from "../../components/Page"
import Row from "../../components/Row"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { P, P3 } from "../../theme/Typography"
import { extensionIsInTab, openExtensionInTab } from "../browser/tabs"
import { ContentWrapper, LedgerPage, PageWrapper, Panel } from "../ledger/Page"
import { StepIndicator } from "../ledger/StepIndicator"
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

const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CreateWalletIcon = styled(IconContainer)`
  background-color: ${({ theme }) => theme.primary};
`

const RestoreWalletIcon = styled(IconContainer)`
  background-color: ${({ theme }) => theme.neutrals700};
`

const RectButton = styled(PressableButton).attrs(() => ({
  variant: "neutrals800",
}))`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  padding: 36px 18px;
`

export const OnboardingStartScreen: FC = () => {
  const navigate = useNavigate()
  usePageTracking("welcome")

  useEffect(() => {
    const init = async () => {
      /** When user clicks extension icon, open onboarding in full screen */
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
    <LedgerPage>
      <LogoSvg />
      <ContentWrapper>
        <StepIndicator length={3} currentIndex={0} />
        <Title style={{ marginTop: "32px" }}>Welcome to Argent X</Title>
        <P3>Enjoy the security of Ethereum with the scale of StarkNet</P3>
        <Row gap={"12px"} align="stretch">
          <RectButton onClick={() => navigate(routes.onboardingDisclaimer())}>
            <CreateWalletIcon>
              <AccountBalanceWalletIcon />
            </CreateWalletIcon>
            Create a new wallet
          </RectButton>
          <RectButton onClick={() => navigate(routes.seedRecovery())}>
            <RestoreWalletIcon>
              <RefreshIcon />
            </RestoreWalletIcon>
            Restore an existing wallet
          </RectButton>
        </Row>
        <ButtonGroup>
          <Button onClick={() => navigate(routes.ledgerEntry())}>Ledger</Button>
        </ButtonGroup>
      </ContentWrapper>
    </LedgerPage>
  )

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
        <Button onClick={() => navigate(routes.ledgerEntry())}>Ledger</Button>
      </ButtonGroup>
      <StickyArgentFooter />
    </WelcomeScreenWrapper>
  )
}
