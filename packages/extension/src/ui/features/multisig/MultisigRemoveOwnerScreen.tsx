import { FC, useMemo } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { routes, useRouteSignerToRemove } from "../../routes"
import { removeMultisigOwner } from "../../services/backgroundMultisigs"
import { Account } from "../accounts/Account"
import { useRouteAccount } from "../shield/useRouteAccount"
import {
  FieldValuesThresholdForm,
  useUpdateThresholdForm,
} from "./hooks/useUpdateThreshold"
import { useMultisig } from "./multisig.state"
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
  const multisig = useMultisig(account)

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
  const { trigger, getValues } = useFormContext<FieldValuesThresholdForm>()

  const navigate = useNavigate()

  const handleSubmit = async () => {
    const isValid = await trigger()
    const newThreshold = getValues("confirmations")
    if (isValid && signerToRemove && account?.address) {
      await removeMultisigOwner({
        signerToRemove,
        newThreshold,
        address: account?.address,
      })
      navigate(routes.accountActivity())
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
