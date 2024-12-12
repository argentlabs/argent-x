import type { FC } from "react"
import { useState } from "react"
import { ImportLedgerAccounts } from "./ImportLedgerAccounts"
import { ImportedLedgerAccountsSuccess } from "./ImportLedgerAccountsSuccess"

const FIRST_STEP = 1
const SECOND_STEP = 2

export const ImportLedgerAccountsContainer: FC<{
  currentStep: number
  networkId: string
  userAccountHelpLink: string
  totalSteps: number
}> = ({
  currentStep: initialCurrentStep,
  networkId,
  userAccountHelpLink,
  totalSteps,
}) => {
  const [step, setStep] = useState(initialCurrentStep)
  const goNext = () => setStep((step) => step + 1)

  return (
    <>
      {step === FIRST_STEP && (
        <ImportLedgerAccounts
          goNext={goNext}
          currentStep={FIRST_STEP}
          totalSteps={totalSteps}
          networkId={networkId}
          helpLink={userAccountHelpLink}
          filledIndicator
        />
      )}
      {step === SECOND_STEP && (
        <ImportedLedgerAccountsSuccess
          index={SECOND_STEP}
          totalSteps={totalSteps}
          helpLink={userAccountHelpLink}
          filledIndicator
        />
      )}
    </>
  )
}
