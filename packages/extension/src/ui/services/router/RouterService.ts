import { IS_DEV } from "../../../shared/utils/dev"
import {
  createAccountTypeSchema,
  signerTypeSchema,
} from "../../../shared/wallet.model"
import { ledgerStartContextSchema } from "../../../shared/ledger/schema"
import { routes } from "../../../shared/ui/routes"
import { getInitialHardReloadRoute } from "../resetAndReload"
import type { IRouterService } from "./IRouterService"
import { NavigateOptions } from "react-router-dom"
import { useRestorationState } from "../../features/stateRestoration/restoration.state"

type UseRestorationState = typeof useRestorationState

export default class RouterService implements IRouterService {
  constructor(private useRestorationState: UseRestorationState) {}

  /**
   * TODO: refactor - for speed this could be pre-emptively done on construction since we only determine the entry route
   */
  getInitialRoute = ({
    query,
    isOnboardingComplete,
  }: {
    query: URLSearchParams
    isOnboardingComplete: boolean
  }): { entry: string; options?: NavigateOptions } => {
    if (IS_DEV) {
      const initialRoute = getInitialHardReloadRoute(query)
      if (initialRoute) {
        return { entry: initialRoute }
      }
    }

    const goto = query.get("goto")

    if (goto === "background-error") {
      return { entry: routes.backgroundError() }
    }

    if (goto === "ledger") {
      return this.getLedgerInitialRoute(query)
    }

    if (goto === "multisig") {
      return this.getMultisigInitialRoute(query)
    }

    if (goto === "airgap") {
      return this.getAirgapInitialRoute(query)
    }

    if (!isOnboardingComplete) {
      return { entry: routes.onboardingStart() }
    }

    const initialRoute = query.get("initialRoute")
    if (initialRoute) {
      return { entry: initialRoute }
    }

    // restore entryRoute from restoration.state
    const { entryRoute } = this.useRestorationState.getState()
    if (entryRoute) {
      const { pathname, search } = entryRoute
      return { entry: [pathname, search].filter(Boolean).join("") }
    }

    return { entry: routes.accountTokens() }
  }

  getAirgapInitialRoute = (query: URLSearchParams) => {
    const data = query.get("data")
    if (!data) throw new Error("Missing data query param")

    return {
      entry: routes.airGapReview(data),
      options: { replace: true, state: { showOnTop: true } },
    }
  }

  getLedgerInitialRoute = (query: URLSearchParams) => {
    const ctx = query.get("ctx")

    const parsedCtx = ledgerStartContextSchema.safeParse(ctx)

    if (!parsedCtx.success) {
      throw new Error("Missing ctx query param")
    }

    const networkId = query.get("networkId")

    if (!networkId) {
      throw new Error("Missing networkId query param")
    }

    const accountType = createAccountTypeSchema.safeParse(
      query.get("accountType"),
    )

    if (!accountType.success) {
      throw new Error("Missing accountType query param")
    }

    return {
      entry: routes.ledgerConnect(accountType.data, networkId, parsedCtx.data),
    }
  }

  getMultisigInitialRoute = (query: URLSearchParams) => {
    const networkId = query.get("networkId")
    const creatorType = query.get("creatorType")
    if (!networkId) {
      throw new Error("Missing networkId query param")
    }

    const creatorTypeParsed = signerTypeSchema.safeParse(creatorType)

    if (!creatorTypeParsed.success) {
      throw new Error("Missing creatorType query param")
    }

    return { entry: routes.multisigCreate(networkId, creatorTypeParsed.data) }
  }
}
