import type { ButtonProps } from "@chakra-ui/react"
import type { FC } from "react"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { AddressCopyButton } from "./AddressCopyButton"
import { useStarknetId } from "../services/useStarknetId"
import { StarknetIdCopyButton } from "./StarknetIdCopyButton"

export interface StarknetIdOrAddressCopyButtonProps extends ButtonProps {
  account?: BaseWalletAccount
}

export const StarknetIdOrAddressCopyButton: FC<
  StarknetIdOrAddressCopyButtonProps
> = ({ account, ...rest }) => {
  const { data: starknetId } = useStarknetId(account)
  if (!account) {
    return null
  }
  if (starknetId) {
    return (
      <StarknetIdCopyButton
        starknetId={starknetId}
        address={account.address}
        {...rest}
      />
    )
  }
  return <AddressCopyButton address={account.address} {...rest} />
}
