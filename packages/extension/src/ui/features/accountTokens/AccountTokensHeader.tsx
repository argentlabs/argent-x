import { B3, Button, FieldError, H2, icons } from "@argent/ui"
import { Center, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AddressCopyButton } from "../../components/AddressCopyButton"
import { AccountStatus } from "../accounts/accounts.service"
import { useMultisigAccount } from "../multisig/multisig.state"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"
import { useTokensWithBalance } from "./tokens.state"

const { DeployIcon } = icons

interface AccountSubheaderProps {
  status: AccountStatus
  account: BaseWalletAccount
  accountName?: string
  onRedeploy: () => void
}

export const AccountTokensHeader: FC<AccountSubheaderProps> = ({
  status,
  account,
  accountName,
  onRedeploy,
}) => {
  const { tokenDetails } = useTokensWithBalance(account)
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokenDetails)
  const accountAddress = account.address
  const multisig = useMultisigAccount(account) // This will be undefined if the account is not a multisig

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
      {sumCurrencyValue !== undefined ? (
        <H2>{prettifyCurrencyValue(sumCurrencyValue)}</H2>
      ) : (
        <H2>{accountName}</H2>
      )}
      <AddressCopyButton address={accountAddress} />
      {status.code === "ERROR" && (
        <VStack spacing={2} pt={2}>
          <FieldError>{status.text}</FieldError>
          <Button size="2xs" onClick={onRedeploy} leftIcon={<DeployIcon />}>
            Redeploy
          </Button>
        </VStack>
      )}
    </VStack>
  )
}
