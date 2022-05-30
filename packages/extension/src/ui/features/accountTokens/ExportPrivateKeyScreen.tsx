import { FC, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
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
        <H2>Export private key</H2>
        {children}
      </Container>
    </>
  )
}

export const ExportPrivateKeyScreen: FC = () => {
  const navigate = useNavigate()

  const handleVerifyPassword = async (password: any) => {
    const isValid = await checkPassword(password)

    if (isValid) {
      await sendMessage({ type: "EXPORT_PRIVATE_KEY" })
      navigate(-1)
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
              Export
            </Button>
          </StickyGroup>
        )}
      </PasswordForm>
    </Wrapper>
  )
}
