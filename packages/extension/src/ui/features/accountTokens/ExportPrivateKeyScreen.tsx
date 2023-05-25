import { BarBackButton, BarCloseButton, NavigationContainer } from "@argent/ui"
import { FC, ReactNode, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { CopyTooltip } from "../../components/CopyTooltip"
import { Paragraph } from "../../components/Page"
import { routes, useRouteAccountAddress } from "../../routes"
import { checkPassword } from "../../services/backgroundSessions"
import { H2 } from "../../theme/Typography"
import { StickyGroup } from "../actions/DeprecatedConfirmScreen"
import { PasswordForm } from "../lock/PasswordForm"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { StatusMessageBanner } from "../statusMessage/StatusMessageBanner"
import { usePrivateKey } from "./usePrivateKey"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 32px 0 32px;

  form {
    padding-top: 16px;

    ${Button} {
      margin-top: 16px;
    }
  }
`

const KeyContainer = styled.div`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg1};
  border-radius: 4px;
  padding: 9px 13px 8px;
  overflow-wrap: break-word;
  font-size: 16px;
  line-height: 140%;
  cursor: pointer;
`

const WarningContainer = styled.div`
  margin-top: 15px;
  border: 1px solid ${({ theme }) => theme.bg2};
  padding: 9px 13px 8px;
  overflow-wrap: break-word;
  font-size: 14px;
  line-height: 120%;
  border-radius: 4px;
`

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
      <Container>
        <H2>Export private key</H2>
        {children}
      </Container>
    </NavigationContainer>
  )
}

export const ExportPrivateKeyScreen: FC = () => {
  const [isPasswordValid, setPasswordValid] = useState(false)

  const navigate = useNavigate()
  const accountAddress = useRouteAccountAddress()
  const network = useCurrentNetwork()

  const privateKey = usePrivateKey(accountAddress, network.id)

  const handleVerifyPassword = async (password: any) => {
    const isValid = await checkPassword(password)
    setPasswordValid(isValid)
    return isValid
  }

  if (!isPasswordValid) {
    return (
      <Wrapper>
        <Paragraph>Enter your password to export your private key.</Paragraph>

        <PasswordForm verifyPassword={handleVerifyPassword}>
          {() => (
            <StickyGroup>
              <Button type="submit">Export</Button>
            </StickyGroup>
          )}
        </PasswordForm>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Paragraph>This is your private key (click to copy)</Paragraph>

      <StatusMessageBanner
        extendable={false}
        statusMessage={{
          message: "Never shown",
          dismissable: false,
          summary:
            "This is a feature for developers only. You wont be able to recover your account with the private key! Please backup your Seed Phrase instead.",
          level: "warn",
        }}
        onDismiss={() => {
          // not possible
        }}
        style={{
          marginBottom: "16px",
          width: "100%",
        }}
      />

      {privateKey && (
        <CopyTooltip
          copyValue={privateKey}
          message="Copied"
          data-testid="privateKey"
        >
          <KeyContainer>{privateKey}</KeyContainer>
        </CopyTooltip>
      )}

      <WarningContainer>
        Warning: Never disclose this key. Anyone with your private keys can
        steal any assets held in your account.
      </WarningContainer>

      <StickyGroup>
        <Button onClick={() => navigate(-1)}>Done</Button>
      </StickyGroup>
    </Wrapper>
  )
}
