import { Button, H2, Input, Textarea } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useState } from "react"
import { stark } from "starknet"
import { signMessage } from "../services/wallet.service"
import { Status } from "../types/Status"

interface SignMessageProps {
  setTransactionStatus: (status: Status) => void
}

const SignMessage: FC<SignMessageProps> = ({ setTransactionStatus }) => {
  const [shortText, setShortText] = useState("")
  const [lastSig, setLastSig] = useState<string[]>([])

  const handleSignSubmit = async (skipDeploy: boolean) => {
    try {
      setTransactionStatus("approve")
      const result = await signMessage(shortText, skipDeploy)
      setLastSig(stark.formatSignature(result))
      setTransactionStatus("success")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <Flex flex={1} width="full">
      <Flex
        as="form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSignSubmit(false)
        }}
        direction="column"
        background="neutrals.700"
        flex={1}
        p="4"
        gap="3"
        borderTopLeftRadius="lg"
        borderBottomLeftRadius="lg"
      >
        <H2>Sign Message</H2>

        <Input
          type="text"
          id="short-text"
          name="short-text"
          placeholder="Short text"
          value={shortText}
          onChange={(e) => setShortText(e.target.value)}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
          <Button colorScheme="primary" type="submit" w="full">
            Sign
          </Button>
          <Button
            w="full"
            colorScheme="tertiary"
            type="submit"
            onClick={async () => {
              handleSignSubmit(true)
            }}
          >
            Sign without deploy
          </Button>
        </div>
      </Flex>
      <Flex
        as="form"
        direction="column"
        background="neutrals.700"
        flex={1}
        p="4"
        gap="3"
        borderTopRightRadius="lg"
        borderBottomRightRadius="lg"
      >
        <H2>Sign results</H2>

        {/* Label and textarea for value r */}
        <Textarea id="r" name="r" placeholder="r" value={lastSig[0]} readOnly />
        {/* Label and textarea for value s */}
        <Textarea id="s" name="s" placeholder="s" value={lastSig[1]} readOnly />
      </Flex>
    </Flex>
  )
}

export { SignMessage }
