import { FC, FormEventHandler } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { H2, P } from "../../components/Typography"
import { routes } from "../../routes"
import { downloadLegacyBackupFile } from "../../services/backgroundRecovery"

const ContinueButton = styled(Button)`
  margin-top: auto;
`

const Container = styled.div`
  padding: 88px 40px 24px 40px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 68px);

  ${P} {
    font-weight: 600;
    margin-top: 15px;
  }

  a {
    color: ${({ theme }) => theme.red3};
    text-decoration: none;
  }
`

export const LegacyScreen: FC = () => {
  const navigate = useNavigate()

  const handleDownload: FormEventHandler = async (e) => {
    e.preventDefault()
    downloadLegacyBackupFile()
  }

  return (
    <>
      <Container>
        <H2>Breaking changes</H2>
        <P>
          This version of Argent X includes breaking changes. Your old wallet
          will no longer work. You will need to create a new wallet with new
          accounts.
        </P>
        <P>
          If you wish to transfer assets from your existing accounts, please{" "}
          <a href="download" rel="noreferrer" onClick={handleDownload}>
            download your old wallet{" "}
          </a>
          and then follow these{" "}
          <a
            href="https://github.com/argentlabs/argent-x/blob/develop/docs/Upgrade_v3.md"
            target="_blank"
            rel="noreferrer"
          >
            instructions
          </a>
        </P>
        <ContinueButton onClick={() => navigate(routes.newWallet())}>
          Create new wallet
        </ContinueButton>
      </Container>
    </>
  )
}
