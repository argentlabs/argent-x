import type { FC } from "react"
import { useState } from "react"
import { SignerType } from "../../../../shared/wallet.model"
import { useNextSignerKey } from "../../accounts/usePublicKey"
import { MultisigFirstStep } from "../../multisig/CreateMultisigScreen/MultisigFirstStep"
import { MultisigSecondStep } from "../../multisig/CreateMultisigScreen/MultisigSecondStep"
import { MultisigThirdStep } from "../../multisig/CreateMultisigScreen/MultisigThirdStep"
import { FormProvider } from "react-hook-form"
import { useCreateMultisigForm } from "../../multisig/hooks/useCreateMultisigForm"
import { LedgerHelpButton } from "../layout/ScreenLayout"

interface CreateMultisigWithLedgerScreenProps {
  currentStep: number
  networkId: string
  helpLink?: string
  totalSteps: number
}

const FIRST_STEP = 1
const SECOND_STEP = 2
const THIRD_STEP = 3

export const CreateMultisigWithLedger: FC<
  CreateMultisigWithLedgerScreenProps
> = ({ networkId, currentStep: initialCurrentStep, helpLink, totalSteps }) => {
  const [currentStep, setStep] = useState(initialCurrentStep)
  const creator = useNextSignerKey("multisig", SignerType.LEDGER, networkId)

  const methods = useCreateMultisigForm(creator.pubKey)
  const goBack = () => setStep((step) => step - 1)
  const goNext = () => setStep((step) => step + 1)

  return (
    <FormProvider {...methods}>
      {currentStep === FIRST_STEP && (
        <MultisigFirstStep
          goNext={goNext}
          index={FIRST_STEP}
          creatorSignerKey={creator.pubKey}
          totalSteps={totalSteps}
          filledIndicator
        />
      )}
      {currentStep === SECOND_STEP && (
        <MultisigSecondStep
          goNext={goNext}
          index={SECOND_STEP}
          goBack={goBack}
          creator={creator}
          networkId={networkId}
          creatorType={SignerType.LEDGER}
          totalSteps={totalSteps}
          filledIndicator
        />
      )}
      {currentStep === THIRD_STEP && (
        <MultisigThirdStep
          goBack={goBack}
          index={THIRD_STEP}
          totalSteps={totalSteps}
          creatorType={SignerType.LEDGER}
          filledIndicator
        />
      )}
      {helpLink && <LedgerHelpButton helpLink={helpLink} />}
    </FormProvider>
  )
}
