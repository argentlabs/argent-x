import type { FC } from "react"
import { Suspense } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { AccountCollectionsContainer } from "./AccountCollectionsContainer"
import { ChevronRightSecondaryIcon, NftIcon } from "@argent/x-ui/icons"
import { CellStack } from "@argent/x-ui"
import { Option } from "../../components/Option"
import { TrackingLink } from "../../components/TrackingLink"
import { ActivityRowSkeleton } from "@argent/x-ui/simulation"

export interface WalletNftsTabContainerProps {
  account: WalletAccount
}

export const WalletNftsTabContainer: FC<WalletNftsTabContainerProps> = ({
  account,
}) => {
  return (
    <Suspense fallback={<ActivityRowSkeleton />}>
      <AccountCollectionsContainer
        pt={0}
        account={account}
        withHeader={false}
        emptyFallback={
          <CellStack pt={0}>
            <Option
              as={TrackingLink}
              href="https://unframed.co/"
              targetBlank
              title="Discover NFTs on Starknet"
              description="Explore collectibles"
              icon={<NftIcon />}
              rightIcon={<ChevronRightSecondaryIcon />}
            />
          </CellStack>
        }
      />
    </Suspense>
  )
}
