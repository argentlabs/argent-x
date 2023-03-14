import { useState } from "react"
import { FormProvider } from "react-hook-form"

import { useNextSignerKey } from "../../accounts/usePublicKey"
import { useCreateMultisigForm } from "../hooks/useCreateMultisigForm"
import { MultisigFirstStep } from "./MultisigFirstStep"
import { MultisigSecondStep } from "./MultisigSecondStep"
import { MultisigThirdStep } from "./MultisigThirdStep"

const FIRST_STEP = 0
const SECOND_STEP = 1
const THIRD_STEP = 2

export const CreateMultisigStartScreen = () => {
  const [currentStep, setStep] = useState(FIRST_STEP)
  const creatorSignerKey = useNextSignerKey()

  const methods = useCreateMultisigForm(creatorSignerKey)
  const goBack = () => setStep((step) => step - 1)
  const goNext = () => setStep((step) => step + 1)

  return (
    <FormProvider {...methods}>
      {currentStep === FIRST_STEP && (
        <MultisigFirstStep goNext={goNext} index={FIRST_STEP} />
      )}
      {currentStep === SECOND_STEP && (
        <MultisigSecondStep
          goNext={goNext}
          index={SECOND_STEP}
          goBack={goBack}
        />
      )}
      {currentStep === THIRD_STEP && (
        <MultisigThirdStep goBack={goBack} index={THIRD_STEP} />
      )}
    </FormProvider>
  )
}
