import { FC, ReactNode } from "react"
import styled, { css } from "styled-components"

const BannerWrapper = styled.div<{
  noMargins?: boolean
  theme?: "danger"
}>`
  display: flex;
  cursor: pointer;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;

  ${({ noMargins = false }) =>
    !noMargins &&
    css`
      margin: 16px 20px;
    `};

  ${({ theme }) =>
    theme === "danger" &&
    css`
      background-color: #c12026;

      h1,
      p {
        color: white;
      }
    `};
`

const BannerTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`

const BannerTitle = styled.h1`
  color: black;
  margin: 0;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
`

const BannerDescription = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 20px;
  color: #8f8e8c;
`

export interface BannerProps {
  title: string
  description: string
  icon: ReactNode
  noMargins?: boolean
  theme?: "danger"
}

export const Banner: FC<BannerProps> = ({
  title,
  description,
  icon,
  noMargins,
  theme,
}) => (
  <BannerWrapper noMargins={noMargins} theme={theme}>
    {icon}
    <BannerTextWrapper>
      <BannerTitle>{title}</BannerTitle>
      <BannerDescription>{description}</BannerDescription>
    </BannerTextWrapper>
  </BannerWrapper>
)
