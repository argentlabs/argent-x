import { B3, H2 } from "@argent/ui"
import { Center, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AddressCopyButton } from "../../components/AddressCopyButton"
import { useStarknetId } from "../../services/useStarknetId"
import { useMultisig } from "../multisig/multisig.state"
import { StarknetIdCopyButton } from "./StarknetIdCopyButton"
import { usePrettyAccountBalance } from "./usePrettyAccountBalance"

interface AccountSubheaderProps {
  account: BaseWalletAccount
  accountName?: string
}

export const AccountTokensHeader: FC<AccountSubheaderProps> = ({
  account,
  accountName,
}) => {
  const prettyAccountBalance = usePrettyAccountBalance(account)
  const accountAddress = account.address
  const multisig = useMultisig(account) // This will be undefined if the account is not a multisig

  const { data: starknetId } = useStarknetId(account)

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
          <B3 color="neutrals.200">
            {multisig.threshold}/{multisig.signers.length} multisig
          </B3>
        </Center>
      )}
      <H2>{prettyAccountBalance || accountName}</H2>
      {starknetId ? (
        <StarknetIdCopyButton
          starknetId={starknetId}
          address={accountAddress}
        />
      ) : (
        <AddressCopyButton address={accountAddress} />
      )}
    </VStack>
  )
}
