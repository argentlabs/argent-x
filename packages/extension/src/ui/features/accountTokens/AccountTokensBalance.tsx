import { B3, H2, L2 } from "@argent/x-ui"
import { Box, Center, Skeleton, Tooltip, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { WalletAccount } from "../../../shared/wallet.model"
import { StarknetIdOrAddressCopyButton } from "../../components/StarknetIdOrAddressCopyButton"
import { LedgerStatusText } from "../actions/transactionV2/header"
import { Multisig } from "../multisig/Multisig"
import { PrettyAccountBalanceOrName } from "./PrettyAccountBalance"

interface AccountTokensBalanceProps {
  account: WalletAccount
  isLedgerConnected?: boolean
  multisig?: Multisig
  usesLedgerSigner: boolean
}

export const AccountTokensBalanceSkeleton: FC = () => {
  return (
    <VStack spacing={0.5}>
      <Box py={1}>
        <Skeleton rounded="full" h={8} w={24} />
      </Box>
      <Box py={0.5}>
        <Skeleton rounded="full" h={4} w={32} />
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
        <LedgerStatusText as={L2} isConnected={isLedgerConnected} mb="1.5" />
      )}
      <Tooltip label={account.name}>
        <H2>
          <PrettyAccountBalanceOrName account={account} />
        </H2>
      </Tooltip>
      <StarknetIdOrAddressCopyButton account={account} pb={1} pt={0.5} />
    </VStack>
  )
}
