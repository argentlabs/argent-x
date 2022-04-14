import { useRef } from "react"
import styled, { css } from "styled-components"

export const Container = styled.div`
  display: flex;
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

const InputCss = css`
  border-radius: 0;
  display: flex;
  font-size: 17px;
  line-height: 25px;
  text-shadow: none;

  background-color: transparent;
  color: white;

  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  padding: 2px 0 6px;
  flex: 1 1 auto;
  transition: all 200ms ease-in-out;

  &:focus {
    border-bottom: 1px solid rgba(255, 255, 255, 1);
    outline: 0;
  }

  &:focus + ${Label} {
    color: white;
    transform: scale(0.8) translate3d(0, 5px, 0);
  }

  &:not(:placeholder-shown) + ${Label} {
    transform: scale(0.8) translate3d(0, 5px, 0);
  }

  &:disabled {
    color: #8f8e8c;
    border-bottom: 1px solid #8f8e8c;
  }
`

const Input = styled.input`
  ${InputCss}
  order: 2;

  &::placeholder {
    opacity: 0;
  }
`

function randomString() {
  return Math.floor(Math.random() * 1000).toString()
}

export const InputText = styled(
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

export const TextArea = styled.textarea`
  ${InputCss}
  resize: none;
  min-height: 116px;
  width: 100%;
`
