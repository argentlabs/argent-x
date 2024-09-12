import {
  Button,
  H5,
  NavigationContainer,
  P3,
  iconsDeprecated,
} from "@argent/x-ui"
import { Box, Flex, Spinner, useClipboard } from "@chakra-ui/react"
import { FC, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { useEncodedPublicKey } from "../accounts/usePublicKey"
import { IconWrapper } from "../actions/transaction/ApproveTransactionScreen/DappHeader/TransactionIcon/IconWrapper"
import { routes } from "../../../shared/ui/routes"

const { CopyIcon, ShareIcon } = iconsDeprecated

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
        <IconWrapper borderRadius="90">
          <ShareIcon height="7" width="7" />
        </IconWrapper>
        <H5>Share your signer pubkey with the multisig creator</H5>
        <Box
          borderRadius="xl"
          bg="neutrals.800"
          mt={2}
          p={4}
          boxSizing="border-box"
          w="full"
        >
          {signerKey ? (
            <P3 fontWeight="bold" color="white.50">
              {signerKey}
            </P3>
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
            leftIcon={<CopyIcon />}
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
