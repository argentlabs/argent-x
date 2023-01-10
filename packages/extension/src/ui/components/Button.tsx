import {
  ButtonHTMLAttributes,
  FC,
  MouseEvent,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react"
import styled, { css } from "styled-components"
import { DefaultTheme } from "styled-components"

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

export type ButtonSize = "default" | "xs" | "s" | "m" | "l" | "xl"

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
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
  ({ variant }: { variant?: ButtonVariant }) => {
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
      case "transparent":
        return hover
          ? theme.button.transparent.bg.hover
          : disabled
          ? theme.button.transparent.bg.disabled
          : theme.button.transparent.bg.base
      case "neutrals800":
        return hover
          ? theme.button.neutrals800.bg.hover
          : disabled
          ? theme.button.neutrals800.bg.disabled
          : theme.button.neutrals800.bg.base
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
  transition: color 200ms ease-in-out, background-color 200ms ease-in-out,
    transform 100ms ease-in-out;

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

  &:hover {
    background-color: ${({ theme }) => getVariantColor({ theme, hover: true })};
  }

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

export const ButtonGroupHorizontal = styled.div<{
  switchButtonOrder?: boolean
  buttonGap?: string
}>`
  display: flex;
  flex-direction: ${({ switchButtonOrder = false }) =>
    switchButtonOrder ? "row-reverse" : "row"};
  gap: ${({ buttonGap }) => buttonGap ?? "12px"};
  width: 100%;
`

export const ButtonGroupVertical = styled.div<{
  switchButtonOrder?: boolean
}>`
  display: flex;
  flex-direction: ${({ switchButtonOrder = false }) =>
    switchButtonOrder ? "column-reverse" : "column"};
  gap: 8px;
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

/** TODO: rationalise variants */

export interface IIconButton extends IButton {
  icon: ReactNode
  clickedIcon: ReactNode
  clickedTimeout?: number
}

export const PressableButton = styled(Button)`
  &:active {
    transform: scale(
      ${({ size }) => (size === "s" || size === "xs" ? 0.95 : 0.975)}
    );
  }
`

const IconButtonContent = styled.div`
  flex-direction: row;
  gap: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`

interface IClicked {
  clicked: boolean
}

const IconWrapper = styled.div`
  position: relative;
`

const IconContainer = styled.div<IClicked>`
  opacity: ${({ clicked }) => (clicked ? 0 : 1)};
  transition: opacity 0.15s ease-in-out;
`

const ClickedIconContainer = styled.div<IClicked>`
  opacity: ${({ clicked }) => (clicked ? 1 : 0)};
  transition: opacity 0.15s ease-in-out;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const IconButton: FC<IIconButton> = ({
  icon,
  clickedIcon,
  clickedTimeout = 1000,
  onClick: onClickProp,
  children,
  ...rest
}) => {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [clicked, setClicked] = useState(false)
  const clearClicked = useCallback(() => {
    setClicked(false)
  }, [])
  const onClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      timeoutId.current && clearTimeout(timeoutId.current)
      timeoutId.current = setTimeout(clearClicked, clickedTimeout)
      setClicked(true)
      onClickProp && onClickProp(e)
    },
    [clearClicked, clickedTimeout, onClickProp],
  )
  return (
    <PressableButton {...rest} onClick={onClick}>
      <IconButtonContent>
        <IconWrapper>
          <IconContainer clicked={clicked}>{icon}</IconContainer>
          <ClickedIconContainer clicked={clicked}>
            {clickedIcon}
          </ClickedIconContainer>
        </IconWrapper>
        {children}
      </IconButtonContent>
    </PressableButton>
  )
}
