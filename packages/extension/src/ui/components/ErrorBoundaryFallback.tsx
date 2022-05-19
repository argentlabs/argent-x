import { FC } from "react"
import styled from "styled-components"

import { ReportGmailerrorredIcon } from "./Icons/MuiIcons"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & > svg {
    color: red;
    font-size: 64px;
    margin-bottom: 16px;
  }
`

interface ErrorBoundaryFallbackProps {
  title: string
}

export const ErrorBoundaryFallback: FC<ErrorBoundaryFallbackProps> = ({
  title,
}) => (
  <Container>
    <ReportGmailerrorredIcon />
    <h3>{title}</h3>
  </Container>
)
