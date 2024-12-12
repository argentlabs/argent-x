import { noop } from "lodash-es"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../shared/ui/routes"
import { urlWithQuery } from "../../../../shared/utils/url"
import { SignerType } from "../../../../shared/wallet.model"
import { clientUIService } from "../../../services/ui"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useCreatePendingMultisig } from "./useCreatePendingMultisig"

export function useOnArgentSignerSelection() {
  const navigate = useNavigate()
  const selectedAccount = useView(selectedAccountView)
  const { createPendingMultisig } = useCreatePendingMultisig()

  return useCallback(
    async (
      ctx: "create" | "join" | "replace",
      networkId: string,
      signerToReplace?: string,
    ) => {
      switch (ctx) {
        case "create": {
          const url = urlWithQuery("index.html", {
            goto: "multisig",
            networkId,
            creatorType: SignerType.LOCAL_SECRET,
          })
          void chrome.tabs.create({
            url,
          })
          navigate(routes.accounts())
          return clientUIService.closePopup()
        }

        case "join": {
          // Initialize the multisig account with a zero multisig
          const pendingMultisig = await createPendingMultisig(
            networkId,
            SignerType.LOCAL_SECRET,
          )
          if (!pendingMultisig) {
            throw new Error("Failed to create pending multisig")
          }
          return navigate(routes.multisigJoin(pendingMultisig.publicKey))
        }

        case "replace": {
          return navigate(
            routes.multisigReplaceOwner(selectedAccount?.id, signerToReplace),
          )
        }

        default:
          return noop
      }
    },
    [createPendingMultisig, navigate, selectedAccount?.id],
  )
}
