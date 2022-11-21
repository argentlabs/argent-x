import { FC } from "react"
import styled from "styled-components"

import { DiscordIcon } from "../../components/Icons/DiscordIcon"
import { GithubIcon } from "../../components/Icons/GithubIcon"
import { SupportIcon } from "../../components/Icons/SupportIcon"
import { PrivacyStatementLink } from "../../components/PrivacyStatementLink"
import { RowCentered } from "../../components/Row"
import { routes } from "../../routes"

const IconWrapper = styled(RowCentered)`
  padding: 8px 10px 8px 8px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 100px;
  gap: 8px;
`

const IconText = styled.span`
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  color: ${({ theme }) => theme.text1};
`

const StyledPrivacyStatementLink = styled(PrivacyStatementLink)`
  margin-top: 20px;
`

export const P = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.text2};
  margin-top: 16px;
`

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    padding-bottom: 16px;
  }
`

const SupportFooter: FC = () => (
  <Footer>
    <P>Help, support &amp; suggestions:</P>
    <RowCentered gap="10px">
      <a
        href="https://support.argent.xyz/hc/en-us/categories/5767453283473-Argent-X"
        title="Get ArgentX Support"
        target="_blank"
      >
        <IconWrapper>
          <SupportIcon />
          <IconText>Support</IconText>
        </IconWrapper>
      </a>
      <a
        href="https://discord.gg/T4PDFHxm6T"
        title="Ask a question on the argent-x-support channel on Discord"
        target="_blank"
      >
        <IconWrapper>
          <DiscordIcon />
          <IconText>Discord</IconText>
        </IconWrapper>
      </a>
      <a
        href="https://github.com/argentlabs/argent-x/issues"
        title="Post an issue on Argent X GitHub"
        target="_blank"
      >
        <IconWrapper>
          <GithubIcon />
          <IconText>Github</IconText>
        </IconWrapper>
      </a>
    </RowCentered>
    <StyledPrivacyStatementLink to={routes.settingsPrivacyStatement()} />
    <P style={{ marginTop: "8px" }}>Version: v{process.env.VERSION}</P>
  </Footer>
)

export { SupportFooter }
