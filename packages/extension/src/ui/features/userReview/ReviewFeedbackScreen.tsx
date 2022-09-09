import { Rating } from "@mui/material"
import { FC } from "react"
import { Location, useLocation } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { HeartFilled } from "../../components/Icons/HeartFilled"
import { H2 } from "../../theme/Typography"

const MainWrapper = styled.div`
  height: 100vh;
  position: relative;
`

const Container = styled(ColumnCenter)`
  width: 100%;
`

const RateText = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  padding: 24px;
  text-align: center;
`

const ThankYouText = styled(H2)`
  margin-top: 32px;
`

const ButtonsContainer = styled.div`
  position: absolute;
  bottom: 32px;
  left: 24px;
  right: 24px;

  ${({ theme }) => theme.flexColumnNoWrap}
  gap: 8px;
`

const ActionButton = styled(Button)`
  background-color: white;
  color: black;
`

interface LocationWithState extends Location {
  state: {
    rating: number
  }
}

const CHROME_STORE_LINK =
  "https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb"

const ZENDESK_LINK =
  "https://support.argent.xyz/hc/en-us/categories/5767453283473-Argent-X"

export const ReviewFeedbackScreen: FC = () => {
  const { state } = useLocation() as LocationWithState

  const handleButtonClick = () => {
    if (state.rating === 5) {
      window.open(CHROME_STORE_LINK, "_blank")?.focus()
    } else {
      window.open(ZENDESK_LINK, "_blank")?.focus()
    }
  }

  return (
    <MainWrapper>
      <IconBar close />
      <Container>
        <HeartFilled />
        <ThankYouText>Thank You!</ThankYouText>
        <RateText>
          We’re thrilled to hear you’re enjoying Argent X, but it sounds like we
          could still be doing better
        </RateText>
      </Container>

      <ButtonsContainer>
        <ActionButton onClick={handleButtonClick}>
          {state.rating === 5 ? "Rate on chrome store" : "Give Feedback"}
        </ActionButton>
      </ButtonsContainer>
    </MainWrapper>
  )
}
