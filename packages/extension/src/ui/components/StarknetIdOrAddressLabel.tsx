import type { TextProps } from "@chakra-ui/react"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import type { FC } from "react"
import { useStarknetId } from "../services/useStarknetId"
import { L1 } from "@argent/x-ui"
import { formatTruncatedAddress } from "@argent/x-shared"

export interface StarknetIdOrAddressLabelProps extends TextProps {
  account?: BaseWalletAccount
}

export const StarknetIdOrAddressLabel: FC<StarknetIdOrAddressLabelProps> = ({
  account,
  ...rest
}) => {
  const { data: starknetId } = useStarknetId(account)
  if (!account) {
    return null
  }

  return (
    <L1 color="white.50" {...rest}>
      {starknetId ?? formatTruncatedAddress(account.address)}
    </L1>
  )
}
