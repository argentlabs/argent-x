import { isNumber } from "lodash-es"
import { FC, PropsWithChildren } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { PressableButton } from "../../../components/Button"
import { ArrowBackIcon } from "../../../components/Icons/MuiIcons"
import { Title } from "../../../components/Page"
import { P3 } from "../../../theme/Typography"
import { ContentWrapper, PageWrapper, Panel } from "../../ledger/Page"
import { StepIndicator } from "../../ledger/StepIndicator"
import LogoSvg from "../../lock/logo.svg"

export interface IOnboardingScreen extends PropsWithChildren {
  back?: boolean
  title?: string
  subtitle?: string
  length?: number
  currentIndex?: number
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

export const OnboardingScreen: FC<IOnboardingScreen> = ({
  back,
  title,
  subtitle,
  children,
  length,
  currentIndex,
}) => {
  const navigate = useNavigate()
  const indicator = isNumber(length) && isNumber(currentIndex)
  return (
    <PageWrapper>
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
      <Panel>
        <LogoSvg />
      </Panel>
    </PageWrapper>
  )
}
