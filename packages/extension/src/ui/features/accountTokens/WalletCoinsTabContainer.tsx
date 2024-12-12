import { CellStack } from "@argent/x-ui"
import { ActivityRowSkeleton } from "@argent/x-ui/simulation"
import type { FC } from "react"
import { Suspense } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { TokenListContainer } from "./TokenListContainer"

export interface WalletCoinsTabContainerProps {
  account: WalletAccount
}

export const WalletCoinsTabContainer: FC<WalletCoinsTabContainerProps> = ({
  account,
}) => {
  return (
    <Suspense
      fallback={
        <CellStack pt={0}>
          <ActivityRowSkeleton />
          <ActivityRowSkeleton />
          <ActivityRowSkeleton />
        </CellStack>
      }
    >
      <TokenListContainer account={account} />
    </Suspense>
  )
}
