import { FC, useState } from "react"
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
}

const FIRST_STEP = 1
const SECOND_STEP = 2
const THIRD_STEP = 3

export const CreateMultisigWithLedger: FC<
  CreateMultisigWithLedgerScreenProps
> = ({ networkId, currentStep: initialCurrentStep, helpLink }) => {
  const [currentStep, setStep] = useState(initialCurrentStep)
  const creatorSignerKey = useNextSignerKey(
    "multisig",
    SignerType.LEDGER,
    networkId,
  )

  const methods = useCreateMultisigForm(creatorSignerKey)
  const goBack = () => setStep((step) => step - 1)
  const goNext = () => setStep((step) => step + 1)

  return (
    <FormProvider {...methods}>
      {currentStep === FIRST_STEP && (
        <MultisigFirstStep
          goNext={goNext}
          index={FIRST_STEP}
          creatorSignerKey={creatorSignerKey}
          totalSteps={4}
          filledIndicator
        />
      )}
      {currentStep === SECOND_STEP && (
        <MultisigSecondStep
          goNext={goNext}
          index={SECOND_STEP}
          goBack={goBack}
          creatorSignerKey={creatorSignerKey}
          networkId={networkId}
          creatorType={SignerType.LEDGER}
          totalSteps={4}
          filledIndicator
        />
      )}
      {currentStep === THIRD_STEP && (
        <MultisigThirdStep
          goBack={goBack}
          index={THIRD_STEP}
          totalSteps={4}
          creatorType={SignerType.LEDGER}
          filledIndicator
        />
      )}
      {helpLink && <LedgerHelpButton helpLink={helpLink} />}
    </FormProvider>
  )
}
