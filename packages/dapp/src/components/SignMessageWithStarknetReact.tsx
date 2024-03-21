import { Button, H2, Input, Textarea } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { useSignTypedData } from "@starknet-react/core"
import { FC, useEffect, useMemo, useState } from "react"
import { AccountInterface, stark } from "starknet"
import { Status } from "../types/Status"

interface SignMessageWithStarknetReactProps {
  account: AccountInterface
  setTransactionStatus: (status: Status) => void
}

const SignMessageWithStarknetReact: FC<SignMessageWithStarknetReactProps> = ({
  account,
  setTransactionStatus,
}) => {
  const [shortText, setShortText] = useState("")
  const [chainId, setChainId] = useState<string | undefined>(undefined)
  const [lastSig, setLastSig] = useState<string[]>([])

  useEffect(() => {
    const handler = async () => {
      setChainId(await account?.getChainId())
    }

    ;(async () => {
      await handler()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const message: any = useMemo(() => {
    return {
      domain: {
        name: "Example DApp",
        chainId,
        version: "0.0.1",
      },
      types: {
        StarkNetDomain: [
          { name: "name", type: "felt" },
          { name: "chainId", type: "felt" },
          { name: "version", type: "felt" },
        ],
        Message: [{ name: "message", type: "felt" }],
      },
      primaryType: "Message",
      message: {
        message: shortText,
      },
    }
  }, [shortText, chainId])
  const { signTypedDataAsync } = useSignTypedData(message)

  // skipDeploy to manage in starknet-react. cannot right now
  const handleSignSubmit = async (skipDeploy: boolean) => {
    try {
      setTransactionStatus("approve")
      const result = await signTypedDataAsync()
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

export { SignMessageWithStarknetReact }
