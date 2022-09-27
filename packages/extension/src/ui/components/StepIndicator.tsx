import { FC } from "react"
import styled from "styled-components"

interface StepIndicatorProps {
  length: number
  currentIndex: number

  className?: string
  style?: React.CSSProperties
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`

const Point = styled.div<{ active?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #33302f;

  ${({ active }) =>
    active &&
    `
        background: #F36A3D;
    `}
`

export const StepIndicator: FC<StepIndicatorProps> = ({
  currentIndex,
  length,
  ...divProps
}) => {
  return (
    <Wrapper {...divProps}>
      {Array.from({ length }).map((_, i) => (
        <Point key={i} active={i === currentIndex} />
      ))}
    </Wrapper>
  )
}
