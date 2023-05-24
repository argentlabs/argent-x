import { H3, P3 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { ConfirmScreen } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"

interface UpgradeScreenProps {
  onUpgrade: () => void
  onCancel: () => void
}

export const UpgradeScreen: FC<UpgradeScreenProps> = ({
  onUpgrade,
  onCancel,
}) => {
  return (
    <ConfirmScreen
      confirmButtonText="Upgrade"
      rejectButtonText="Cancel"
      onSubmit={onUpgrade}
      onReject={onCancel}
    >
      <Flex flexDirection={"column"} flex={1} gap={4}>
        <H3>Upgrade Wallet</H3>
        <P3>
          You will upgrade your wallet implementation to use the latest features
          and security.
        </P3>
        <P3>
          This upgrade is required due to network and account contract changes.
          We expect these kind of upgrades to be less frequent as the network
          matures.
        </P3>
      </Flex>
    </ConfirmScreen>
  )
}
