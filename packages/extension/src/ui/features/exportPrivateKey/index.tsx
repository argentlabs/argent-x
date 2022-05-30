import { FC, ReactNode } from "react"
import styled from "styled-components"

import { sendMessage } from "../../../shared/messages"
import { Button } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { Paragraph } from "../../components/Page"
import { H2 } from "../../components/Typography"
import { checkPassword } from "../../services/messaging"
import { StickyGroup } from "../actions/ConfirmScreen"
import { PasswordForm } from "../onboarding/PasswordForm"

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

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <IconBar back close />
      <Container>
        <H2>Export Private Key</H2>
        {children}
      </Container>
    </>
  )
}

export const ExportPrivateKeyScreen: FC = () => {
  const handleVerifyPassword = async (password: any) => {
    const isValid = await checkPassword(password)

    if (isValid) {
      sendMessage({ type: "EXPORT_PRIVATE_KEY" })
    }

    return isValid
  }

  return (
    <Wrapper>
      <Paragraph>Enter your password to export your private key.</Paragraph>

      <PasswordForm verifyPassword={handleVerifyPassword}>
        {(isDirty) => (
          <StickyGroup>
            <Button type="submit" disabled={!isDirty}>
              Continue
            </Button>
          </StickyGroup>
        )}
      </PasswordForm>
    </Wrapper>
  )
}
