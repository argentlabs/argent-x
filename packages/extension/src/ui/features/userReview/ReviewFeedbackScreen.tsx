import { FC } from "react"
import { Location, useLocation } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { HeartFilled } from "../../components/Icons/HeartFilled"
import { analytics } from "../../services/analytics"
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
    rating?: number
  }
}

const CHROME_STORE_LINK =
  "https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb"

const FIREFOX_STORE_LINK =
  "https://addons.mozilla.org/en-GB/firefox/addon/argent-x/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search"

export const ZENDESK_LINK = "https://support.argent.xyz/hc/en-us/requests/new"

export const ReviewFeedbackScreen: FC = () => {
  const { state } = useLocation() as LocationWithState

  const [browserName, storeLink] = useBrowserStore()

  const handleButtonClick = () => {
    if (state?.rating === 5) {
      analytics.track("userFeedbackAction", {
        action: "REVIEWED_ON_CHROME_STORE",
      })
      window.open(storeLink, "_blank")?.focus()
    } else {
      window.open(ZENDESK_LINK, "_blank")?.focus()
      analytics.track("userFeedbackAction", {
        action: "REVIEWED_ON_ZENDESK",
      })
    }
  }

  return (
    <MainWrapper>
      <IconBar
        close
        onClick={() =>
          analytics.track("userFeedbackAction", {
            action: "FEEDBACK_DISMISSED",
          })
        }
      />
      <Container>
        <HeartFilled />
        <ThankYouText>Thank You!</ThankYouText>
        {state?.rating === 5 ? (
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
        <ActionButton onClick={handleButtonClick}>
          {state?.rating === 5
            ? `Rate on ${browserName} store`
            : "Give Feedback"}
        </ActionButton>
      </ButtonsContainer>
    </MainWrapper>
  )
}

const isFirefox = navigator.userAgent.indexOf("Firefox") !== -1

const useBrowserStore = (): [string, string] => {
  // This works because we only support 2 browsers for now
  return isFirefox
    ? ["Firefox", FIREFOX_STORE_LINK]
    : ["Chrome", CHROME_STORE_LINK]
}
