import { FC, useMemo, useRef, useState } from "react"
import styled from "styled-components"

import { TextArea } from "../../components/InputText"
import { RowBetween } from "../../components/Row"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { FormError } from "../../theme/Typography"
import { validateAndSetSeedPhrase } from "../recovery/seedRecovery.state"
import { useCustomNavigate } from "../recovery/useCustomNavigate"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

const StyledTextArea = styled(TextArea)`
  margin-bottom: 32px;
`

const RestoreBackupLink = styled.span`
  padding: 0;
  color: ${({ theme }) => theme.text3};
  font-weight: 400;
  font-size: 12px;
  text-decoration-line: underline;
  cursor: pointer;
`

export const OnboardingRestoreSeed: FC = () => {
  usePageTracking("restoreWallet")
  const textAreaElement = useRef<HTMLTextAreaElement>(null)
  const [seedPhraseInput, setSeedPhraseInput] = useState("")
  const [error, setError] = useState("")
  const customNavigate = useCustomNavigate()

  const disableSubmit = useMemo(
    () => Boolean(!seedPhraseInput || error),
    [seedPhraseInput, error],
  )
  const handleRestoreClick = async () => {
    try {
      validateAndSetSeedPhrase(seedPhraseInput)
      if (textAreaElement.current !== null) {
        textAreaElement.current.value = ""
      }
      customNavigate(routes.onboardingRestorePassword())
    } catch {
      setError("Invalid seed phrase")
    }
  }

  return (
    <OnboardingScreen
      back
      length={4}
      currentIndex={1}
      title={"Restore accounts"}
      subtitle="Enter each of the 12 words from your recovery phrase separated by a
      space"
    >
      <StyledTextArea
        autoFocus
        ref={textAreaElement}
        placeholder="Enter the 12 words"
        value={seedPhraseInput}
        onChange={(e: any) => {
          setError("")
          setSeedPhraseInput(e.target.value)
        }}
        autoComplete="off"
        variant="neutrals800"
      />
      {error && <FormError>{error}</FormError>}
      <RowBetween>
        <OnboardingButton onClick={handleRestoreClick} disabled={disableSubmit}>
          Continue
        </OnboardingButton>
        <RestoreBackupLink
          onClick={() => {
            customNavigate(routes.onboardingRestoreBackup())
          }}
        >
          Recover using a backup file
        </RestoreBackupLink>
      </RowBetween>
    </OnboardingScreen>
  )
}
