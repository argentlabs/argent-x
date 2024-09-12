import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import {
  isSignerInMultisigView,
  multisigView,
} from "../../multisig/multisig.state"
import { MultisigConfirmationsBanner } from "../transaction/MultisigConfirmationsBanner"

export const useMultisigActionScreen = () => {
  const account = useView(selectedAccountView)

  const multisig = useView(multisigView(account))
  const signerIsInMultisig = useView(isSignerInMultisigView(account))
  const multisigBanner = multisig && account && (
    <MultisigConfirmationsBanner account={account} confirmations={0} />
  )

  return {
    multisig,
    multisigBanner,
    signerIsInMultisig,
  }
}
