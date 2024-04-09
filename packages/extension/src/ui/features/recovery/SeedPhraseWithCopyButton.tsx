import { P3 } from "@argent/x-ui"
import { Divider, Flex } from "@chakra-ui/react"
import { CopySeedPhrase } from "./CopySeedPhrase"
import { SeedPhrase } from "./SeedPhrase"

export function SeedPhraseWithCopyButton({
  seedPhrase,
}: {
  seedPhrase?: string
}) {
  return (
    <Flex direction={"column"} gap={4}>
      <P3 fontSize="sm" color="neutrals.300">
        Write these words down on paper. It is unsafe to save them on your
        computer.
      </P3>
      <Divider color="neutrals.800" />
      <SeedPhrase seedPhrase={seedPhrase} />
      <CopySeedPhrase seedPhrase={seedPhrase} />
    </Flex>
  )
}
