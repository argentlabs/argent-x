import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { sendMessage } from "../../shared/messages"
import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import { InputText } from "../components/Input"
import { H2, P } from "../components/Typography"
import { routes } from "../routes"
import { useGlobalState } from "../states/global"

const SettingsScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 32px 24px 32px;

  ${P} {
    margin: 16px 0;
  }

  ${Button} {
    margin-top: 10px;
  }
`

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const SettingsScreen: FC = () => {
  const navigate = useNavigate()
  const { localhostPort } = useGlobalState()

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <SettingsScreenWrapper>
        <H2>Settings</H2>
        <Button
          onClick={() => {
            sendMessage({ type: "STOP_SESSION" })
            navigate(routes.password)
          }}
        >
          Lock wallet
        </Button>

        <P>
          Dapps you have previously connected to can auto-connect in the future.
          Require all dapps to request a new connection to your wallet?
        </P>
        <Button
          onClick={() => {
            sendMessage({ type: "RESET_WHITELIST" })
            navigate(-1)
          }}
        >
          Reset dapp connections
        </Button>

        <P>The backup file contains all your accounts, keep it secure.</P>
        <Button
          onClick={() => {
            sendMessage({ type: "DOWNLOAD_BACKUP_FILE" })
            navigate(-1)
          }}
        >
          Download backup file
        </Button>

        <P>
          For developers only: the port number of your local node. Important
          note: accounts created with a given port stay tied to that port, even
          if you change this setting later.
        </P>
        <InputText
          placeholder="Localhost port"
          type="number"
          value={localhostPort}
          onChange={(e: any) => {
            localStorage.setItem("port", `${e.target.value}`)
            useGlobalState.setState({ localhostPort: e.target.value })
          }}
        />
        <Footer>
          <P>Help, support &amp; suggestions:</P>
          <div>
            <a
              href="https://discord.com/channels/793094838509764618/908663762150645770"
              title="Ask a question on the argent-extension channel on StarkNet Discord"
              target="_blank"
            >
              <img
                src="https://images.prismic.io/argentwebsite/76eac5a3-a4a3-4395-a82a-a3def2438ff0_icon-discord.svg?auto=format%2Ccompress&amp;fit=max&amp;q=50"
                alt="Argent Discord icon"
              />
            </a>
            <a
              href="https://github.com/argentlabs/argent-x/issues"
              title="Post an issue on Argent X GitHub"
              target="_blank"
              style={{ marginLeft: 15 }}
            >
              <img
                src="https://images.prismic.io/argentwebsite/460e2528-d9bb-4a47-9339-b72c287c243e_icon-github.svg?auto=format%2Ccompress&amp;fit=max&amp;q=50"
                alt="Argent Github icon"
              />
            </a>
          </div>
          <P>Version: v{process.env.VERSION}</P>
        </Footer>
      </SettingsScreenWrapper>
    </>
  )
}
