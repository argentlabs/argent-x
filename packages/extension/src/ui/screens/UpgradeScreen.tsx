import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { BackButton } from "../components/BackButton"
import { Header } from "../components/Header"
import { P } from "../components/Typography"
import { routes } from "../routes"
import { useAccount } from "../states/account"
import { useAppState } from "../states/app"
import { updateWallet } from "../utils/messaging"
import { ConfirmScreen } from "./ConfirmScreen"

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
    <>
      <Header>
        <BackButton />
      </Header>
      <ConfirmScreen
        title="Update Wallet"
        confirmButtonText="Update"
        rejectButtonText="Cancel"
        onSubmit={async () => {
          useAppState.setState({ isLoading: true })
          await updateWallet(selectedAccount)
          useAppState.setState({ isLoading: false })
          navigate(routes.account())
        }}
        onReject={() => {
          navigate(routes.account())
        }}
      >
        <P>
          You will update your wallet implementation to use the latest features
          and security.
        </P>
      </ConfirmScreen>
    </>
  )
}
