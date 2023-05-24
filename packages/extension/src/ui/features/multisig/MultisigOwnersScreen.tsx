import { B2, H4, H6, P3, icons } from "@argent/ui"
import { Box, Button, Divider, Flex, IconButton } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { formatTruncatedSignerKey } from "../../services/addresses"
import { Account } from "../accounts/Account"
import { useEncodedPublicKeys, useSignerKey } from "../accounts/usePublicKey"
import { useRouteAccount } from "../shield/useRouteAccount"
import { useMultisig } from "./multisig.state"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"

const { MultisigJoinIcon, MinusIcon } = icons

export const MultisigOwnersScreen: FC = () => {
  const account = useRouteAccount()

  return (
    <MultisigSettingsWrapper>
      {account && <MultisigOwners account={account} />}
    </MultisigSettingsWrapper>
  )
}

const MultisigOwners = ({ account }: { account: Account }) => {
  const multisig = useMultisig(account)

  const signerKey = useSignerKey()
  const signerKeys = useEncodedPublicKeys(multisig?.signers ?? [])
  const navigate = useNavigate()

  const handleAddOwnerClick = () => {
    navigate(routes.multisigAddOwners(account.address))
  }

  const handleRemoveOwnerClick = (signerToRemove: string) => {
    navigate(routes.multisigRemoveOwners(account.address, signerToRemove))
  }

  return (
    <Box m={4} height="100%">
      <Flex flexDirection="column" height="100%" justifyContent="space-between">
        <Box>
          <H4>{multisig?.signers.length} owners</H4>
          <P3 color="neutrals.300">
            {multisig?.threshold}/{multisig?.signers.length} owners must confirm
            each transactions
          </P3>
          <Divider my={4} color="neutrals.800" />
          <P3 color="neutrals.300" mb={1}>
            Me
          </P3>
          <Box
            borderRadius="lg"
            backgroundColor="neutrals.800"
            px={4}
            py={6}
            mb={3}
          >
            {signerKey && (
              <H6 color="white">{formatTruncatedSignerKey(signerKey)}</H6>
            )}
          </Box>
          <P3 color="neutrals.300" mb={1}>
            Other owners
          </P3>
          {signerKeys
            .filter((signer) => signer !== signerKey)
            .map((signer) => {
              return (
                <Flex
                  borderRadius="lg"
                  backgroundColor="neutrals.800"
                  p={4}
                  key={signer}
                  my={2}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <H6 color="white">{formatTruncatedSignerKey(signer)}</H6>
                  <IconButton
                    backgroundColor="neutrals.900"
                    onClick={() => handleRemoveOwnerClick(signer)}
                    aria-label={"Remove owner"}
                    icon={<MinusIcon />}
                    h="auto"
                    minH={0}
                    minW={0}
                    p={1.5}
                    borderRadius="full"
                  />
                </Flex>
              )
            })}
        </Box>
        {!account.needsDeploy && (
          <Button
            leftIcon={<MultisigJoinIcon />}
            variant="link"
            color="neutrals.400"
            onClick={handleAddOwnerClick}
          >
            <B2 color="neutrals.400">Add owners</B2>
          </Button>
        )}
      </Flex>
    </Box>
  )
}