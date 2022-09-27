import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../routes"

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.text3};
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
  text-decoration-line: underline;
`

export const PrivacyStatement: FC = ({ ...props }) => {
  return (
    <StyledLink to={routes.onboardingPrivacy()} {...props}>
      Privacy Statement
    </StyledLink>
  )
}
