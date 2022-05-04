import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { sendMessage } from "../../../shared/messages"
import { BackButton } from "../../components/BackButton"
import { Button } from "../../components/Button"
import { Header } from "../../components/Header"
import { ArrowForwardIosIcon } from "../../components/Icons/MuiIcons"
import { H2 } from "../../components/Typography"
import { routes } from "../../routes"

const Title = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: #ffffff;

  display: flex;
  align-items: center;

  svg {
    color: #8f8e8c;
    margin-left: auto;
    font-size: 12px;
  }
`

const P = styled.p`
  font-size: 15px;
  color: #8f8e8c;
  margin-top: 16px;
`

const SettingsScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0 24px 0;

  ${H2} {
    margin: 0 32px 32px 32px;
  }

  ${Button} {
    margin-top: 10px;
  }

  hr {
    border: none;
    height: 1px;
    background-color: #333332;
  }
`

const SettingsItem = styled.div`
  cursor: pointer;
  padding: 24px 32px;

  &:hover svg {
    color: #ffffff;
  }
`

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    padding-bottom: 16px;
  }
`

export const SettingsScreen: FC = () => {
  const navigate = useNavigate()

  const handleLockClick = () => {
    sendMessage({ type: "STOP_SESSION" })
    navigate(routes.lockScreen())
  }

  const handleResetDappConnectionsClick = () => {
    navigate(routes.settingsDappConnections())
  }

  const handleSeedBackupClick = () => {
    navigate(routes.setupSeedRecovery())
  }

  const handleNetworksClick = () => {
    navigate(routes.settingsNetworks())
  }

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <SettingsScreenWrapper>
        <H2>Settings</H2>
        <SettingsItem onClick={handleLockClick}>
          <Title>
            <span>Lock wallet</span>
            <ArrowForwardIosIcon fontSize="inherit" />
          </Title>
        </SettingsItem>
        <hr />
        <SettingsItem onClick={handleResetDappConnectionsClick}>
          <Title>
            <span>Reset dapp connections</span>
            <ArrowForwardIosIcon fontSize="inherit" />
          </Title>
          <P>
            Dapps you have previously connected to can auto-connect in the
            future.
          </P>
        </SettingsItem>
        <hr />
        <SettingsItem onClick={handleSeedBackupClick}>
          <Title>
            <span>Show backup phrase</span>
            <ArrowForwardIosIcon fontSize="inherit" />
          </Title>
          <P>
            Your backup phrase allows anyone to use your account. Keep it
            secure.
          </P>
        </SettingsItem>
        <hr />
        <SettingsItem onClick={handleNetworksClick}>
          <Title>
            <span>Manage networks</span>
            <ArrowForwardIosIcon fontSize="inherit" />
          </Title>
          <P>Here you can add, edit and remove custom networks.</P>
        </SettingsItem>
        <hr />

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
