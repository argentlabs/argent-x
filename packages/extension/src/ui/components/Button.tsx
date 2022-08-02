import { colord } from "colord"
import styled, { css } from "styled-components"
import { DefaultTheme } from "styled-components"

export type ButtonVariant =
  | "default"
  | "primary"
  | "warn"
  | "warn-high"
  | "danger"
  | "info"

export type ButtonSize = "default" | "xs" | "s" | "m" | "l" | "xl"

interface IButton {
  theme: DefaultTheme
  variant?: ButtonVariant
  size?: ButtonSize
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
      case "danger":
        return hover
          ? colord(theme.red1).lighten(0.075).toRgbString()
          : disabled
          ? colord(theme.red1).alpha(0.5).toRgbString()
          : theme.red1
      case "warn-high":
        return hover
          ? colord(theme.red4).saturate(1).lighten(0.075).toRgbString()
          : disabled
          ? colord(theme.red4).alpha(0.5).toRgbString()
          : theme.red4
      case "warn":
        return hover
          ? colord(theme.yellow1).lighten(0.075).toRgbString()
          : disabled
          ? colord(theme.yellow1).alpha(0.5).toRgbString()
          : theme.yellow1
      case "info":
        return hover
          ? colord(theme.blue0).lighten(0.075).toRgbString()
          : disabled
          ? colord(theme.blue0).alpha(0.5).toRgbString()
          : theme.blue0
    }
    return hover && !disabled
      ? `rgba(255, 255, 255, 0.25)`
      : `rgba(255, 255, 255, 0.15);`
  }

export const getSizeStyle = (size: ButtonSize = "default") => {
  switch (size) {
    case "xs":
      return css`
        padding: 4px 8px;
        font-size: 13px;
        line-height: 1.2;
      `
    case "s":
      return css`
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.2;
      `
  }
  return css`
    padding: 13.5px;
    font-size: 16px;
    line-height: 21px;
    width: 100%;
  `
}

const BaseButton = styled.button`
  margin: 0;
  padding: 13.5px;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  text-align: center;
  width: 100%;
  outline: none;
  border: none;
  transition: color 200ms ease-in-out, background-color 200ms ease-in-out;
  cursor: pointer;
`

export const Button = styled(BaseButton)<IButton>`
  ${({ size }) => getSizeStyle(size)}
  margin: 0;
  font-weight: 600;
  text-align: center;

  background-color: ${({ theme }) => getVariantColor({ theme, hover: false })};
  border-radius: 100px;
  color: ${({ theme, variant }) =>
    variant === "warn" ? theme.bg1 : theme.text1};

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

/** TODO: change to variant=transparent */
export const ButtonTransparent = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.text1};

  &:hover,
  &:focus {
    outline: 0;
  }

  &:disabled {
    cursor: auto;
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.5);
  }
`
