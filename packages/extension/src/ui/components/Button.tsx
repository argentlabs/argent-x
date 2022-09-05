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
          ? theme.button.danger.bg.hover
          : disabled
          ? theme.button.danger.bg.disabled
          : theme.button.danger.bg.base
      case "warn-high":
        return hover
          ? theme.button["warn-high"].bg.hover
          : disabled
          ? theme.button["warn-high"].bg.disabled
          : theme.button["warn-high"].bg.base
      case "warn":
        return hover
          ? theme.button.warn.bg.hover
          : disabled
          ? theme.button.warn.bg.disabled
          : theme.button.warn.bg.base
      case "info":
        return hover
          ? theme.button.info.bg.hover
          : disabled
          ? theme.button.info.bg.disabled
          : theme.button.info.bg.base
    }
    return hover
      ? theme.button.default.bg.hover
      : disabled
      ? theme.button.default.bg.disabled
      : theme.button.default.bg.base
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

  background-color: ${({ theme }) => getVariantColor({ theme, hover: false })};
  border-radius: ${({ theme }) => theme.button.radius};
  width: 100%;
  outline: none;
  border: none;
  color: ${({ theme }) => theme.button.default.fg.base};
  cursor: pointer;
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

export const ButtonOutline = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.text1};
  border: 0.5px solid #ffffff;
  border-radius: 4px;

  &:hover,
  &:focus {
    outline: 0;
  }
`
