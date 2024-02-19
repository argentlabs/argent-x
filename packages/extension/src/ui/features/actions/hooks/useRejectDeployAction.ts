import { useCallback } from "react"
import { allActionsView } from "../../../views/actions"
import { useView } from "../../../views/implementation/react"
import { useActionScreen } from "./useActionScreen"

export function useRejectDeployIfPresent() {
  const allActions = useView(allActionsView)
  const { rejectActionWithHash } = useActionScreen()

  return useCallback(async () => {
    const deployAction = allActions.find(
      (action) => action.type === "DEPLOY_ACCOUNT",
    )
    if (deployAction) {
      await rejectActionWithHash(deployAction.meta.hash)
    }
  }, [allActions, rejectActionWithHash])
}
