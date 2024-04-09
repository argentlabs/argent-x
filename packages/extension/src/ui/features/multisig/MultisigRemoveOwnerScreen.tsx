import { FC, useMemo } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { routes, useRouteSignerToRemove } from "../../routes"
import { Account } from "../accounts/Account"
import { useRouteAccount } from "../shield/useRouteAccount"
import {
  FieldValuesThresholdForm,
  useUpdateThresholdForm,
} from "./hooks/useUpdateThreshold"
import { useMultisig } from "./multisig.state"
import { BaseMultisigConfirmations } from "./MultisigConfirmationsScreen"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { multisigService } from "../../services/multisig"
import { decodeBase58 } from "@argent/x-shared"

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

  const newThreshold = useMemo(
    () =>
      newTotalSigners &&
      multisig?.threshold &&
      Math.max(Math.min(newTotalSigners, multisig?.threshold), 1),
    [newTotalSigners, multisig?.threshold],
  )

  const methods = useUpdateThresholdForm(newTotalSigners)

  return (
    <FormProvider {...methods}>
      <MultisigRemove
        account={account}
        multisigPublicKey={multisig?.publicKey}
        signerToRemove={signerToRemove}
        totalSigners={newTotalSigners}
        newThreshold={newThreshold}
      />
    </FormProvider>
  )
}

const MultisigRemove = ({
  account,
  multisigPublicKey,
  signerToRemove,
  totalSigners,
  newThreshold,
}: {
  account: Account
  multisigPublicKey?: string
  signerToRemove: string
  totalSigners?: number
  newThreshold?: number
}) => {
  const { trigger, getValues } = useFormContext<FieldValuesThresholdForm>()

  const navigate = useNavigate()

  const handleSubmit = async () => {
    const isValid = await trigger()
    const newThreshold = getValues("confirmations")
    if (isValid && signerToRemove && account?.address) {
      await multisigService.removeOwner({
        signerToRemove,
        newThreshold,
        address: account?.address,
      })

      if (multisigPublicKey) {
        await multisigService.removeSignerMetadata(
          multisigPublicKey,
          decodeBase58(signerToRemove),
        )
      }
      navigate(routes.accountActivity())
    }
  }

  return (
    <BaseMultisigConfirmations
      account={account}
      handleNextClick={handleSubmit}
      totalSigners={totalSigners}
      threshold={newThreshold}
    />
  )
}
