import { ButtonHTMLAttributes } from "react"
import styled, { DefaultTheme, css } from "styled-components"

import {
  UtilitiesProps,
  Variant,
  fontSize,
  minHeight,
  px,
  py,
  utilities,
  withVariants,
} from "../../theme/utilities"

export type ButtonVariant =
  | "default"
  | "primary"
  | "warn"
  | "warn-high"
  | "danger"
  | "info"
  | "transparent"
  | "inverted"
  | "neutrals800"

export type ButtonSize = "2xs" | "xs" | "sm" | "md" | "lg"

export type ButtonShape = "pill" | "round" | "roundrect"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  block?: boolean
  outline?: boolean
}

const variants: Variant<ButtonProps>[] = [
  // color
  {
    props: { outline: false },
    style: css`
      color: ${getButtonColor("fg", "base")};
      background-color: ${getButtonColor("bg", "base")};
      &:hover,
      &:focus {
        color: ${getButtonColor("fg", "hover")};
        background-color: ${getButtonColor("bg", "hover")};
      }
      &:disabled {
        color: ${getButtonColor("fg", "disabled")};
        background-color: ${getButtonColor("bg", "disabled")};
      }
    `,
  },
  {
    props: { outline: true },
    style: css`
      background-color: transparent;
      border: 0.5px solid ${getButtonColor("bg", "base")};
      color: ${getButtonColor("bg", "base")};
      &:hover,
      &:focus {
        border: 0.5px solid ${getButtonColor("bg", "hover")};
        color: ${getButtonColor("bg", "hover")};
      }
      &:disabled {
        border: 0.5px solid ${getButtonColor("bg", "disabled")};
        color: ${getButtonColor("bg", "disabled")};
      }
    `,
  },
  // pressable
  {
    props: { disabled: false },
    style: css<ButtonProps>`
      cursor: pointer;
      &:active {
        transform: scale(
          ${({ size }) => (size === "sm" || size === "xs" ? 0.95 : 0.975)}
        );
      }
    `,
  },
  // block
  {
    props: { block: true },
    style: css`
      width: 100%;
    `,
  },
  // height and horizontal padding
  {
    props: { size: "lg" },
    style: css`
      ${minHeight(14)}
      ${py(2)}
      ${px(8)}
    `,
  },
  {
    props: { size: "md" },
    style: css`
      ${minHeight(12)}
      ${py(2)}
      ${px(6)}
    `,
  },
  {
    props: { size: "sm" },
    style: css`
      ${minHeight(10)}
      ${py(2)}
      ${px(5)}
    `,
  },
  {
    props: { size: "xs" },
    style: css`
      ${minHeight(9)}
      ${py(1)}
      ${px(4)}
    `,
  },
  {
    props: { size: "2xs" },
    style: css`
      ${minHeight(8)}
      ${py(1)}
      ${px(3)}
    `,
  },
  // shape
  {
    props: { shape: "pill" },
    style: css`
      border-radius: 500px;
    `,
  },
  {
    props: { shape: "round" },
    style: css`
      border-radius: 50%;
    `,
  },
  {
    props: { shape: "roundrect" },
    style: css`
      border-radius: ${({ theme }) => theme.spacings[1]};
    `,
  },
  // font size
  {
    props: [{ size: "lg" }, { size: "md" }],
    style: css`
      ${fontSize("lg")}
    `,
  },
  {
    props: [{ size: "sm" }, { size: "xs" }, { size: "2xs" }],
    style: css`
      ${fontSize("sm")}
    `,
  },
]

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

export const Button = styled.button.withConfig<ButtonProps & UtilitiesProps>({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    !["shape"].includes(prop) && defaultValidatorFn(prop),
})`
  ${utilities}
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: none;
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  transition: color 200ms ease-in-out, background-color 200ms ease-in-out,
    border-color 200ms ease-in-out, transform 100ms ease-in-out;
  ${withVariants(variants)}
`

Button.defaultProps = {
  variant: "default",
  size: "md",
  shape: "pill",
  block: false,
  outline: false,
  disabled: false,
}
