import type { FC } from "react"
import type { Location } from "react-router-dom"
import { useLocation } from "react-router-dom"

import { ReviewFeedbackScreen } from "./ReviewFeedbackScreen"
import { ZENDESK_LINK } from "./constants"
import { useBrowserStore } from "./useBrowserStore"

interface LocationWithState extends Location {
  state: {
    rating?: number
  }
}

export const ReviewFeedbackScreenContainer: FC = () => {
  const { state } = useLocation() as LocationWithState

  const [browserName, storeLink] = useBrowserStore()

  const onSubmit = () => {
    if (state?.rating === 5) {
      window.open(storeLink, "_blank")?.focus()
    } else {
      window.open(ZENDESK_LINK, "_blank")?.focus()
    }
  }

  return (
    <ReviewFeedbackScreen
      rating={state.rating}
      onSubmit={onSubmit}
      onClose={() => undefined}
      browserName={browserName}
    />
  )
}
