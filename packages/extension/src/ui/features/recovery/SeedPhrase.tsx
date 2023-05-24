import { wordlists } from "ethers"
import { FC } from "react"

import { LoadingSeedWordBadge } from "./ui/LoadingSeedWordBadge"
import { SeedPhraseGrid } from "./ui/SeedPhraseGrid"
import { SeedWordBadge } from "./ui/SeedWordBadge"
import { SeedWordBadgeNumber } from "./ui/SeedWordBadgeNumber"

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
