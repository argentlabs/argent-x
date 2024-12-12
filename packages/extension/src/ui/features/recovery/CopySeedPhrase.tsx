import { Button, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { useEffect, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"

import { icons, L2Bold } from "@argent/x-ui"

const { WarningCirclePrimaryIcon } = icons

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
    return null
  }

  return (
    <Flex direction={"column"} gap={4}>
      <Flex
        rounded={"xl"}
        textAlign={"center"}
        color="warn.500"
        px={3}
        py={2.5}
        bg={"warn.900"}
      >
        <L2Bold>
          We do not recommend copying your recovery phrase to your clipboard. It
          can leave it susceptible to exploit!
        </L2Bold>
      </Flex>
      <CopyToClipboard
        onCopy={() => setSeedPhraseCopied(true)}
        text={seedPhrase}
      >
        <Button
          colorScheme={seedPhraseCopied ? "inverted" : undefined}
          size={"sm"}
          leftIcon={<WarningCirclePrimaryIcon color="warn.500" />}
          mx={"auto"}
        >
          {seedPhraseCopied ? "Copied" : "Copy"}
        </Button>
      </CopyToClipboard>
    </Flex>
  )
}
