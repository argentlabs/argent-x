import { FC, PropsWithChildren } from "react"
import styled from "styled-components"

import { Title } from "../../../components/Page"
import { P3 } from "../../../theme/Typography"
import { ContentWrapper, PageWrapper, Panel } from "../../ledger/Page"
import { StepIndicator, StepIndicatorProps } from "../../ledger/StepIndicator"
import LogoSvg from "../../lock/logo.svg"

export interface IOnboardingScreen
  extends PropsWithChildren,
    StepIndicatorProps {
  title?: string
  subtitle?: string
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

export const OnboardingScreen: FC<IOnboardingScreen> = ({
  title,
  subtitle,
  children,
  ...rest
}) => {
  return (
    <PageWrapper>
      <Panel>
        <ContentWrapper>
          <StepIndicator {...rest} />
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
