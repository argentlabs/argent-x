import { FC, ReactNode, useState } from "react"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { IconBar } from "../../components/IconBar"
import { Paragraph } from "../../components/Page"
import { useReturnTo } from "../../routes"
import { checkPassword } from "../../services/backgroundSessions"
import { H2 } from "../../theme/Typography"
import { StickyGroup } from "../actions/ConfirmScreen"
import { PasswordForm } from "../lock/PasswordForm"
import { CopySeedPhrase } from "../recovery/CopySeedPhrase"
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

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const returnTo = useReturnTo()
  return (
    <>
      <IconBar back close={returnTo} />
      <Container>
        <H2>View recovery phrase</H2>
        {children}
      </Container>
    </>
  )
}

export const SeedSettingsScreen: FC = () => {
  const seedPhrase = useSeedPhrase()
  const [passwordIsValid, setPasswordIsValid] = useState(false)

  if (!passwordIsValid) {
    return (
      <Wrapper>
        <Paragraph>Enter your password to view your recovery phrase.</Paragraph>

        <PasswordForm
          verifyPassword={async (password) => {
            const isValid = await checkPassword(password)
            setPasswordIsValid(isValid)
            return isValid
          }}
        >
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

  return (
    <Wrapper>
      <Paragraph>
        Write these words down on paper. It is unsafe to save them on your
        computer.
      </Paragraph>

      <SeedPhrase seedPhrase={seedPhrase} />

      <CopySeedPhrase seedPhrase={seedPhrase} />
    </Wrapper>
  )
}
