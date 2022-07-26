import styled from "styled-components"
import { DefaultTheme } from "styled-components"

export type ButtonVariant = "default" | "primary" | "warn" | "danger"

interface IButton {
  theme: DefaultTheme
  variant?: ButtonVariant
}

/** TODO: move color tokens into theme */

export const getVariantColor =
  ({
    theme,
    hover = false,
    disabled = false,
  }: {
    theme: DefaultTheme
    hover?: boolean
    disabled?: boolean
  }) =>
  ({ variant }: IButton) => {
    switch (variant) {
      case "warn":
        return hover
          ? theme.button.warn.bg.hover
          : disabled
          ? theme.button.warn.bg.disabled
          : theme.button.warn.bg.base
      case "danger":
        return hover
          ? theme.button.danger.bg.hover
          : disabled
          ? theme.button.danger.bg.disabled
          : theme.button.danger.bg.base
    }
    return hover
      ? theme.button.default.bg.hover
      : disabled
      ? theme.button.default.bg.disabled
      : theme.button.default.bg.base
  }

export const Button = styled.button<IButton>`
  margin: 0;
  padding: 13.5px;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  text-align: center;

  background-color: ${({ theme }) => getVariantColor({ theme, hover: false })};
  border-radius: ${({ theme }) => theme.button.radius};
  width: 100%;
  outline: none;
  border: none;
  color: ${({ theme }) => theme.button.default.fg.base};
  cursor: pointer;
  transition: color 200ms ease-in-out, background-color 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background-color: ${({ theme }) => getVariantColor({ theme, hover: true })};
  }

  &:disabled {
    cursor: auto;
    cursor: not-allowed;
    color: ${({ theme }) => theme.button.default.fg.disabled};
    background-color: ${({ theme }) =>
      getVariantColor({ theme, disabled: true })};
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

export const ButtonGroupVertical = styled.div<{
  switchButtonOrder?: boolean
}>`
  display: flex;
  flex-direction: ${({ switchButtonOrder = false }) =>
    switchButtonOrder ? "row-reverse" : "row"};
  gap: 12px;
  width: 100%;
`
