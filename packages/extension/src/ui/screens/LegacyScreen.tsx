import { FC, FormEventHandler } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { sendMessage } from "../../shared/messages"
import { Button } from "../components/Button"
import { H2, P } from "../components/Typography"
import { routes } from "../routes"

const DownloadButton = styled(Button)`
  margin-top: 20px;
`

const ContinueButton = styled(Button)`
  margin-top: auto;
`

const Container = styled.div`
  padding: 40px 40px 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 68px);
`

export const LegacyScreen: FC = () => {
  const navigate = useNavigate()

  const handleDownload: FormEventHandler = async () => {
    sendMessage({ type: "DOWNLOAD_LEGACY_BACKUP_FILE" })
  }

  return (
    <>
      <Container>
        <H2>Breaking Changes</H2>
        <P>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Pellentesque vitae ex ut ipsum tristique laoreet.
        </P>
        <P style={{ marginTop: 10 }}>
          Nam facilisis vehicula velit ut sodales. For more info click
          <a href="https://www.notion.so/Notion-Pages-1ef3eac24f954c69afc30edf76679935" 
            target="_blank"
            rel="noreferrer"
            style={{ color: "#8ab4f8" }}
          >
              this link
          </a>
        </P>
        <DownloadButton onClick={handleDownload}>Download</DownloadButton>
        <ContinueButton onClick={() => navigate(routes.welcome())}>
          Continue without downloading
        </ContinueButton>
      </Container>
    </>
  )
}
