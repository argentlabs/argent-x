import { colord } from "colord"
import styled from "styled-components"

export type ButtonVariant = "default" | "primary" | "warn" | "danger"

interface IButton {
  variant?: ButtonVariant
}

/** TODO: move colour tokens into theme */

export const getVariantColor =
  ({ hover = false, disabled = false }) =>
  ({ variant }: IButton) => {
    switch (variant) {
      case "warn":
        return hover
          ? colord("#f36a3d").saturate(1).lighten(0.075).toRgbString()
          : disabled
          ? colord("#f36a3d").alpha(0.5).toRgbString()
          : "#f36a3d"
      case "danger":
        return hover
          ? colord("#c12026").lighten(0.075).toRgbString()
          : disabled
          ? colord("#c12026").alpha(0.5).toRgbString()
          : "#c12026"
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

  background-color: ${getVariantColor({ hover: false })};
  border-radius: 100px;
  width: 100%;
  outline: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background-color: ${getVariantColor({ hover: true })};
  }

  &:disabled {
    cursor: auto;
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.5);
    background-color: ${getVariantColor({ disabled: true })};
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
