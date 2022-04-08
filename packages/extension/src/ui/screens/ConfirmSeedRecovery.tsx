import { wordlists } from "ethers"
import { FC, Suspense, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled, { css, keyframes } from "styled-components"
import useSWRImmutable from "swr/immutable"

import { Button } from "../components/Button"
import { IconBarWithIcons } from "../components/Recovery/IconBar"
import { PageWrapper, Paragraph, Title } from "../components/Recovery/Page"
import { FormError } from "../components/Typography"
import { routes } from "../routes"
import { useBackupRequired } from "../states/backupDownload"
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

const SelectableSeedWordBadge = styled(SeedWordBadge)<{
  isSelected: boolean
}>`
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }

  ${({ isSelected }) =>
    isSelected &&
    css`
      background-color: rgba(255, 255, 255, 0.4);
      &:hover {
        background-color: rgba(255, 255, 255, 0.4);
      }
    `}
`

function getRandomWord(excludeWordlist: string[]): string {
  const excludeIndexes = excludeWordlist.map((word) =>
    wordlists.en.getWordIndex(word),
  )
  const randomIndex = Math.floor(Math.random() * 2048)
  if (excludeIndexes.includes(randomIndex)) {
    return getRandomWord(excludeWordlist)
  }
  return wordlists.en.getWord(randomIndex)
}

function createConfirmationWordlist(seedPhrase: string[]): string[] {
  // chunk array into groups of 3
  const seedPhraseChunks = seedPhrase.reduce((acc, curr, index) => {
    if (index % 3 === 0) {
      acc.push([curr])
    } else {
      acc[acc.length - 1].push(curr)
    }
    return acc
  }, [] as string[][])

  // create confirmation wordlist
  const seenWords: string[] = []
  const confirmationWordlistChunks = seedPhraseChunks.map((chunk, index) => {
    const randomIndexToKeep = (Math.floor(Math.random() * 2) + index) % 3 // add index for more entropy
    return chunk.map((word, index) => {
      if (index === randomIndexToKeep) {
        return word
      }
      const randomWord = getRandomWord([...seedPhrase, ...seenWords])
      seenWords.push(randomWord)
      return randomWord
    })
  })

  return confirmationWordlistChunks.flat()
}

const ConfirmSeedPhrase: FC<{
  onChange?: (isValid: boolean) => void
}> = ({ onChange }) => {
  const { data: seedPhrase = "" } = useSWRImmutable(
    // always use useSWRImmutable and not useSWR otherwise the seedphrase will get cached unencrypted in localstorage
    "seedPhrase",
    () => getSeedPhrase(),
    {
      suspense: true,
    },
  )

  const { data: confirmSeedPhrase = [] } = useSWRImmutable(
    "confirmSeedPhrase",
    () => createConfirmationWordlist(wordlists.en.split(seedPhrase)),
    {
      suspense: true,
    },
  )

  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const toggleWord = (word: string) => {
    const updatedSelectedWords = selectedWords.includes(word)
      ? selectedWords.filter((selectedWord) => selectedWord !== word)
      : [...selectedWords, word]

    setSelectedWords(updatedSelectedWords)

    const expectedWords = wordlists.en
      .split(seedPhrase)
      .filter((word) => confirmSeedPhrase.includes(word))

    console.log(expectedWords, updatedSelectedWords)

    onChange?.(
      updatedSelectedWords.length === expectedWords.length &&
        updatedSelectedWords.every((selectedWord) =>
          expectedWords.includes(selectedWord),
        ),
    )
  }

  return (
    <SeedPhraseGrid>
      {confirmSeedPhrase.map((word, index) => (
        <SelectableSeedWordBadge
          key={index}
          isSelected={selectedWords.includes(word)}
          onClick={() => toggleWord(word)}
        >
          {word}
        </SelectableSeedWordBadge>
      ))}
    </SeedPhraseGrid>
  )
}

export const ConfirmSeedRecoveryPage: FC = () => {
  const navigate = useNavigate()
  const [isValid, setIsValid] = useState(false)
  const [showError, setShowError] = useState(false)

  return (
    <>
      <IconBarWithIcons showBack />
      <PageWrapper>
        <Title>Confirm backup</Title>
        <Paragraph>
          Please click on the words that are part of your seed phrase.
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
          <ConfirmSeedPhrase
            onChange={(isValid) => {
              setIsValid(isValid)
              setShowError(false)
            }}
          />
          <Button
            onClick={() => {
              if (isValid) {
                useBackupRequired.setState({ isBackupRequired: false })
                navigate(routes.account())
              } else {
                setShowError(true)
              }
            }}
            disabled={showError}
          >
            Confirm
          </Button>
          {showError && (
            <FormError
              style={{
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              Select all words which are part of your seed phrase.
            </FormError>
          )}
        </Suspense>
      </PageWrapper>
    </>
  )
}
