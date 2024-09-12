import { Rating } from "@mui/material"
import { FC, SyntheticEvent } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import {
  resetTransactionsBeforeReview,
  toggleUserHasReviewed,
} from "../../../shared/userReview"
import { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { StarRounded } from "../../components/Icons/MuiIcons"
import { routes } from "../../../shared/ui/routes"
import { H2 } from "../../theme/Typography"

const Container = styled(ColumnCenter)`
  padding-top: 112px;
  width: 100%;
`

const RateText = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
`

const StyledRating = styled(Rating)`
  margin-top: 48px;
`

const RatingContainer = styled.div`
  font-size: 24px;
`

export const ReviewRatingScreen: FC = () => {
  const navigate = useNavigate()

  const onRating = async (
    _: SyntheticEvent<Element, Event>,
    value: number | null,
  ) => {
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
    <>
      <IconBar
        close
        onClick={async () => {
          await resetTransactionsBeforeReview()
        }}
      />
      <Container>
        <H2>Enjoying Argent X?</H2>
        <RateText>How would you rate your experience</RateText>
        <RatingContainer>
          <StyledRating
            emptyIcon={
              <StarRounded htmlColor="#5C5B59" sx={{ fontSize: "36px" }} />
            }
            icon={<StarRounded htmlColor="#FFFFFF" sx={{ fontSize: "36px" }} />}
            onChange={onRating}
          />
        </RatingContainer>
      </Container>
    </>
  )
}
