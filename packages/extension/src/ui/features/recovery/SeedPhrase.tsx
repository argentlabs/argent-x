import { wordlists } from "ethers"
import { FC } from "react"
import styled, { keyframes } from "styled-components"

const SeedPhraseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  grid-gap: 12px;

  margin-bottom: 35px;
`

const SeedWordBadge = styled.div`
  padding: 4px 12px 4px 4px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const SeedWordBadgeNumber = styled.span`
  font-weight: 600;
  border-radius: 20px;
  color: ${({ theme }) => theme.bg1};
  background-color: ${({ theme }) => theme.bg5};
  margin-right: 4px;
  line-height: 18px;
  width: 18px;
  text-align: center;
  font-size: 12px;
`

const pulseKeyframe = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
`

const LoadingSeedWordBadge = styled.div<{
  animationDelay?: number
}>`
  height: 26px;
  width: 100%;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  animation: ${pulseKeyframe} 1s alternate infinite;
  animation-delay: ${({ animationDelay = 0 }) => animationDelay}ms;
`

interface SeedPhraseProps {
  seedPhrase?: string
}

export const SeedPhrase: FC<SeedPhraseProps> = ({ seedPhrase }) =>
  seedPhrase ? (
    <SeedPhraseGrid>
      {wordlists.en.split(seedPhrase).map((word, index) => (
        <SeedWordBadge key={word + index}>
          <SeedWordBadgeNumber>{index + 1}</SeedWordBadgeNumber>
          {word}
        </SeedWordBadge>
      ))}
    </SeedPhraseGrid>
  ) : (
    <SeedPhraseGrid>
      {[...Array(12)].map((_, index) => (
        <LoadingSeedWordBadge key={index} animationDelay={(index % 3) * 200} />
      ))}
    </SeedPhraseGrid>
  )
