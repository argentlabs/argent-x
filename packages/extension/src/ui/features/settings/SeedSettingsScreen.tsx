import { FC, ReactNode, useState } from "react"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { Paragraph } from "../../components/Page"
import { P } from "../../components/Typography"
import { checkPassword } from "../../services/messaging"
import { PasswordForm } from "../onboarding/PasswordForm"
import { SeedPhrase } from "../recovery/SeedPhrase"
import { useSeedPhrase } from "../recovery/useSeedPhrase"

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

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <IconBar back close />
    <Container>{children}</Container>
  </>
)

export const SeedSettingsScreen: FC = () => {
  const seedPhrase = useSeedPhrase()
  const [passwordIsValid, setPasswordIsValid] = useState(false)

  if (!passwordIsValid) {
    return (
      <Wrapper>
        <Paragraph>DO NOT share this phrase with anyone!</Paragraph>
        <Paragraph>
          These words can be used to steal all your accounts.
        </Paragraph>
        <P>Enter your password to continue:</P>

        <PasswordForm
          verifyPassword={async (password) => {
            const isValid = await checkPassword(password)
            setPasswordIsValid(isValid)
            return isValid
          }}
        >
          {(isDirty) => (
            <Button type="submit" disabled={!isDirty}>
              Continue
            </Button>
          )}
        </PasswordForm>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Paragraph>
        Write these words down on paper. It is unsafe to save them on your
        computer.
      </Paragraph>

      <SeedPhrase seedPhrase={seedPhrase} />
    </Wrapper>
  )
}
