import { colord } from "colord"
import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import {
  AccountBalanceWalletIcon,
  RefreshIcon,
} from "../../components/Icons/MuiIcons"
import Row from "../../components/Row"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { extensionIsInTab, openExtensionInTab } from "../browser/tabs"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { RectButton } from "./ui/RectButton"

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
  background-color: ${({ theme }) =>
    colord(theme.neutrals600).alpha(0.5).toRgbString()};
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
    <OnboardingScreen
      length={4}
      currentIndex={0}
      title="Welcome to Argent X"
      subtitle="Enjoy the security of Ethereum with the scale of StarkNet"
    >
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
    </OnboardingScreen>
  )
}
