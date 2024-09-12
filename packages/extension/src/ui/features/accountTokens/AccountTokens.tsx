import { Flex, VStack } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import { AccountTokensButtonsContainer } from "./AccountTokensButtonsContainer"
import { WalletAccount } from "../../../shared/wallet.model"
import { AccountTokensBalanceContainer } from "./AccountTokensBalanceContainer"
import { AddFundsDialogProvider } from "./useAddFundsDialog"
import { AccountBannersAndTokenListContainer } from "./AccountBannersAndTokenListContainer"
import { AccountTokensButtonsSkeleton } from "./AccountTokensButtons"
import { AccountTokensBalanceSkeleton } from "./AccountTokensBalance"
import { ActivityRowSkeleton } from "@argent/x-ui/simulation"
import { CellStack } from "@argent/x-ui"

export interface AccountTokensProps {
  account: WalletAccount
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  return (
    <Flex direction={"column"} data-testid="account-tokens" flex={1}>
      <VStack spacing={6} mt={4} mb={6}>
        <Suspense fallback={<AccountTokensBalanceSkeleton />}>
          <AccountTokensBalanceContainer account={account} />
        </Suspense>
        <Suspense fallback={<AccountTokensButtonsSkeleton />}>
          <AddFundsDialogProvider account={account}>
            <AccountTokensButtonsContainer account={account} />
          </AddFundsDialogProvider>
        </Suspense>
      </VStack>
      <Suspense
        fallback={
          <CellStack pt={0}>
            <ActivityRowSkeleton />
            <ActivityRowSkeleton />
            <ActivityRowSkeleton />
          </CellStack>
        }
      >
        <AccountBannersAndTokenListContainer account={account} />
      </Suspense>
    </Flex>
  )
}
