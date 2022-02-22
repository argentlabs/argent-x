import { FC, FormEventHandler } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { sendMessage } from "../../shared/messages"
import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import { H2, P } from "../components/Typography"
import { routes } from "../routes"
import { useBackupDownload } from "../states/backupDownload"

const DownloadButton = styled(Button)`
  margin-top: 20px;
`

const ContinueButton = styled(Button)`
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
  const { isBackupDownloadRequired } = useBackupDownload()

  const isSettings = new URLSearchParams(search).has("settings")

  const handleDownload: FormEventHandler = async () => {
    sendMessage({ type: "DOWNLOAD_BACKUP_FILE" })
    useBackupDownload.setState({ isBackupDownloadRequired: false })
  }

  return (
    <>
      <Header hide={!isSettings}>
        <BackButton />
      </Header>

      <Container>
        <H2>Download your backup</H2>
        <P>
          This is encrypted by your password and required if you need to restore
          your account.
        </P>
        <P style={{ marginTop: 10 }}>
          Each time you add a new account, you&apos;ll be prompted to download
          an updated backup file for all your accounts.
        </P>
        <DownloadButton onClick={handleDownload}>Download</DownloadButton>
        {!isBackupDownloadRequired && !isSettings && (
          <ContinueButton onClick={() => navigate(routes.account())}>
            Continue
          </ContinueButton>
        )}
      </Container>
    </>
  )
}
