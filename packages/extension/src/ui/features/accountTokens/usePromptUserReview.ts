import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { userReviewStore } from "../../../shared/userReview"
import { useKeyValueStorage } from "../../hooks/useStorage"

export const usePromptUserReview = () => {
  const navigate = useNavigate()
  const transactionsBeforeReview = useKeyValueStorage(
    userReviewStore,
    "transactionsBeforeReview",
  )
  const userHasReviewed = useKeyValueStorage(userReviewStore, "hasReviewed")

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    if (
      !userHasReviewed &&
      transactionsBeforeReview === 0 &&
      !(window as any).PLAYWRIGHT
    ) {
      timeoutId = setTimeout(() => navigate(routes.userReview()), 1000)
    }
    return () => timeoutId && clearTimeout(timeoutId)
  }, [navigate, transactionsBeforeReview, userHasReviewed])
}
