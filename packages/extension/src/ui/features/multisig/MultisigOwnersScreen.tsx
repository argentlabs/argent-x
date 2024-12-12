import { B2, H3, icons, P2 } from "@argent/x-ui"
import { Box, Button, Divider, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"
import { multisigView } from "./multisig.state"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { num } from "starknet"
import { MultisigOwner } from "./MultisigOwner"
import { publicKeyMultisigMetadataView } from "../../views/multisig"
import { useView } from "../../views/implementation/react"
import { isEqualAddress } from "@argent/x-shared"
import { multisigService } from "../../services/multisig"
import type { WalletAccount } from "../../../shared/wallet.model"

const { AddContactSecondaryIcon } = icons

export const MultisigOwnersScreen: FC = () => {
  const account = useRouteWalletAccount()

  return (
    <MultisigSettingsWrapper>
      {account && <MultisigOwners account={account} />}
    </MultisigSettingsWrapper>
  )
}

const MultisigOwners = ({ account }: { account: WalletAccount }) => {
  const multisig = useView(multisigView(account))

  const ownerPublicKey = multisig?.publicKey
  const navigate = useNavigate()

  const multisigMetadata = useView(publicKeyMultisigMetadataView(multisig))

  const handleAddOwnerClick = () => {
    navigate(routes.multisigAddOwners(account.id))
  }

  const onUpdateAccountName = (key: string | undefined, name: string) => {
    if (!multisig?.publicKey || !key) {
      return
    }

    void multisigService.updateSignerMetadata(multisig?.publicKey, {
      key,
      name,
    })
  }

  const isLedgerSigner = account.signer.type === "ledger"
  return (
    <Box m={4} height="100%">
      <Flex flexDirection="column" height="100%" justifyContent="space-between">
        <Box>
          <H3>{multisig?.signers.length} owners</H3>
          <P2 color="neutrals.300">
            {multisig?.threshold}/{multisig?.signers.length} owners must confirm
            each transactions
          </P2>
          <Divider my={4} color="neutrals.800" />
          <P2 color="neutrals.300" mb={1}>
            Me
          </P2>
          {ownerPublicKey && (
            <MultisigOwner
              account={account}
              owner={ownerPublicKey}
              signerMetadata={multisigMetadata?.signers?.find(
                (signerMetadata) =>
                  isEqualAddress(ownerPublicKey, signerMetadata.key),
              )}
              onUpdate={(name) => onUpdateAccountName(ownerPublicKey, name)}
              hasEdit
              hasCopy
              hasUpdate={!isLedgerSigner}
              ownerIsSelf
            />
          )}
          <P2 color="neutrals.300" mb={1}>
            Other owners
          </P2>
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
            leftIcon={<AddContactSecondaryIcon />}
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
