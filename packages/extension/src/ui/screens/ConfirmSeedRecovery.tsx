import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { P } from "../components/Typography"
import { routes } from "../routes"
import { useBackupRequired } from "../states/backupDownload"
import { ConfirmScreen } from "./ConfirmScreen"

export const ConfirmSeedRecoveryPage: FC = () => {
  const navigate = useNavigate()
  return (
    <ConfirmScreen
      title="Have you written down the recovery phrase?"
      switchButtonOrder
      rejectButtonText="No"
      confirmButtonText="Yes"
      onSubmit={() => {
        useBackupRequired.setState({ isBackupRequired: false })
        navigate(routes.accountTokens())
      }}
      onReject={() => {
        navigate(-1)
      }}
    >
      <P>
        If you lose your recovery phrase or someone steals it, you will lose
        access to your funds.
      </P>
    </ConfirmScreen>
  )
}
