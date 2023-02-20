import { isNumber } from "lodash-es"
import { FC, PropsWithChildren, ReactNode } from "react"
import { render } from "react-dom"
import styled from "styled-components"

import { PressableButton } from "../../../../components/Button"
import {
  ContentWrapper,
  PageWrapper,
  Panel,
} from "../../../../components/FullScreenPage"
import { ArrowBackIcon } from "../../../../components/Icons/MuiIcons"
import { Title } from "../../../../components/Page"
import { StepIndicator } from "../../../../components/StepIndicator"
import { P3 } from "../../../../theme/Typography"
import LogoSvg from "../../../lock/logo.svg"

export interface CreateMultisigScreen extends PropsWithChildren {
  back?: boolean
  title?: string | ReactNode
  subtitle?: string
  length?: number
  currentIndex?: number
  icon?: ReactNode
  goBack?: () => void
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

export const CreateMultisigScreen: FC<CreateMultisigScreen> = ({
  back,
  title,
  subtitle,
  children,
  length = 3,
  currentIndex,
  icon = <LogoSvg />,
  goBack,
}) => {
  const indicator = isNumber(length) && isNumber(currentIndex)

  return (
    <StyledPageWrapper>
      {back && goBack && (
        <BackButton variant="neutrals800" onClick={() => goBack()}>
          <ArrowBackIcon />
        </BackButton>
      )}
      <Panel>
        <ContentWrapper>
          {indicator && (
            <StepIndicator length={length} currentIndex={currentIndex} />
          )}
          <Header>
            {title && typeof title === "string" ? (
              <StyledTitle>{title}</StyledTitle>
            ) : (
              <>{title}</>
            )}
            {subtitle && <StyledP3>{subtitle}</StyledP3>}
          </Header>
          {children}
        </ContentWrapper>
      </Panel>
      <Panel>{icon}</Panel>
    </StyledPageWrapper>
  )
}
