import { ComponentProps, FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.text3};
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
  text-decoration-line: underline;
`

export const PrivacyStatementLink: FC<ComponentProps<typeof StyledLink>> = ({
  ...props
}) => {
  return <StyledLink {...props}>Privacy Statement</StyledLink>
}
