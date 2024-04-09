import { useEffect } from "react"
import { initAmplitude } from "../../shared/analytics/init"

export const useAnalytics = () => {
  useEffect(() => {
    initAmplitude().catch((error) => {
      console.error("Error loading amplitude", error)
    })
  }, [])
}
