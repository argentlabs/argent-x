import { H6 } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC, useMemo } from "react"

import { PendingMultisig } from "../../../shared/multisig/types"
import { multisigAndAccountSort } from "../../../shared/utils/accountsMultisigSort"
import { MultisigListScreenItem } from "../multisig/MultisigListScreenItem"
import { PendingMultisigListScreenItem } from "../multisig/PendingMultisigListScreenItem"
import { Account } from "./Account"
import { AccountListScreenItem } from "./AccountListScreenItem"

export interface GroupedAccountListProps {
  title: string
  accounts: Account[]
  icon: React.ReactNode
  selectedAccount?: Account
  returnTo?: string
  type: "standard" | "multisig"
  pendingMultisigs?: PendingMultisig[]
}

export const GroupedAccountList: FC<GroupedAccountListProps> = ({
  title,
  accounts,
  icon,
  selectedAccount,
  returnTo,
  type,
  pendingMultisigs,
}) => {
  const multisigsOrAccounts = useMemo(() => {
    if (type === "multisig" && pendingMultisigs && !isEmpty(pendingMultisigs)) {
      return multisigAndAccountSort(pendingMultisigs, accounts)
    }
    return accounts
  }, [accounts, pendingMultisigs, type])

  return !isEmpty(multisigsOrAccounts) ? (
    <Flex direction="column" gap={3} alignItems="flex-start">
      <Flex gap={2} align="center" color="neutrals.300" px={2}>
        {icon}
        <H6>{title}</H6>
      </Flex>
      {/** Render standard account list items for standard accounts */}
      {type === "standard" &&
        accounts.map((account) => (
          <Box key={account.address} w="full">
            <AccountListScreenItem
              account={account}
              selectedAccount={selectedAccount}
              returnTo={returnTo}
            />
          </Box>
        ))}
      {/** Render multisig account list items for multisig accounts */}
      {type === "multisig" &&
        multisigsOrAccounts.map((multisig) =>
          multisigIsPending(multisig) ? (
            <PendingMultisigListScreenItem
              key={multisig.publicKey}
              pendingMultisig={multisig}
            />
          ) : (
            <MultisigListScreenItem
              key={multisig.address}
              account={multisig}
              selectedAccount={selectedAccount}
              returnTo={returnTo}
            />
          ),
        )}
    </Flex>
  ) : (
    <></>
  )
}

const multisigIsPending = (
  multisig: Account | PendingMultisig,
): multisig is PendingMultisig => {
  return "publicKey" in multisig && !("address" in multisig)
}
