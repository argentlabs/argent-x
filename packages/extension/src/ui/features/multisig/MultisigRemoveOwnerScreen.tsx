import { isEmpty } from "lodash-es"
import { FC, useMemo } from "react"
import { FormProvider, useFormContext } from "react-hook-form"

import { removeMultisigOwner } from "../../../shared/multisig/multisig.service"
import { useRouteSignerToRemove } from "../../routes"
import { Account } from "../accounts/Account"
import { useRouteAccount } from "../shield/useRouteAccount"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import {
  FieldValuesThresholdForm,
  useUpdateThresholdForm,
} from "./hooks/useUpdateThreshold"
import { BaseMultisigConfirmations } from "./MultisigConfirmationsScreen"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"

export const MultisigRemoveOwnersScreen: FC = () => {
  const account = useRouteAccount()
  const signerToRemove = useRouteSignerToRemove()

  return (
    <MultisigSettingsWrapper>
      {account && signerToRemove && (
        <MultisigRemoveOwnerAccountWrapper
          account={account}
          signerToRemove={signerToRemove}
        />
      )}
    </MultisigSettingsWrapper>
  )
}

const MultisigRemoveOwnerAccountWrapper = ({
  account,
  signerToRemove,
}: {
  account: Account
  signerToRemove: string
}) => {
  const { multisig } = useMultisigInfo(account)
  const newTotalSigners = useMemo(
    () => (multisig?.signers.length ? multisig.signers.length - 1 : undefined),
    [multisig?.signers],
  )
  const methods = useUpdateThresholdForm(newTotalSigners)

  return (
    <FormProvider {...methods}>
      <MultisigRemove
        account={account}
        signerToRemove={signerToRemove}
        totalSigners={newTotalSigners}
      />
    </FormProvider>
  )
}

const MultisigRemove = ({
  account,
  signerToRemove,
  totalSigners,
}: {
  account: Account
  signerToRemove: string
  totalSigners?: number
}) => {
  const {
    trigger,
    formState: { errors },
    getValues,
  } = useFormContext<FieldValuesThresholdForm>()
  const handleSubmit = () => {
    trigger()
    const newThreshold = getValues("confirmations")
    if (isEmpty(errors) && signerToRemove && account?.address) {
      removeMultisigOwner({
        signerToRemove,
        newThreshold,
        address: account?.address,
      })
    }
  }

  return (
    <BaseMultisigConfirmations
      account={account}
      handleNextClick={handleSubmit}
      totalSigners={totalSigners}
    />
  )
}
