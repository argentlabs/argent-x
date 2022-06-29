import { useRef } from "react"
import { Controller } from "react-hook-form"
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

const InputCssAlt = css`
  border-radius: 0;
  display: flex;
  font-size: 17px;
  line-height: 25px;
  text-shadow: none;

  background-color: transparent;
  color: white;

  border: 0;
  flex: 1 1 auto;

  &:focus {
    outline: 0;
  }

  &:disabled {
    color: #8f8e8c;
  }
`

const Input = styled.input`
  ${InputCss}
  order: 2;

  &::placeholder {
    opacity: 0;
  }
`

const InputAlt = styled.input`
  ${InputCssAlt}
  order: 2;

  &::placeholder {
    color: #8f8e8c;
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
    inputRef,
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
          ref={inputRef}
          {...props}
        />
        <Label>{placeholder}</Label>
      </Container>
    )
  },
)``

export const InputTextAlt = styled(
  ({
    placeholder,
    type,
    autoFocus,
    onChange,
    value,
    disabled,
    className,
    style,
    inputRef,
    children,
    ...props
  }: { inputRef: any } & Omit<
    React.HTMLProps<HTMLInputElement>,
    "ref" | "as"
  >) => {
    const idRef = useRef(randomString())
    return (
      <Container className={className} style={style}>
        <InputAlt
          placeholder={placeholder}
          id={idRef.current}
          type={type}
          onChange={onChange}
          value={value}
          autoFocus={autoFocus}
          disabled={disabled}
          ref={inputRef}
          {...props}
        />
        {children}
      </Container>
    )
  },
)``

export const ControlledInputText = styled(
  ({ name, control, defaultValue, rules, ...props }) => (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field: { ref, value, ...field } }) => (
        <InputText {...props} value={value || ""} {...field} />
      )}
    />
  ),
)``

export const ControlledInputTextAlt = styled(
  ({ name, control, defaultValue, rules, children, ...props }) => (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field: { ref, value, ...field } }) => (
        <InputTextAlt
          style={{ position: "relative" }}
          {...props}
          value={value || ""}
          {...field}
          inputRef={ref}
        >
          {children}
        </InputTextAlt>
      )}
    />
  ),
)``

export const StyledControlledInput = styled(ControlledInputTextAlt)`
  padding: 12px 16px;
  border: 1px solid #333332;
  border-radius: 8px;
  background-color: black;
`

export const TextArea = styled.textarea`
  ${InputCss}
  resize: none;
  min-height: 116px;
  width: 100%;
`
