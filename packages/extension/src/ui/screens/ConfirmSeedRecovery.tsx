import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { IconBarWithIcons } from "../components/Recovery/IconBar"
import { P } from "../components/Typography"
import { routes } from "../routes"
import { useBackupRequired } from "../states/backupDownload"
import { ConfirmScreen } from "./ConfirmScreen"

const SConfirmScreen = styled(ConfirmScreen)`
  padding-top: 18px;
`

export const ConfirmSeedRecoveryPage: FC = () => {
  const navigate = useNavigate()
  return (
    <>
      <IconBarWithIcons showBack />
      <SConfirmScreen
        title="Have you written down the recovery phrase?"
        switchButtonOrder
        rejectButtonText="No"
        confirmButtonText="Yes"
        onSubmit={() => {
          useBackupRequired.setState({ isBackupRequired: false })
          navigate(routes.account())
        }}
        onReject={() => {
          navigate(-1)
        }}
      >
        <P>
          If you lose your recovery phrase or someone steals it, you will lose
          access to your funds.
        </P>
      </SConfirmScreen>
    </>
  )
}
