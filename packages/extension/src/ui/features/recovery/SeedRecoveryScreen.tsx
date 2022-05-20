import { FC, useMemo, useRef, useState } from "react"

import { IconBar } from "../../components/IconBar"
import { TextArea } from "../../components/InputText"
import { A, FormError, P } from "../../components/Typography"
import { routes } from "../../routes"
import { usePageTrack } from "../../services/analytics"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { validateAndSetSeedPhrase } from "./seedRecovery.state"
import { useCustomNavigate } from "./useCustomNavigate"

export const SeedRecoveryScreen: FC = () => {
  usePageTrack("restoreWallet")
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
      customNavigate(routes.seedRecoveryPassword())
    } catch {
      setError("Invalid seed phrase")
    }
  }

  return (
    <>
      <IconBar back close />
      <ConfirmScreen
        title="Restore accounts"
        confirmButtonText="Continue"
        singleButton
        confirmButtonDisabled={disableSubmit}
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
