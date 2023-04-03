import { useToast } from "@argent/ui"
import { FC, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { constants } from "starknet"

import { shieldAddAccount } from "../../../shared/shield/register"
import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { routes } from "../../routes"
import { accountChangeGuardian } from "../../services/backgroundAccounts"
import { ShieldBaseActionScreen } from "./ShieldBaseActionScreen"
import { usePendingChangeGuardian } from "./usePendingChangingGuardian"
import { useRouteAccount } from "./useRouteAccount"
import { useShieldOnboardingTracking } from "./useShieldTracking"

export const ShieldAccountActionScreen: FC = () => {
  const account = useRouteAccount()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const pendingChangeGuardian = usePendingChangeGuardian(account)
  const toast = useToast()
  const hasGuardian = Boolean(account?.guardian)

  const { trackSuccess } = useShieldOnboardingTracking({
    stepId: hasGuardian ? "removeArgentShield" : "addArgentShield",
  })

  useEffect(() => {
    if (pendingChangeGuardian && account) {
      /** a guardian transaction for this account is now pending - move to finish */
      trackSuccess()
      navigate(routes.shieldAccountFinish(account?.address), { replace: true })
    }
  }, [account, navigate, pendingChangeGuardian, trackSuccess])

  const onAddOrRemove = useCallback(async () => {
    if (!account) {
      console.error("Cannot add or remove - no account")
      return
    }
    setIsLoading(true)
    try {
      if (account.guardian) {
        // remove
        await accountChangeGuardian(account, constants.ZERO.toString())
      } else {
        // add
        const { guardianAddress } = await shieldAddAccount()
        await accountChangeGuardian(account, guardianAddress)
      }
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to modify account",
        status: "error",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [account, toast])

  return (
    <ShieldBaseActionScreen
      guardian={account?.guardian}
      onAddOrRemove={onAddOrRemove}
      isLoading={isLoading}
    />
  )
}
