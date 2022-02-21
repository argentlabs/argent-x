import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { sendMessage } from "../../shared/messages"
import { P } from "../components/Typography"
import { routes } from "../routes"
import { useAccount } from "../states/account"
import { useAppState } from "../states/app"
import { ConfirmScreen } from "./ConfirmScreen"

export const ResetScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <ConfirmScreen
      title="Reset wallet"
      confirmButtonText="RESET"
      confirmButtonBgColor="#c12026"
      rejectButtonText="Cancel"
      onSubmit={() => {
        sendMessage({ type: "RESET_ALL" })
        localStorage.clear()
        useAppState.setState({ isFirstRender: true })
        useAccount.setState({ wallets: {}, selectedWallet: undefined })
        navigate(routes.welcome())
      }}
    >
      <P>
        If you forgot your password, your only option for recovery is to reset
        the extension and load your previously downloaded backup.
      </P>
      <P style={{ marginTop: 32 }}>
        The backup downloads automatically each time you add an account to your
        wallet.
      </P>
    </ConfirmScreen>
  )
}
