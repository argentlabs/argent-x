import { FC, ReactNode } from "react"
import styled from "styled-components"

import { ButtonVariant, getButtonColor } from "./Button"

export const OptionsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`

const OptionWrapper = styled.div<{
  disabled?: boolean
  variant?: ButtonVariant
}>`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  color: ${({ theme, disabled }) =>
    disabled ? theme.button.default.fg.disabled : theme.button.default.fg.base};

  background-color: ${({ disabled }) =>
    getButtonColor("bg", disabled ? "disabled" : "base")};
  cursor: ${({ disabled }) => (disabled ? "auto" : "pointer")};
  transition: ${({ theme }) => theme.button.transition};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:hover,
  &:focus {
    outline: 0;
    background-color: ${({ disabled }) =>
      getButtonColor("bg", disabled ? "disabled" : "hover")};
  }
`

const IconWapper = styled.div`
  display: flex;
`

const OptionTextWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-self: flex-start;
`

const OptionTitle = styled.h2`
  margin: 0;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
`

const OptionDescription = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
`

const OptionIcon: FC = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g style={{ mixBlendMode: "soft-light" }}>
        <circle cx="12" cy="12" r="12" fill="black" />
      </g>
      <path
        d="M16.5005 12C16.5007 12.1639 16.466 12.326 16.3986 12.4754C16.3312 12.6249 16.2327 12.7582 16.1096 12.8665L10.5207 17.7834C10.3354 17.9388 10.0968 18.0156 9.85571 17.9974C9.61463 17.9791 9.39027 17.8672 9.2306 17.6857C9.07093 17.5041 8.98862 17.2673 9.00127 17.0259C9.01392 16.7845 9.12054 16.5576 9.29831 16.3937L14.1857 12.0942C14.1991 12.0825 14.2098 12.068 14.2172 12.0517C14.2246 12.0355 14.2284 12.0178 14.2284 12C14.2284 11.9822 14.2246 11.9645 14.2172 11.9483C14.2098 11.932 14.1991 11.9175 14.1857 11.9058L9.29831 7.60629C9.12054 7.44244 9.01392 7.21554 9.00127 6.9741C8.98862 6.73266 9.07093 6.49586 9.2306 6.31432C9.39027 6.13278 9.61463 6.02092 9.85571 6.00265C10.0968 5.98438 10.3354 6.06116 10.5207 6.21657L16.1076 11.132C16.231 11.2405 16.3298 11.374 16.3975 11.5237C16.4653 11.6734 16.5004 11.8357 16.5005 12Z"
        fill="currentColor"
      />
    </svg>
  )
}

interface OptionProps {
  icon: ReactNode
  title: ReactNode
  description?: string
  onClick?: () => void
  disabled?: boolean
  hideArrow?: boolean
  variant?: ButtonVariant
}

export const Option: FC<OptionProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled,
  hideArrow,
  variant,
}) => (
  <OptionWrapper variant={variant} onClick={onClick} disabled={disabled}>
    {icon && <IconWapper>{icon}</IconWapper>}
    <OptionTextWrapper>
      <OptionTitle>{title}</OptionTitle>
      {description && <OptionDescription>{description}</OptionDescription>}
    </OptionTextWrapper>
    {!hideArrow && (
      <IconWapper>
        <OptionIcon />
      </IconWapper>
    )}
  </OptionWrapper>
)
