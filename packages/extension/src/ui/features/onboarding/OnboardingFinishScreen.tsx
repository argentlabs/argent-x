import { Twitter } from "@mui/icons-material"
import { Slide, SlideProps, Snackbar } from "@mui/material"
import { FC, useCallback } from "react"
import styled from "styled-components"

import { ArgentXLogo } from "../../components/Icons/ArgentXLogo"
import { DiscordIcon } from "../../components/Icons/DiscordIcon"
import {
  CheckCircleOutlineRoundedIcon,
  ExtensionIcon,
  PushPinIcon,
} from "../../components/Icons/MuiIcons"
import Row from "../../components/Row"
import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import {
  DiscordRectButtonIcon,
  RectButton,
  TwitterRectButtonIcon,
} from "./ui/RectButton"

const StyledOnboardingButton = styled(OnboardingButton)`
  margin-top: 32px;
`

const StyledSnackbar = styled(Snackbar)`
  .MuiSnackbarContent-root {
    border-radius: 8px;
    margin: 0;
  }
`

const ArgentXButton = styled.div`
  display: flex;
  align-items: center;
  border-radius: 8px;
  background-color: #f0f0f0;
  padding: 12px;
  gap: 12px;
  font-weight: 600;
`

const SnackbarMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 260px;
  font-size: 16px;
`

const SnackbarIconContainer = styled.div`
  margin-right: 12px;
`

const StyledArgentXLogo = styled(ArgentXLogo)`
  font-size: 20px;
  color: ${({ theme }) => theme.primary};
`

const StyledPushPinIcon = styled(PushPinIcon)`
  margin-left: auto;
`

const SnackbarMessage: FC = () => {
  return (
    <SnackbarMessageContainer>
      <Row>
        <SnackbarIconContainer>
          <ExtensionIcon fontSize="inherit" />
        </SnackbarIconContainer>
        <span>Pin the Argent X extension for quick access</span>
      </Row>
      <ArgentXButton>
        <StyledArgentXLogo />
        <span>Argent X</span>
        <StyledPushPinIcon fontSize="inherit" />
      </ArgentXButton>
    </SnackbarMessageContainer>
  )
}

const StyledCheckCircleOutlineRoundedIcon = styled(
  CheckCircleOutlineRoundedIcon,
)`
  font-size: 77px; /** gives inner icon ~64px */
`

const TransitionLeft: FC<SlideProps> = (props) => {
  return <Slide {...props} direction="left" />
}

export const OnboardingFinishScreen: FC = () => {
  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "finish" },
  )
  const onFinishClick = useCallback(() => {
    trackSuccess()
    window.close()
  }, [trackSuccess])
  return (
    <>
      <StyledSnackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open
        message={<SnackbarMessage />}
        TransitionComponent={TransitionLeft}
      />
      <OnboardingScreen
        length={4}
        currentIndex={3}
        title="Your wallet is ready!"
        subtitle="Follow us for product updates or if you have any questions"
        icon={<StyledCheckCircleOutlineRoundedIcon fontSize="inherit" />}
      >
        <Row gap={"12px"} align="stretch">
          <RectButton
            as="a"
            href="https://twitter.com/argenthq"
            title="Follow Argent X on Twitter"
            target="_blank"
          >
            <TwitterRectButtonIcon>
              <Twitter />
            </TwitterRectButtonIcon>
            Follow Argent X on Twitter
          </RectButton>
          <RectButton
            as="a"
            href="https://discord.gg/T4PDFHxm6T"
            title="Join the Argent X Discord"
            target="_blank"
          >
            <DiscordRectButtonIcon>
              <DiscordIcon />
            </DiscordRectButtonIcon>
            Join the Argent X Discord
          </RectButton>
        </Row>
        <StyledOnboardingButton onClick={onFinishClick}>
          Finish
        </StyledOnboardingButton>
      </OnboardingScreen>
    </>
  )
}
