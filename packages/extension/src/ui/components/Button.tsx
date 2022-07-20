import { colord } from "colord"
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
          ? colord(theme.red4).saturate(1).lighten(0.075).toRgbString()
          : disabled
          ? colord(theme.red4).alpha(0.5).toRgbString()
          : theme.red4
      case "danger":
        return hover
          ? colord(theme.red1).lighten(0.075).toRgbString()
          : disabled
          ? colord(theme.red1).alpha(0.5).toRgbString()
          : theme.red1
    }
    return hover && !disabled
      ? `rgba(255, 255, 255, 0.25)`
      : `rgba(255, 255, 255, 0.15);`
  }

export const Button = styled.button<IButton>`
  margin: 0;
  padding: 13.5px;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  text-align: center;

  background-color: ${({ theme }) => getVariantColor({ theme, hover: false })};
  border-radius: 100px;
  width: 100%;
  outline: none;
  border: none;
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background-color: ${({ theme }) => getVariantColor({ theme, hover: true })};
  }

  &:disabled {
    cursor: auto;
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.5);
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
