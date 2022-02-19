import styled from "styled-components"

import { Container, InputText } from "./Input"

const InputHeader = styled(InputText)`
  input {
    text-align: center;
    font-weight: 600;
    font-size: 32px;
    line-height: 38.4px;

    // allocates space for when bottom-border is shown on focus
    border-bottom: 1px solid transparent;
    outline: 0;

    &:hover {
      outline: 0;
    }
  }
`
export const EditableHeader = styled(({ className, style, ...props }) => {
  return (
    <Container className={className} style={style}>
      <InputHeader spellCheck="false" {...props} />
    </Container>
  )
})``
