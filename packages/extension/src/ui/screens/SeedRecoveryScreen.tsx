import { FC, useMemo, useState, useRef } from "react"

import { BackButton } from "../components/BackButton"
import { TextArea } from "../components/InputText"
import { IconBar } from "../components/Recovery/IconBar"
import { A, FormError, P } from "../components/Typography"
import { useCustomNavigate } from "../hooks/useCustomNavigate"
import { routes } from "../routes"
import { validateAndSetSeedPhrase } from "../states/seedRecover"
import { ConfirmScreen } from "./ConfirmScreen"

export const SeedRecoveryScreen: FC = () => {
  const textAreaElement = useRef<HTMLTextAreaElement>(null);
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
      customNavigate(routes.seedRecoveryPassword())
    } catch {
      setError("Invalid seed phrase")
    }
  }

  return (
    <>
      <IconBar>
        <BackButton />
      </IconBar>
      <ConfirmScreen
        title="Restore accounts"
        confirmButtonText="Continue"
        singleButton
        disableConfirm={disableSubmit}
        onSubmit={handleRestoreClick}
        smallTopPadding
      >
        <P>
          Enter each of the 12 words from your recovery phrase separated by a
          space
        </P>
        <TextArea
          ref={textAreaElement}
          placeholder="Enter the 12 words"
          value={seedPhraseInput}
          onChange={(e: any) => {
            setError("")
            setSeedPhraseInput(e.target.value)
          }}
          style={{
            margin: "40px 0 8px",
          }}
          autoComplete="off"
        />
        {error && <FormError>{error}</FormError>}
        <A
          style={{ padding: "0", marginTop: "16px" }}
          onClick={() => {
            customNavigate(routes.backupRecovery())
          }}
        >
          Recover using a backup file
        </A>
      </ConfirmScreen>
    </>
  )
}
