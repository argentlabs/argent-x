import { FC } from "react"
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

interface ReviewFeedbackScreenProps {
  onSubmit: () => void
  onClose: () => void
  rating?: number
  browserName?: string
}

export const ReviewFeedbackScreen: FC<ReviewFeedbackScreenProps> = ({
  onSubmit,
  onClose,
  rating,
  browserName,
}) => {
  return (
    <MainWrapper>
      <IconBar close onClick={onClose} />
      <Container>
        <HeartFilled />
        <ThankYouText>Thank You!</ThankYouText>
        {rating === 5 ? (
          <RateText>
            We’re thrilled to hear you’re enjoying Argent&nbsp;X. We would
            really appreciate if you could help spread the word by also rating
            us on the {browserName} store
          </RateText>
        ) : (
          <RateText>
            We’re thrilled to hear you’re enjoying Argent&nbsp;X, but it sounds
            like we could still be doing better
          </RateText>
        )}
      </Container>

      <ButtonsContainer>
        <ActionButton onClick={onSubmit}>
          {rating === 5 ? `Rate on ${browserName} store` : "Give Feedback"}
        </ActionButton>
      </ButtonsContainer>
    </MainWrapper>
  )
}
