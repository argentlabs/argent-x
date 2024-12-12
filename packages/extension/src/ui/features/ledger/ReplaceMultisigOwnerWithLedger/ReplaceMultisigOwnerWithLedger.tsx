import { P2 } from "@argent/x-ui"
import { Divider } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback } from "react"
import { FormProvider } from "react-hook-form"
import { updateBaseMultisigAccount } from "../../../../shared/multisig/utils/baseMultisig"
import { SignerType } from "../../../../shared/wallet.model"
import { ActionButton } from "../../../components/FullScreenPage"
import { clientUIService } from "../../../services/ui"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import {
  useEncodedPublicKey,
  useNextPublicKey,
} from "../../accounts/usePublicKey"
import { useReplaceMultisigOwner } from "../../multisig/hooks/useReplaceMultisigOwner"
import { useReplaceOwnerForm } from "../../multisig/hooks/useReplaceOwnerForm"
import { baseMultisigView } from "../../multisig/multisig.state"
import { ReplaceOwnerForm } from "../../multisig/ReplaceOwnerForm"
import { SidePanel } from "../layout/Panel"
import { ScreenLayout } from "../layout/ScreenLayout"

interface ReplaceMultisigOwnerWithLedgerProps {
  networkId: string
  currentStep: number
  helpLink?: string
  signerToReplace?: string
  totalSteps: number
}

export const ReplaceMultisigOwnerWithLedger: FC<
  ReplaceMultisigOwnerWithLedgerProps
> = ({ networkId, currentStep, helpLink, signerToReplace, totalSteps }) => {
  const methods = useReplaceOwnerForm()

  if (!signerToReplace) {
    return null
  }

  return (
    <ScreenLayout
      title="Replace owner"
      subtitle="Set a new owner for this multisig"
      currentIndex={currentStep}
      length={totalSteps}
      helpLink={helpLink}
      sidePanel={<SidePanel />}
      filledIndicator
    >
      <FormProvider {...methods}>
        <ReplaceMultisigOwnerWithLedgerContent
          signerToReplace={signerToReplace}
          networkId={networkId}
        />
      </FormProvider>
    </ScreenLayout>
  )
}

const ReplaceMultisigOwnerWithLedgerContent = ({
  signerToReplace,
  networkId,
}: {
  signerToReplace: string
  networkId: string
}) => {
  const { pubKey, derivationPath } = useNextPublicKey(
    "multisig",
    SignerType.LEDGER,
    networkId,
  )

  const ledgerSignerKey = useEncodedPublicKey(pubKey)

  const replaceMultisigOwner = useReplaceMultisigOwner()

  const account = useView(selectedAccountView)
  const multisig = useView(baseMultisigView(account))

  const onSubmit = useCallback(async () => {
    if (!multisig || !derivationPath || !pubKey) {
      return
    }

    await replaceMultisigOwner(signerToReplace, account, multisig?.publicKey)

    await updateBaseMultisigAccount({
      ...multisig,
      pendingSigner: {
        signer: { type: SignerType.LEDGER, derivationPath },
        pubKey,
      },
    })

    await clientUIService.openUiAsPopup()
    window.close()
  }, [
    account,
    derivationPath,
    multisig,
    pubKey,
    replaceMultisigOwner,
    signerToReplace,
  ])

  return (
    <>
      <P2 color="primary.400" mt={8}>
        For security reasons each owner should have their own Argent X wallet.
        Avoid having 2 signer pubkeys from the same Argent X wallet.
      </P2>
      <Divider color="neutrals.700" my="4" />
      <ReplaceOwnerForm
        signerToRemove={signerToReplace}
        newLedgerSigner={ledgerSignerKey}
        isReplaceWithLedger
      />
      <ActionButton
        mt={3}
        onClick={() => void onSubmit()}
        isDisabled={!ledgerSignerKey}
      >
        Replace owner
      </ActionButton>
    </>
  )
}
