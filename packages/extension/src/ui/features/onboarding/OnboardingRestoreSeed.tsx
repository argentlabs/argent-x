import { SeedInput } from "@argent/ui"
import { FC, useMemo, useState } from "react"
import styled from "styled-components"

import { RowBetween } from "../../components/Row"
import { routes } from "../../routes"
import {
  usePageTracking,
  useTimeSpentWithSuccessTracking,
} from "../../services/analytics"
import { FormError } from "../../theme/Typography"
import { validateAndSetSeedPhrase } from "../recovery/seedRecovery.state"
import { useCustomNavigate } from "../recovery/useCustomNavigate"
import { StatusMessageBanner } from "../statusMessage/StatusMessageBanner"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

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
  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "restoreSeedphrase" },
  )
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
      trackSuccess()
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
      <SeedInput
        mb="1"
        onChange={(seed) => {
          setError("")
          setSeedPhraseInput(seed)
        }}
      />
      {error && <FormError>{error}</FormError>}

      <StatusMessageBanner
        extendable={false}
        statusMessage={{
          message: "Never shown",
          dismissable: false,
          summary:
            "You can paste your recovery phrase at once, but typing the words individually is safer",
          level: "warn",
        }}
        onDismiss={() => {
          // not possible
        }}
        style={{
          marginTop: "32px",
          width: "100%",
        }}
      />

      <RowBetween style={{ paddingTop: "32px" }}>
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
