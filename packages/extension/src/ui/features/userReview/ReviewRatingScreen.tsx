import { CrossSecondaryIcon } from "@argent/x-ui/icons"
import { BarIconButton, H1, H5 } from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import {
  resetTransactionsBeforeReview,
  toggleUserHasReviewed,
} from "../../../shared/userReview"
import { StarRating } from "./StarRating"

export const ReviewRatingScreen: FC = () => {
  const navigate = useNavigate()

  const onRating = async (value: number) => {
    if (value) {
      await toggleUserHasReviewed()
      navigate(routes.userReviewFeedback(), {
        state: {
          rating: value,
        },
      })
    }
  }

  return (
    <Center flex={1} flexDirection="column" position="relative">
      <BarIconButton
        onClick={() => {
          void resetTransactionsBeforeReview()
        }}
        bgColor="surface-elevated"
        position="absolute"
        right={4.5}
        top={4.5}
      >
        <CrossSecondaryIcon />
      </BarIconButton>
      <H1>Enjoying Argent X?</H1>
      <H5 mt={2}>How would you rate your experience</H5>
      <StarRating
        mt={12}
        fontSize="36px"
        onChange={(value) => void onRating(value)}
      />
    </Center>
  )
}
