import { FC, ReactNode, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { CopyTooltip } from "../../components/CopyTooltip"
import { IconBar } from "../../components/IconBar"
import { Paragraph } from "../../components/Page"
import { H2 } from "../../components/Typography"
import { checkPassword } from "../../services/backgroundSessions"
import { StickyGroup } from "../actions/ConfirmScreen"
import { PasswordForm } from "../onboarding/PasswordForm"
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
  return (
    <>
      <IconBar back close />
      <Container>
        <H2>Export private key</H2>
        {children}
      </Container>
    </>
  )
}

export const ExportPrivateKeyScreen: FC = () => {
  const [isPasswordValid, setPasswordValid] = useState(false)

  const navigate = useNavigate()

  const privateKey = usePrivateKey()

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
          {({ isDirty, isSubmitting }) => (
            <StickyGroup>
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                Export
              </Button>
            </StickyGroup>
          )}
        </PasswordForm>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Paragraph>This is your private key (click to copy)</Paragraph>
      {privateKey && (
        <CopyTooltip copyValue={privateKey} message="Copied">
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
