import { FC } from "react"
import styled from "styled-components"

export const StepGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  max-width: 380px;
  width: 100%;
`

export interface Step {
  title: string
  description?: string
}

interface StepProps extends Step {
  number: number
}

const StepWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #333332;
  background: linear-gradient(
    to right,
    #333332 0%,
    #333332 33px,
    transparent 33px,
    transparent 100%
  );
  width: 100%;
  overflow: hidden;
`

const StepNumber = styled.div`
  font-weight: 600;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
`

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px;
`

const StepTitle = styled.div`
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
`

const StepDescription = styled.div`
  color: #8f8e8c;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
`

export const Step: FC<StepProps> = ({ number, title, description }) => {
  return (
    <StepWrapper>
      <StepNumber>{number}</StepNumber>
      <StepContent>
        <StepTitle>{title}</StepTitle>
        {description && <StepDescription>{description}</StepDescription>}
      </StepContent>
    </StepWrapper>
  )
}

export const Steps: FC<{ steps: Step[] }> = ({ steps }) => {
  return (
    <StepGroup>
      {steps.map((step, index) => (
        <Step key={index} number={index + 1} {...step} />
      ))}
    </StepGroup>
  )
}
