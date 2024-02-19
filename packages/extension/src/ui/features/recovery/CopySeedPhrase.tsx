import { Button, Flex } from "@chakra-ui/react"
import { FC, useEffect, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"

import { L2, icons } from "@argent/ui"

const { AlertFillIcon } = icons

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
        <L2>
          We do not recommend copying your recovery phrase to your clipboard. It
          can leave it susceptible to exploit!
        </L2>
      </Flex>

      <CopyToClipboard
        onCopy={() => setSeedPhraseCopied(true)}
        text={seedPhrase}
      >
        <Button
          colorScheme={seedPhraseCopied ? "inverted" : undefined}
          size={"sm"}
          leftIcon={<AlertFillIcon color="warn.500" />}
          mx={"auto"}
        >
          {seedPhraseCopied ? "Copied" : "Copy"}
        </Button>
      </CopyToClipboard>
    </Flex>
  )
}
