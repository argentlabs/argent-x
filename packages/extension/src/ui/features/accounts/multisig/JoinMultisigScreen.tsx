import { B3, Button, H5, NavigationContainer, P3, icons } from "@argent/ui"
import { Box, Flex, Spinner, useClipboard } from "@chakra-ui/react"
import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { IconWrapper } from "../../actions/transaction/ApproveTransactionScreen/DappHeader/TransactionIcon/IconWrapper"
import { recover } from "../../recovery/recovery.service"
import { useSignerKey } from "../usePublicKey"

const { CopyIcon, ShareIcon } = icons

export const JoinMultisigScreen: FC = () => {
  const navigate = useNavigate()
  const signerKey = useSignerKey()

  const { onCopy, hasCopied, setValue } = useClipboard("", 2000)

  const onDone = async () => {
    navigate(await recover({ showAccountList: true }))
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
        pb={6}
        px={4}
        gap={6}
      >
        <IconWrapper borderRadius="90">
          <ShareIcon height="7" width="7" />
        </IconWrapper>
        <H5>Share your signer key with the multisig creator</H5>
        <Box
          borderRadius="xl"
          bg="neutrals.800"
          p={4}
          mb={4.5}
          boxSizing="border-box"
          w="full"
        >
          {signerKey ? (
            <P3 fontWeight="bold" color="white50">
              {signerKey}
            </P3>
          ) : (
            <Spinner w={6} h={6} />
          )}
        </Box>

        {signerKey && (
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
