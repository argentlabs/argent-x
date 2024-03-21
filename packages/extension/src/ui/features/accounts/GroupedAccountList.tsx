import { H6 } from "@argent/x-ui"
import { Box, Flex } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC } from "react"

import { PendingMultisig } from "../../../shared/multisig/types"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Account } from "./Account"
import { AccountListScreenItemContainer } from "./AccountListScreenItemContainer"
import { MultisigListScreenItemContainer } from "../multisig/MultisigListScreenItemContainer"

export interface GroupedAccountListProps {
  title: string
  accounts: Account[]
  icon: React.ReactNode
  selectedAccount?: BaseWalletAccount
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
  const groupedAccounts = [...accounts, ...(pendingMultisigs || [])]

  return !isEmpty(groupedAccounts) ? (
    <Flex direction="column" gap={3} alignItems="flex-start">
      <Flex gap={2} align="center" color="neutrals.300" px={2}>
        {icon}
        <H6>{title}</H6>
      </Flex>
      {/** Render standard account list items for standard accounts */}
      {type === "standard" &&
        accounts.map((account) => (
          <Box key={account.address} w="full">
            <AccountListScreenItemContainer
              account={account}
              selectedAccount={selectedAccount}
              returnTo={returnTo}
            />
          </Box>
        ))}
      {/** Render multisig account list items for multisig accounts */}
      {type === "multisig" && (
        <MultisigListScreenItemContainer
          accounts={accounts}
          pendingMultisigs={pendingMultisigs}
          selectedAccount={selectedAccount}
          returnTo={returnTo}
        />
      )}
    </Flex>
  ) : (
    <></>
  )
}
