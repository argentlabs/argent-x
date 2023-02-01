import { B3, Button, H5, NavigationContainer, P3, icons } from "@argent/ui"
import { Box, Flex, Spinner, useClipboard } from "@chakra-ui/react"
import { utils } from "ethers"
import { FC, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { recover } from "../../recovery/recovery.service"
import { usePublicKey } from "../usePublicKey"

const { CopyIcon } = icons

export const JoinMultisigScreen: FC = () => {
  const navigate = useNavigate()
  const pubKey = usePublicKey()
  const { onCopy, setValue, hasCopied } = useClipboard("", 2000)

  const encodedPubKey = useMemo(
    () => pubKey && utils.base58.encode(pubKey),
    [pubKey],
  )

  useEffect(() => {
    if (encodedPubKey) {
      setValue(encodedPubKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedPubKey])

  const onDone = async () => {
    navigate(await recover({ showAccountList: true }))
  }

  return (
    <NavigationContainer title="Join existing multisig">
      <Flex
        align="center"
        justify="center"
        direction="column"
        textAlign="center"
        pt="44px"
        pb={6}
        px={4}
        gap={6}
      >
        <H5>Share your signer key with the multisig creator</H5>
        <Box
          borderRadius="xl"
          bg="neutrals.800"
          p={4}
          mb={4.5}
          boxSizing="border-box"
          w="full"
        >
          {pubKey ? (
            <P3 fontWeight="bold" color="white50">
              {encodedPubKey}
            </P3>
          ) : (
            <Spinner w={6} h={6} />
          )}
        </Box>

        {encodedPubKey && (
          <Button onClick={onCopy} variant="link" gap={1}>
            <CopyIcon />
            <B3 color="neutrals.400">{hasCopied ? "Copied" : "Copy"}</B3>
          </Button>
        )}
      </Flex>

      <Box position="absolute" w="full" bottom={6} px={4}>
        <Button bg="primary.500" w="full" onClick={onDone}>
          Done
        </Button>
      </Box>
    </NavigationContainer>
  )
}
