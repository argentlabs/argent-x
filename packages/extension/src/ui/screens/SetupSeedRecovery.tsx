import { FC, Suspense } from "react"
import usePromise from "react-promise-suspense"
import { useNavigate } from "react-router-dom"
import styled, { keyframes } from "styled-components"

import { Button } from "../components/Button"
import { IconBarWithIcons } from "../components/Recovery/IconBar"
import { PageWrapper, Paragraph, Title } from "../components/Recovery/Page"
import { routes } from "../routes"
import { getSeedPhrase } from "../utils/messaging"

const SeedPhraseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  grid-gap: 12px;

  margin-bottom: 96px;
`

const SeedWordBadge = styled.div`
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
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

const FetchedSeedPhrase: FC = () => {
  const seedPhrase: string = usePromise(() => getSeedPhrase(), [0])

  return (
    <SeedPhraseGrid>
      {seedPhrase.split(" ").map((word, index) => (
        <SeedWordBadge key={index}>{word}</SeedWordBadge>
      ))}
    </SeedPhraseGrid>
  )
}

export const SetupSeedRecoveryPage: FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <IconBarWithIcons />
      <PageWrapper>
        <Title>Recovery phrase</Title>
        <Paragraph>
          Write these words down on paper. It is unsafe to save them on your
          computer.
        </Paragraph>

        <Suspense
          fallback={
            <>
              <SeedPhraseGrid>
                {[...Array(12)].map((_, index) => (
                  <LoadingSeedWordBadge
                    key={index}
                    animationDelay={(index % 3) * 200}
                  />
                ))}
              </SeedPhraseGrid>
              <Button disabled>Continue</Button>
            </>
          }
        >
          <FetchedSeedPhrase />
          <Button
            onClick={() => {
              navigate(routes.confirmSeedRecovery())
            }}
          >
            Continue
          </Button>
        </Suspense>
      </PageWrapper>
    </>
  )
}
