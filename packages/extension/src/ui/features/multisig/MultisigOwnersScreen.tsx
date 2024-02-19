import { B2, H4, P3, icons } from "@argent/ui"
import { Box, Button, Divider, Flex } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { usePublicKey } from "../accounts/usePublicKey"
import { useRouteAccount } from "../shield/useRouteAccount"
import { useMultisig } from "./multisig.state"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { num } from "starknet"
import { MultisigOwner } from "./MultisigOwner"
import { creatorMultisigMetadataView } from "../../views/multisig"
import { useView } from "../../views/implementation/react"
import { isEqualAddress } from "@argent/shared"
import { multisigService } from "../../services/multisig"

const { MultisigJoinIcon } = icons

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

  const ownerPublicKey = usePublicKey()
  const navigate = useNavigate()

  const multisigMetadata = useView(creatorMultisigMetadataView(multisig))

  const handleAddOwnerClick = () => {
    navigate(routes.multisigAddOwners(account.address))
  }

  const onUpdateAccountName = (key: string | undefined, name: string) => {
    if (!multisig?.creator || !key) {
      return
    }

    void multisigService.updateSignerMetadata(multisig?.creator, {
      key,
      name,
    })
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
          {ownerPublicKey && (
            <MultisigOwner
              owner={ownerPublicKey}
              signerMetadata={multisigMetadata?.signers?.find(
                (signerMetadata) =>
                  isEqualAddress(ownerPublicKey, signerMetadata.key),
              )}
              onUpdate={(name) => onUpdateAccountName(ownerPublicKey, name)}
              hasEdit
              hasCopy
            />
          )}
          <P3 color="neutrals.300" mb={1}>
            Other owners
          </P3>
          {multisig?.signers
            .filter((signer) => {
              if (!multisig?.publicKey) {
                return false
              }
              return num.toBigInt(signer) !== num.toBigInt(multisig.publicKey)
            })
            .map((signer) => (
              <MultisigOwner
                account={account}
                owner={signer}
                key={signer}
                onUpdate={(name) => onUpdateAccountName(signer, name)}
                signerMetadata={multisigMetadata?.signers?.find(
                  (signerMetadata) =>
                    isEqualAddress(signer, signerMetadata.key),
                )}
                hasEdit
                hasUpdate
                hasCopy
              />
            ))}
        </Box>
        {!account.needsDeploy && (
          <Button
            leftIcon={<MultisigJoinIcon />}
            variant="link"
            color="neutrals.400"
            onClick={handleAddOwnerClick}
          >
            <B2 data-testid="add-owners" color="neutrals.400">
              Add owners
            </B2>
          </Button>
        )}
      </Flex>
    </Box>
  )
}
