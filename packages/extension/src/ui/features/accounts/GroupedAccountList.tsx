import { H5 } from "@argent/x-ui"
import { Box, Flex } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import type { FC } from "react"

import type { PendingMultisig } from "../../../shared/multisig/types"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { AccountListScreenItemContainer } from "./AccountListScreenItemContainer"
import { MultisigListScreenItemContainer } from "../multisig/MultisigListScreenItemContainer"

export interface GroupedAccountListProps {
  title: string
  accounts: WalletAccount[]
  icon: React.ReactNode
  selectedAccount?: BaseWalletAccount
  returnTo?: string
  type: "standard" | "multisig" | "imported"
  pendingMultisigs?: PendingMultisig[]
  showTitle?: boolean
}

export const GroupedAccountList: FC<GroupedAccountListProps> = ({
  title,
  accounts,
  icon,
  selectedAccount,
  returnTo,
  type,
  pendingMultisigs,
  showTitle = true,
}) => {
  const groupedAccounts = [...accounts, ...(pendingMultisigs || [])]

  return !isEmpty(groupedAccounts) ? (
    <Flex direction="column" gap={3} alignItems="flex-start">
      {showTitle && (
        <Flex gap={2} align="center" color="text-secondary" px={2}>
          {icon}
          <H5 data-testid={`${title.toLocaleLowerCase().replace(" ", "-")}`}>
            {title}
          </H5>
        </Flex>
      )}
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
      {type === "imported" &&
        accounts.map((account) => (
          <Box key={account.address} w="full">
            <AccountListScreenItemContainer
              account={account}
              selectedAccount={selectedAccount}
              returnTo={returnTo}
            />
          </Box>
        ))}
    </Flex>
  ) : (
    <></>
  )
}
