import { ButtonProps } from "@chakra-ui/react"
import { FC } from "react"
import { BaseWalletAccount } from "../../shared/wallet.model"
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
