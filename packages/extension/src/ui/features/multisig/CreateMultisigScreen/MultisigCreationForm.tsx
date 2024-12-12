import type { SignerType } from "../../../../shared/wallet.model"
import { useNextSignerKey } from "../../accounts/usePublicKey"
import { useCreateMultisigForm } from "../hooks/useCreateMultisigForm"
import { MultisigFirstStep } from "./MultisigFirstStep"
import { MultisigSecondStep } from "./MultisigSecondStep"
import { MultisigThirdStep } from "./MultisigThirdStep"
import { useState } from "react"
import { FormProvider } from "react-hook-form"

const FIRST_STEP = 0
const SECOND_STEP = 1
const THIRD_STEP = 2

export interface MultisigCreationFormProps {
  networkId: string
  signerType: SignerType
  initialStep?: number
  totalSteps?: number
}

export const MultisigCreationForm = ({
  networkId,
  signerType,
  initialStep = FIRST_STEP,
  totalSteps = 3,
}: MultisigCreationFormProps) => {
  const [currentStep, setStep] = useState(initialStep)
  const creator = useNextSignerKey("multisig", signerType, networkId)

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
        />
      )}
      {currentStep === SECOND_STEP && (
        <MultisigSecondStep
          goNext={goNext}
          index={SECOND_STEP}
          goBack={goBack}
          creator={creator}
          networkId={networkId}
          creatorType={signerType}
          totalSteps={totalSteps}
        />
      )}
      {currentStep === THIRD_STEP && (
        <MultisigThirdStep
          goBack={goBack}
          index={THIRD_STEP}
          totalSteps={totalSteps}
          creatorType={signerType}
        />
      )}
    </FormProvider>
  )
}
