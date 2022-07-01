import { FC, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { P } from "../../components/Typography"
import { routes } from "../../routes"
import { upgradeAccount } from "../../services/backgroundAccounts"
import { executeTransaction } from "../../services/backgroundTransactions"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { useAccounts } from "./accounts.state"

const StyledP = styled(P)`
  margin-bottom: 16px;
  line-height: 1.5em;
`

export const UpgradeScreen: FC = () => {
  const navigate = useNavigate()
  const { selectedAccount } = useAccounts()

  // If no account is selected, navigate to the account list screen. Dont show anything while doing so.
  useEffect(() => {
    if (!selectedAccount) {
      navigate(routes.accounts())
    }
  }, [])

  const test = useCallback(async () => {
    await executeTransaction({
      transactions: {
        contractAddress:
          "0x6a7a6243f92a347c03c935ce4834c47cbd2a951536c10319168866db9d57983",
        entrypoint: "transfer",
        calldata: [
          "2650693541979826037787345793241568095729089735202478624863150922418593968070",
          "1000000000000000",
          "0",
        ],
      },
    })
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
        // useAppState.setState({ isLoading: true })
        // await upgradeAccount(selectedAccount)
        // useAppState.setState({ isLoading: false })
        await test()
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
