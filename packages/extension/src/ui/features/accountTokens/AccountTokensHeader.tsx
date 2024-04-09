import { B3, H2 } from "@argent/x-ui"
import { Center, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useMultisig } from "../multisig/multisig.state"
import { usePrettyAccountBalance } from "./usePrettyAccountBalance"
import { StarknetIdOrAddressCopyButton } from "../../components/StarknetIdOrAddressCopyButton"

interface AccountSubheaderProps {
  account: BaseWalletAccount
  accountName?: string
}

export const AccountTokensHeader: FC<AccountSubheaderProps> = ({
  account,
  accountName,
}) => {
  const prettyAccountBalance = usePrettyAccountBalance(account)
  const multisig = useMultisig(account) // This will be undefined if the account is not a multisig

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
      <H2>{prettyAccountBalance || accountName}</H2>
      <StarknetIdOrAddressCopyButton account={account} />
    </VStack>
  )
}
