import { BarBackButton, NavigationContainer } from "@argent/ui"
import { FC, FormEventHandler } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { routes } from "../../routes"
import { downloadBackupFile } from "../../services/backgroundRecovery"
import { H2, P } from "../../theme/Typography"
import { useBackupRequired } from "./backupDownload.state"

const DownloadButton = styled(Button)`
  margin-top: auto;
`

const Container = styled.div`
  padding: 0px 40px 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 68px);
`

export const BackupDownloadScreen: FC = () => {
  const navigate = useNavigate()
  const { search } = useLocation()

  const isSettings = new URLSearchParams(search).has("settings")

  const handleDownloadClick: FormEventHandler = async () => {
    downloadBackupFile()
    useBackupRequired.setState({ isBackupRequired: false })
    navigate(isSettings ? routes.settings() : routes.accountTokens())
  }

  return (
    <NavigationContainer leftButton={isSettings ? <BarBackButton /> : null}>
      <Container>
        <H2>Download your backup</H2>
        <P>
          This is encrypted by your password and required if you need to restore
          your accounts.
        </P>
        <P style={{ marginTop: 10 }}>
          Each time you add a new account, you&apos;ll be prompted to download
          an updated backup file for all your accounts.
        </P>
        <DownloadButton onClick={handleDownloadClick}>Download</DownloadButton>
      </Container>
    </NavigationContainer>
  )
}
