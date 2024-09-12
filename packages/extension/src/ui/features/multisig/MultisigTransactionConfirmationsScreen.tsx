import { H5, P3, logosDeprecated } from "@argent/x-ui"
import { FC, useMemo } from "react"

import { ensureArray, isEqualAddress } from "@argent/x-shared"
import { Box, Center, Circle, VStack } from "@chakra-ui/react"
import { num } from "starknet"
import { useView } from "../../views/implementation/react"
import { publicKeyMultisigMetadataView } from "../../views/multisig"
import {
  useEncodedPublicKey,
  useEncodedPublicKeys,
  usePublicKey,
} from "../accounts/usePublicKey"
import { useIsLedgerSigner } from "../ledger/hooks/useIsLedgerSigner"
import { multisigView } from "./multisig.state"
import { MultisigOwner } from "./MultisigOwner"
import { WalletAccount } from "../../../shared/wallet.model"

const { LedgerLogo } = logosDeprecated

interface MultisigTransactionConfirmationsScreenProps {
  account?: WalletAccount
  approvedSigners: string[]
  nonApprovedSigners: string[]
}
export const MultisigTransactionConfirmationsScreen: FC<
  MultisigTransactionConfirmationsScreenProps
> = (props) => {
  const { account, approvedSigners, nonApprovedSigners } = props

  const publicKey = usePublicKey(account)
  const approvedSignersPublicKey = useEncodedPublicKeys(
    ensureArray(approvedSigners),
  )
  const encodedPubKey = useEncodedPublicKey(publicKey)

  const multisig = useView(multisigView(account))
  const multisigMetadata = useView(publicKeyMultisigMetadataView(multisig))
  const isLedgerSigner = useIsLedgerSigner(multisig)

  const noLedgerPublicKey = useMemo(
    () => isLedgerSigner && !publicKey,
    [isLedgerSigner, publicKey],
  )

  if (noLedgerPublicKey) {
    return <ConnectLedgerMessage />
  }

  return (
    <>
      <P3 color="neutrals.300" mb={3}>
        Me
      </P3>
      {publicKey && (
        <MultisigOwner
          owner={publicKey}
          signerMetadata={multisigMetadata?.signers?.find((signerMetadata) =>
            isEqualAddress(publicKey, signerMetadata.key),
          )}
          approved={approvedSignersPublicKey.some(
            (key) => key === encodedPubKey,
          )}
        />
      )}
      <P3 color="neutrals.300" mb={3}>
        Other owners
      </P3>
      {approvedSigners
        .filter((signer) => {
          if (!publicKey) {
            return false
          }
          return num.toBigInt(signer) !== num.toBigInt(publicKey)
        })
        .map((signer) => (
          <MultisigOwner
            owner={signer}
            key={signer}
            signerMetadata={multisigMetadata?.signers?.find((signerMetadata) =>
              isEqualAddress(signer, signerMetadata.key),
            )}
            approved
          />
        ))}
      {nonApprovedSigners
        .filter((signer) => {
          if (!publicKey) {
            return false
          }
          return num.toBigInt(signer) !== num.toBigInt(publicKey)
        })
        .map((signer) => (
          <MultisigOwner
            owner={signer}
            key={signer}
            signerMetadata={multisigMetadata?.signers?.find((signerMetadata) =>
              isEqualAddress(signer, signerMetadata.key),
            )}
          />
        ))}
    </>
  )
}

const ConnectLedgerMessage: FC = () => {
  return (
    <Box mt={20}>
      <VStack spacing={4.5} justify="center" align="center">
        <Circle bg="surface-elevated" p={4.5}>
          <Center>
            <LedgerLogo w={10} h={10} />
          </Center>
        </Circle>
        <Box maxW={{ base: 62 }} textAlign="center">
          <H5 color="text-subtle">Connect your Ledger to view details</H5>
        </Box>
      </VStack>
    </Box>
  )
}
