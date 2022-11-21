import styled, { css, keyframes } from "styled-components"

export const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  cursor: pointer;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.05);
  }
`

export const TokenDetailsWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow: hidden;
`

export const TokenTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const TokenTitle = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  margin: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
`

export interface IIsLoading {
  isLoading?: boolean
}

export const isLoadingPulse = ({ isLoading }: IIsLoading) => {
  if (isLoading) {
    return css`
      animation: ${PulseAnimation} 1s ease-in-out infinite;
    `
  }
}

const PulseAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`
