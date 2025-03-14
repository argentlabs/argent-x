import { CopyPrimaryIcon, ShareIcon } from "@argent/x-ui/icons"
import { Button, H4, NavigationContainer, P2 } from "@argent/x-ui"
import { Box, Center, Flex, Spinner, useClipboard } from "@chakra-ui/react"
import type { FC } from "react"
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { useEncodedPublicKey } from "../accounts/usePublicKey"

export const JoinMultisigScreen: FC = () => {
  const navigate = useNavigate()

  const { publicKey } = useParams()

  const signerKey = useEncodedPublicKey(publicKey)

  const { onCopy, hasCopied, setValue } = useClipboard("", 2000)

  const onDone = () => {
    navigate(routes.accounts())
  }

  useEffect(() => {
    if (signerKey) {
      setValue(signerKey)
    }
  }, [setValue, signerKey])

  return (
    <NavigationContainer title="Join existing multisig">
      <Flex
        align="center"
        justify="center"
        direction="column"
        textAlign="center"
        pt="44px"
        pb={4}
        px={4}
        gap={4}
      >
        <Center
          w="14"
          h="14"
          background="neutrals.700"
          boxShadow="menu"
          borderRadius="90"
        >
          <ShareIcon height="7" width="7" />
        </Center>
        <H4>Share your signer pubkey with the multisig creator</H4>
        <Box
          borderRadius="xl"
          bg="neutrals.800"
          mt={2}
          p={4}
          boxSizing="border-box"
          w="full"
        >
          {signerKey ? (
            <P2 fontWeight="bold" color="white.50" data-testid="signerKey">
              {signerKey}
            </P2>
          ) : (
            <Spinner w={6} h={6} />
          )}
        </Box>

        {signerKey && (
          <Button
            data-testid="copy-pubkey"
            onClick={onCopy}
            colorScheme="transparent"
            size="sm"
            color="text-secondary"
            leftIcon={<CopyPrimaryIcon />}
          >
            {hasCopied ? "Copied" : "Copy"}
          </Button>
        )}
      </Flex>
      <Box position="absolute" w="full" bottom={6} px={4}>
        <Button
          data-testid="button-done"
          bg="primary.500"
          w="full"
          onClick={onDone}
        >
          Done
        </Button>
      </Box>
    </NavigationContainer>
  )
}
