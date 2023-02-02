import { isNumber } from "lodash-es"
import { FC, PropsWithChildren, ReactNode, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { PressableButton } from "../../../components/Button"
import {
  ContentWrapper,
  PageWrapper,
  Panel,
} from "../../../components/FullScreenPage"
import { ArrowBackIcon } from "../../../components/Icons/MuiIcons"
import { Title } from "../../../components/Page"
import { StepIndicator } from "../../../components/StepIndicator"
import { routes } from "../../../routes"
import { isInitialized } from "../../../services/backgroundSessions"
import { P3 } from "../../../theme/Typography"
import LogoSvg from "../../lock/logo.svg"

export interface IOnboardingScreen extends PropsWithChildren {
  back?: boolean
  title?: string
  subtitle?: string
  length?: number
  currentIndex?: number
  icon?: ReactNode
}

const Header = styled.div`
  margin: 32px 0;
`

const StyledTitle = styled(Title)`
  margin-bottom: 0;
`

const StyledP3 = styled(P3)`
  margin-top: 8px;
`

const BackButton = styled(PressableButton)`
  position: absolute;
  left: 32px;
  top: 32px;
  width: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
`

const StyledPageWrapper = styled(PageWrapper)`
  ${({ theme }) => theme.mediaMinWidth.md`
    > ${Panel}:last-child {
      background:url('./assets/onboarding-background.svg') no-repeat center;
      background-size: cover;
    }
  `}
`

export const OnboardingScreen: FC<IOnboardingScreen> = ({
  back,
  title,
  subtitle,
  children,
  length,
  currentIndex,
  icon = <LogoSvg />,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const indicator = isNumber(length) && isNumber(currentIndex)
  useEffect(() => {
    /** on window focus, check if the wallet was initialised elsewhere and redirect to finish screen */
    const onFocus = async () => {
      const { initialized } = await isInitialized()
      if (
        initialized &&
        location.pathname !== routes.onboardingFinish.path &&
        location.pathname !== routes.onboardingRestorePassword.path // feels very hacky this useEffect here, need to find something more sustainable
      ) {
        navigate(routes.onboardingFinish.path, { replace: true })
      }
    }
    window.addEventListener("focus", onFocus)
    onFocus()
    return () => {
      window.removeEventListener("focus", onFocus)
    }
  }, [location.pathname, navigate])
  return (
    <StyledPageWrapper>
      {back && (
        <BackButton variant="neutrals800" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </BackButton>
      )}
      <Panel>
        <ContentWrapper>
          {indicator && (
            <StepIndicator length={length} currentIndex={currentIndex} />
          )}
          <Header>
            {title && <StyledTitle>{title}</StyledTitle>}
            {subtitle && <StyledP3>{subtitle}</StyledP3>}
          </Header>
          {children}
        </ContentWrapper>
      </Panel>
      <Panel>{icon}</Panel>
    </StyledPageWrapper>
  )
}
