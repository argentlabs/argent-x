import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../components/Button"
import { IconBarWithIcons } from "../components/Recovery/IconBar"
import { PageWrapper, Paragraph, Title } from "../components/Recovery/Page"
import { routes } from "../routes"

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

        <SeedPhraseGrid>
          {[
            "1. genre",
            "2. summer",
            "3. laptop",
            "4. habit",
            "5. ahead",
            "6. quiz",
            "7. sugar",
            "8. juice",
            "9. ring",
            "10. dury",
            "11. donate",
            "12. gap",
          ].map((word, i) => (
            <SeedWordBadge key={word + i}>{word}</SeedWordBadge>
          ))}
        </SeedPhraseGrid>

        <Button
          onClick={() => {
            navigate(routes.confirmSeedRecovery())
          }}
        >
          Continue
        </Button>
      </PageWrapper>
    </>
  )
}
