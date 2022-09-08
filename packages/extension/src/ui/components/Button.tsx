import styled, { css } from "styled-components"
import { DefaultTheme } from "styled-components"

export type ButtonVariant =
  | "default"
  | "primary"
  | "warn"
  | "warn-high"
  | "danger"
  | "info"
  | "inverted"

export type ButtonSize = "default" | "xs" | "s" | "m" | "l" | "xl"

interface IButton {
  variant?: ButtonVariant
  size?: ButtonSize
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

export function getButtonColor(
  layer: "bg" | "fg",
  state: "base" | "hover" | "disabled",
): (props: { theme: DefaultTheme; variant?: ButtonVariant }) => string {
  return ({ theme, variant = "default" }) => {
    const v = theme.button[variant] ?? theme.button.default
    const l = (v as any)[layer] ?? theme.button.default[layer]
    return (l as any)[state] ?? l.base
  }
}

const BaseButton = styled.button<IButton>`
  margin: 0;
  padding: 13.5px;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  text-align: center;

  background-color: ${getButtonColor("bg", "base")};
  border-radius: ${({ theme }) => theme.button.radius};
  width: 100%;
  outline: none;
  border: none;
  color: ${getButtonColor("fg", "base")};
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

  background-color: ${getButtonColor("bg", "base")};
  border-radius: 100px;
  color: ${getButtonColor("fg", "base")};

  &:hover,
  &:focus {
    outline: 0;
    background-color: ${getButtonColor("bg", "hover")};
  }

  &:disabled {
    cursor: auto;
    cursor: not-allowed;
    color: ${getButtonColor("fg", "disabled")};
    background-color: ${getButtonColor("bg", "disabled")};
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
