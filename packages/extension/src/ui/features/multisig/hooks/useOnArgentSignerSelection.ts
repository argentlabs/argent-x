import { useCallback } from "react"
import { urlWithQuery } from "../../../../shared/utils/url"
import { routes } from "../../../../shared/ui/routes"
import { useCreatePendingMultisig } from "./useCreatePendingMultisig"
import { useNavigate } from "react-router-dom"
import { noop } from "lodash-es"
import { SignerType } from "../../../../shared/wallet.model"
import { clientUIService } from "../../../services/ui"

export function useOnArgentSignerSelection() {
  const navigate = useNavigate()
  const { createPendingMultisig } = useCreatePendingMultisig()

  return useCallback(
    async (ctx: "create" | "join", networkId: string) => {
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
        default:
          return noop
      }
    },
    [createPendingMultisig, navigate],
  )
}
