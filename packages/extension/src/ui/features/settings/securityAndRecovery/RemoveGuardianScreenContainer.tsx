import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@argent/x-ui"

import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { RemoveGuardianScreen } from "./RemoveGuardianScreen"
import { routes } from "../../../../shared/ui/routes"
import { useState } from "react"
import { clientArgentAccountService } from "../../../services/argentAccount"
import { IS_DEV } from "../../../../shared/utils/dev"
import { coerceErrorToString } from "../../../../shared/utils/error"

export const RemoveGuardianScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const navigate = useNavigate()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const onRemoveGuardian = async () => {
    setIsLoading(true)
    try {
      await clientArgentAccountService.removeGuardian()
      navigate(routes.accountTokens())
    } catch (error) {
      if (IS_DEV) {
        console.warn(coerceErrorToString(error))
      }
      toast({
        title: "Unable to remove guardian",
        description: "Please try again",
        status: "error",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RemoveGuardianScreen
      onBack={onBack}
      onRemoveGuardian={onRemoveGuardian}
      isLoading={isLoading}
    />
  )
}
