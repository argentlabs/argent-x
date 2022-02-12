import { useRef } from "react"
import styled from "styled-components"

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  position: relative;
  width: 100%;
`

const Label = styled.label`
  color: #8f8e8c;
  font-weight: normal;
  font-size: 17px;
  order: 1;
  pointer-events: none;
  text-shadow: none;
  transform-origin: left top;
  transform: scale(1) translate3d(0, 22px, 0);
  transition: all 200ms ease-in-out;
  text-align: start;
`

const Input = styled.input`
  border-radius: 0;
  display: flex;
  text-align: center;
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  text-shadow: none;

  background-color: transparent;
  color: white;

  border: 0;
  border-bottom: 0px;
  padding: 2px 0 6px;
  flex: 1 1 auto;
  order: 2;
  transition: all 200ms ease-in-out;
  outline: 0;

  &:hover {
    border-bottom: 0px;
    outline: 0;
  }

  &:focus {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    outline: 0;
  }

  &::placeholder {
    opacity: 0;
  }
`

function randomString() {
  return Math.floor(Math.random() * 1000).toString()
}

export const EditableHeader = styled(
  ({
    placeholder,
    type,
    onChange,
    autoFocus,
    value,
    disabled,
    className,
    style,
    ...props
  }) => {
    const idRef = useRef(randomString())
    return (
      <Container className={className} style={style}>
        <Input
          placeholder={placeholder}
          id={idRef.current}
          type={type}
          onChange={onChange}
          value={value}
          autoFocus={autoFocus}
          disabled={disabled}
          {...props}
        />
        <Label>{placeholder}</Label>
      </Container>
    )
  },
)``
