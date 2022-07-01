import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../routes"

const StyledLink = styled(Link)`
  color: #5c5b59;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
  text-decoration-line: underline;
`

export const PrivacyStatement: FC = ({ ...props }) => {
  return (
    <StyledLink to={routes.privacyStatement()} {...props}>
      Privacy Statement
    </StyledLink>
  )
}
