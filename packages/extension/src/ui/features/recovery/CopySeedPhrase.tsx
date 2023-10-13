import { FC, useEffect, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"

import { ColumnCenter } from "../../components/Column"
import { WarningIconRounded } from "../../components/Icons/WarningIconRounded"
import { CopySeedPhraseButton } from "./ui/CopySeedPhraseButton"
import { WarningText } from "./ui/WarningText"

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
    <ColumnCenter gap="12px">
      <WarningText>
        We do not recommend copying your recovery phrase to your clipboard. It
        can leave it susceptible to exploit!
      </WarningText>

      <CopyToClipboard
        onCopy={() => setSeedPhraseCopied(true)}
        text={seedPhrase}
      >
        <CopySeedPhraseButton active={seedPhraseCopied}>
          <WarningIconRounded />
          {seedPhraseCopied ? "Copied" : "Copy"}
        </CopySeedPhraseButton>
      </CopyToClipboard>
    </ColumnCenter>
  )
}
