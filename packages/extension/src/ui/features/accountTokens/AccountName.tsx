import { FC, InputHTMLAttributes, RefObject, useState } from "react"
import styled from "styled-components"

import { InputText } from "../../components/InputText"
import { defaultAccountName } from "../accounts/accountMetadata.state"

const Form = styled.form`
  display: flex;
  align-items: center;
  width: 250px;
`

const InputHeader = styled(InputText)`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin: 0;

  input {
    text-align: center;
    font-weight: 600;
    font-size: 32px;
    line-height: 38.4px;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    // allocates space for when bottom-border is shown on focus
    border-bottom: 1px solid transparent;
    outline: 0;

    cursor: pointer;
    &:focus {
      cursor: text;
    }
  }
`

interface AccountNameProps extends InputHTMLAttributes<HTMLInputElement> {
  inputRef: RefObject<HTMLInputElement>
}

export const AccountName: FC<AccountNameProps> = ({
  value,
  inputRef,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  if (isFocused && value === defaultAccountName) {
    value = ""
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    ;(document.activeElement as any)?.blur()
  }
  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <InputHeader
        spellCheck="false"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        inputRef={inputRef}
        {...props}
      />
    </Form>
  )
}
