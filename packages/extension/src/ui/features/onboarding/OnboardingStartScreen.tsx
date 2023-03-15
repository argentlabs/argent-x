import { FC, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

import {
  AccountBalanceWalletIcon,
  RefreshIcon,
} from "../../components/Icons/MuiIcons"
import Row from "../../components/Row"
import { routes } from "../../routes"
import {
  usePageTracking,
  useTimeSpentWithSuccessTracking,
} from "../../services/analytics"
import { extensionIsInTab, openExtensionInTab } from "../browser/tabs"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import {
  CreateWalletRectButtonIcon,
  RectButton,
  RestoreWalletRectButtonIcon,
} from "./ui/RectButton"

export const OnboardingStartScreen: FC = () => {
  const didRunInit = useRef(false)
  const navigate = useNavigate()
  usePageTracking("welcome")
  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "welcome" },
  )

  useEffect(() => {
    const init = async () => {
      /** prevent opening more than once when useEffect is called multiple times in dev */
      if (!didRunInit.current) {
        didRunInit.current = true
        /** When user clicks extension icon, open onboarding in full screen */
        const inTab = await extensionIsInTab()
        if (!inTab) {
          /** Note: cannot detect and focus an existing extension tab here, so open a new one */
          await openExtensionInTab()
          window.close()
        }
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
        <RectButton
          onClick={() => {
            trackSuccess()
            navigate(routes.onboardingDisclaimer())
          }}
        >
          <CreateWalletRectButtonIcon>
            <AccountBalanceWalletIcon />
          </CreateWalletRectButtonIcon>
          Create a new wallet
        </RectButton>
        <RectButton
          onClick={() => {
            trackSuccess()
            navigate(routes.onboardingRestoreSeed())
          }}
        >
          <RestoreWalletRectButtonIcon>
            <RefreshIcon />
          </RestoreWalletRectButtonIcon>
          Restore an existing wallet
        </RectButton>
      </Row>
    </OnboardingScreen>
  )
}
