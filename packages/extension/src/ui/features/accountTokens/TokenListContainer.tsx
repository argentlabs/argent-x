import { CellStack, Empty, icons } from "@argent/x-ui"
import { noop } from "lodash-es"
import type { FC } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import {
  multisigView,
  isSignerInMultisigView,
} from "../multisig/multisig.state"
import { TokenList } from "./TokenList"
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { AddFundsDialogProvider } from "./useAddFundsDialog"

const { MultisigSecondaryIcon } = icons

export interface TokenListContainerProps {
  account: WalletAccount
}

export const TokenListContainer: FC<TokenListContainerProps> = ({
  account,
}) => {
  const multisig = useView(multisigView(account))
  const signerIsInMultisig = useView(isSignerInMultisigView(account))
  const isMultisig = Boolean(multisig)
  const showTokensAndBanners = isMultisig ? signerIsInMultisig : true

  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const tokenListVariant = currencyDisplayEnabled ? "default" : "no-currency"
  const onItemClick = multisig?.needsDeploy ? noop : undefined

  if (!showTokensAndBanners) {
    return (
      <Empty
        icon={<MultisigSecondaryIcon />}
        title="You can no longer use this account"
      />
    )
  }
  return (
    <CellStack pt={0} flex={1}>
      <AddFundsDialogProvider account={account}>
        <TokenList
          variant={tokenListVariant}
          showNewTokenButton
          onItemClick={onItemClick}
        />
      </AddFundsDialogProvider>
    </CellStack>
  )
}
