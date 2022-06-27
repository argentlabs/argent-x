import { FC, ReactNode, useEffect, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { WarningIconRounded } from "../../components/Icons/WarningIconRounded"
import { Paragraph } from "../../components/Page"
import { H2 } from "../../components/Typography"
import { checkPassword } from "../../services/backgroundSessions"
import { StickyGroup } from "../actions/ConfirmScreen"
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

const CopySeedPhraseButton = styled(Button)<{ active: boolean }>`
  padding: 6px 12px;
  background: ${({ active }) =>
    active ? "#FFFFFF" : "rgba(255, 255, 255, 0.25)"};
  color: ${({ active }) => (active ? "#000" : "#fff")};
  border-radius: 100px;
  width: max-content;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  :active,
  :focus {
    background: ${({ active }) =>
      active ? "#FFFFFF" : "rgba(255, 255, 255, 0.25)"};
  }
`

const WarningText = styled.div`
  text-align: center;
  color: #ffbf3d;
  font-size: 12px;
  line-height: 16px;
`

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <IconBar back close />
    <Container>
      <H2>View recovery phrase</H2>
      {children}
    </Container>
  </>
)

export const SeedSettingsScreen: FC = () => {
  const seedPhrase = useSeedPhrase()
  const [passwordIsValid, setPasswordIsValid] = useState(false)

  const [seedPhraseCopied, setSeedPhraseCopied] = useState(false)

  useEffect(() => {
    if (seedPhraseCopied) {
      setTimeout(() => {
        setSeedPhraseCopied(false)
      }, 3000)
    }
  }, [seedPhraseCopied])

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

  if (!seedPhrase) {
    return <></>
  }

  return (
    <Wrapper>
      <Paragraph>
        Write these words down on paper. It is unsafe to save them on your
        computer.
      </Paragraph>

      <SeedPhrase seedPhrase={seedPhrase} />

      <ColumnCenter gap="16px">
        <WarningText>
          We do not recommend copying your recovery phrase to your clipboard. It
          can leave it susceptible to exploit!
        </WarningText>

        <CopyToClipboard
          onCopy={() => setSeedPhraseCopied(true)}
          text={seedPhrase}
        >
          <CopySeedPhraseButton active={seedPhraseCopied}>
            {seedPhraseCopied ? "Copied" : "Copy"}
            <WarningIconRounded />
          </CopySeedPhraseButton>
        </CopyToClipboard>
      </ColumnCenter>
    </Wrapper>
  )
}
