import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { P } from "../components/Typography"
import { routes } from "../routes"
import { useAccount } from "../states/account"
import { useAppState } from "../states/app"
import { upgradeAccount } from "../utils/messaging"
import { ConfirmScreen } from "./ConfirmScreen"

const StyledP = styled(P)`
  margin-bottom: 16px;
  line-height: 1.5em;
`

export const UpgradeScreen: FC = () => {
  const navigate = useNavigate()
  const { selectedAccount } = useAccount()

  // If no account is selected, navigate to the account list screen. Dont show anything while doing so.
  useEffect(() => {
    if (!selectedAccount) {
      navigate(routes.accounts())
    }
  }, [])
  if (!selectedAccount) {
    return <></>
  }

  return (
    <ConfirmScreen
      title="Upgrade Wallet"
      confirmButtonText="Upgrade"
      rejectButtonText="Cancel"
      onSubmit={async () => {
        useAppState.setState({ isLoading: true })
        await upgradeAccount(selectedAccount)
        useAppState.setState({ isLoading: false })
        navigate(routes.accountTokens())
      }}
      onReject={() => {
        navigate(routes.accountTokens())
      }}
    >
      <StyledP>
        You will upgrade your wallet implementation to use the latest features
        and security.
      </StyledP>
      <StyledP>
        This upgrade is required due to network and account contract changes. We
        expect these kind of upgrades to be less frequent as the network
        matures.
      </StyledP>
    </ConfirmScreen>
  )
}
