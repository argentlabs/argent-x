import { useCallback } from "react"
import { urlWithQuery } from "../../../../shared/utils/url"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../shared/ui/routes"
import { CreateAccountType } from "../../../../shared/wallet.model"
import { clientUIService } from "../../../services/ui"
import { LedgerStartContext } from "../../../../shared/ledger/schema"

export function useOnLedgerStart(accountType: CreateAccountType) {
  const navigate = useNavigate()

  return useCallback(
    (ctx: LedgerStartContext, networkId: string) => {
      const url = urlWithQuery("index.html", {
        goto: "ledger",
        networkId,
        accountType,
        ctx,
      })
      void chrome.tabs.create({
        url,
      })
      navigate(routes.accounts())
      clientUIService.closePopup()
    },
    [accountType, navigate],
  )
}
