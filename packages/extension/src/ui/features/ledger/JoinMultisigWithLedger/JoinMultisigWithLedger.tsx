import type { FC } from "react"
import { useState } from "react"
import { ScreenLayout } from "../layout/ScreenLayout"
import { JoinMultisigSidePanel } from "./JoinMultisigSidePanel"
import { Box, Flex, Spinner } from "@chakra-ui/react"
import { CopyPrimaryIcon } from "@argent/x-ui/icons"
import { CopyTooltip, H5, P2 } from "@argent/x-ui"
import { useCreatePendingMultisig } from "../../multisig/hooks/useCreatePendingMultisig"
import { useOnMountUnsafe } from "../../../hooks/useOnMountUnsafe"
import { SignerType } from "../../../../shared/wallet.model"
import { encodeBase58 } from "@argent/x-shared"
import { ActionButton } from "../../../components/FullScreenPage"

interface JoinMultisigWithLedgerProps {
  networkId: string
  currentStep: number
  helpLink?: string
  totalSteps: number
}

export const JoinMultisigWithLedger: FC<JoinMultisigWithLedgerProps> = ({
  networkId,
  currentStep,
  helpLink,
  totalSteps,
}) => {
  const { createPendingMultisig, loading } = useCreatePendingMultisig()
  const [signerKey, setSignerKey] = useState<string>()

  useOnMountUnsafe(() => {
    createPendingMultisig(networkId, SignerType.LEDGER)
      .then((pendingMultisig) => {
        if (!pendingMultisig) {
          throw new Error("No pending multisig found")
        }
        return encodeBase58(pendingMultisig.publicKey)
      })
      .then(setSignerKey)
      .catch(console.error) // Consider handling errors more gracefully
  })

  return (
    <ScreenLayout
      title="Share your signer pubkey"
      subtitle="Share your signer pubkey with the multisig creator. It can also be viewed from the account list in your Argent X wallet"
      currentIndex={currentStep}
      length={totalSteps}
      sidePanel={<JoinMultisigSidePanel />}
      helpLink={helpLink}
      filledIndicator
    >
      <Box mt="5" pt="5" borderTop="1px solid" borderColor="neutrals.700">
        <Flex direction="column" gap="4">
          <H5 color="neutrals.300">My signer pubkey</H5>
          <Flex
            p="16px"
            bgColor="neutrals.800"
            borderRadius="8px"
            width="112.5"
            justifyContent="space-between"
            alignItems="center"
          >
            <P2 fontWeight="bold" color="white.50">
              {signerKey || "Assigning Ledger signer pubkey..."}
            </P2>

            {loading && <Spinner size="sm" color="white.50" />}
            {signerKey && (
              <CopyTooltip copyValue={signerKey}>
                <CopyPrimaryIcon width={5} height={5} color="white.50" />
              </CopyTooltip>
            )}
          </Flex>
        </Flex>

        <ActionButton
          marginTop={{ md: "216px", base: "20px" }}
          onClick={() => window.close()}
          isDisabled={!signerKey}
        >
          Finish
        </ActionButton>
      </Box>
    </ScreenLayout>
  )
}
