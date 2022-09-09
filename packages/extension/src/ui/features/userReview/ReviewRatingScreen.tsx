import { Rating } from "@mui/material"
import { FC, SyntheticEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { StarRounded } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { analytics } from "../../services/analytics"
import { H2 } from "../../theme/Typography"
import { recover } from "../recovery/recovery.service"
import { useReviewStatus } from "./Review.state"

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

  const [closeLink, setCloseLink] = useState<string | undefined>()

  useEffect(() => {
    recover().then((s) => setCloseLink(s))
  }, [])

  const onRating = (
    _: SyntheticEvent<Element, Event>,
    value: number | null,
  ) => {
    if (value) {
      analytics.track("userRating", { rating: value })
      useReviewStatus.setState({ hasReviewed: true })
      navigate(routes.userReviewFeedback(), {
        state: {
          rating: value,
        },
      })
    }
  }

  return (
    <>
      <IconBar close={closeLink} />
      <Container>
        <H2>Enjoying ArgentX?</H2>
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
