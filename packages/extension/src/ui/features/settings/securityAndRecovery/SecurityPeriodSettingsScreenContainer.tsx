import type { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@argent/x-ui"
import { useEffect, useState } from "react"

import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { SecurityPeriodSettingsScreen } from "./SecurityPeriodSettingsScreen"
import { SecurityPeriodSelectionScreen } from "./SecurityPeriodSelectionScreen"
import { routes } from "../../../../shared/ui/routes"
import { IS_DEV } from "../../../../shared/utils/dev"
import { coerceErrorToString } from "../../../../shared/utils/error"
import { clientArgentAccountService } from "../../../services/argentAccount"

export const SecurityPeriodSettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const navigate = useNavigate()
  const toast = useToast()
  const [showSelection, setShowSelection] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<number | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchCurrentPeriod = async () => {
      try {
        const currentPeriod =
          await clientArgentAccountService.getSecurityPeriod()
        setSelectedPeriod(currentPeriod)
      } catch (error) {
        if (IS_DEV) {
          console.warn(coerceErrorToString(error))
        }
        toast({
          title: "Unable to fetch current security period",
          description: "Please try again",
          status: "error",
          duration: 3000,
        })
      } finally {
        setIsFetching(false)
      }
    }
    fetchCurrentPeriod()
  }, [toast])

  const onLearnMore = () => {
    setShowSelection(true)
  }

  const onSelect = (seconds: number) => {
    setSelectedPeriod(seconds)
  }

  const onContinue = async () => {
    if (selectedPeriod === undefined) {
      return
    }

    setIsLoading(true)
    try {
      await clientArgentAccountService.updateSecurityPeriod(selectedPeriod)
      navigate(routes.accountTokens())
    } catch (error) {
      if (IS_DEV) {
        console.warn(coerceErrorToString(error))
      }
      toast({
        title: "Unable to update security period",
        description: "Please try again",
        status: "error",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showSelection) {
    return (
      <SecurityPeriodSelectionScreen
        onBack={() => setShowSelection(false)}
        selectedPeriod={selectedPeriod}
        onSelect={onSelect}
        onContinue={onContinue}
        isLoading={isLoading || isFetching}
      />
    )
  }

  return (
    <SecurityPeriodSettingsScreen onBack={onBack} onLearnMore={onLearnMore} />
  )
}
