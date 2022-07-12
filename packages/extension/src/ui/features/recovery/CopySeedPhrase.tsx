import { FC, useEffect, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { WarningIconRounded } from "../../components/Icons/WarningIconRounded"

const CopySeedPhraseButton = styled(Button)<{ active: boolean }>`
  padding: 6px 12px;
  background: ${({ active }) =>
    active ? "#FFFFFF" : "rgba(255, 255, 255, 0.25)"};
  color: ${({ active }) => (active ? "#000" : "#fff")};
  border-radius: 100px;
  width: max-content;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  :active,
  :focus {
    background: ${({ active }) =>
      active ? "#FFFFFF" : "rgba(255, 255, 255, 0.25)"};
  }
`

const WarningText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.yellow1};
  font-size: 12px;
  line-height: 16px;
`

export const CopySeedPhrase: FC<{ seedPhrase?: string }> = ({ seedPhrase }) => {
  const [seedPhraseCopied, setSeedPhraseCopied] = useState(false)

  useEffect(() => {
    if (seedPhraseCopied) {
      setTimeout(() => {
        setSeedPhraseCopied(false)
      }, 3000)
    }
  }, [seedPhraseCopied])

  if (!seedPhrase) {
    return <></>
  }

  return (
    <ColumnCenter gap="16px">
      <WarningText>
        We do not recommend copying your recovery phrase to your clipboard. It
        can leave it susceptible to exploit!
      </WarningText>

      <CopyToClipboard
        onCopy={() => setSeedPhraseCopied(true)}
        text={seedPhrase}
      >
        <CopySeedPhraseButton active={seedPhraseCopied} type="button">
          {seedPhraseCopied ? "Copied" : "Copy"}
          <WarningIconRounded />
        </CopySeedPhraseButton>
      </CopyToClipboard>
    </ColumnCenter>
  )
}
