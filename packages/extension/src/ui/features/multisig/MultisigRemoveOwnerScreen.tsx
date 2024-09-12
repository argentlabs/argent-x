import { FC, useMemo } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { useRouteSignerToRemove } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"
import {
  FieldValuesThresholdForm,
  useUpdateThresholdForm,
} from "./hooks/useUpdateThreshold"
import { multisigView } from "./multisig.state"
import { BaseMultisigConfirmations } from "./MultisigConfirmationsScreen"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { multisigService } from "../../services/multisig"
import { decodeBase58 } from "@argent/x-shared"
import { useView } from "../../views/implementation/react"
import { WalletAccount } from "../../../shared/wallet.model"

export const MultisigRemoveOwnersScreen: FC = () => {
  const account = useRouteWalletAccount()
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
  account: WalletAccount
  signerToRemove: string
}) => {
  const multisig = useView(multisigView(account))

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
  account: WalletAccount
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
