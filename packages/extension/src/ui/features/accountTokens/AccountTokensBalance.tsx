import { B3, L2Bold, MassiveTitle } from "@argent/x-ui"
import { Box, Center, Skeleton, Tooltip, VStack } from "@chakra-ui/react"
import type { FC } from "react"

import type {
  MultisigWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { StarknetIdOrAddressCopyButton } from "../../components/StarknetIdOrAddressCopyButton"
import { PrettyBalanceOrNameForAccount } from "./PrettyBalance"
import { LedgerStatusTextWithReconnect } from "../navigation/LedgerStatusText"

import { typographyStyles } from "@argent/x-ui/theme"

interface AccountTokensBalanceProps {
  account: WalletAccount
  isLedgerConnected?: boolean
  multisig?: MultisigWalletAccount
  usesLedgerSigner: boolean
}

export const AccountTokensBalanceSkeleton: FC = () => {
  return (
    <VStack spacing={0.5}>
      <Box py={1}>
        <Skeleton rounded="full" h={"54px"} w={24} />
      </Box>
      <Box py={0.5}>
        <Skeleton rounded="full" h={"16px"} w={32} />
      </Box>
    </VStack>
  )
}

export const AccountTokensBalance: FC<AccountTokensBalanceProps> = ({
  account,
  multisig,
  isLedgerConnected,
  usesLedgerSigner,
}) => {
  return (
    <VStack spacing={0.5}>
      {multisig && (
        <Center
          border="1px solid"
          borderColor="neutrals.700"
          p="5px"
          pt="3px"
          borderRadius="base"
          mb="1.5"
        >
          <B3 data-testid="confirmations" color="neutrals.200">
            {multisig.threshold}/{multisig.signers.length} multisig
          </B3>
        </Center>
      )}
      {usesLedgerSigner && (
        <LedgerStatusTextWithReconnect
          as={L2Bold}
          isConnected={isLedgerConnected}
          mb="1.5"
          position={"relative"}
          accountType={account.type}
          networkId={account.networkId}
        />
      )}
      <Tooltip label={account.name}>
        <MassiveTitle>
          <PrettyBalanceOrNameForAccount account={account} />
        </MassiveTitle>
      </Tooltip>
      <StarknetIdOrAddressCopyButton
        account={account}
        p={2}
        {...typographyStyles.B3}
      />
    </VStack>
  )
}
