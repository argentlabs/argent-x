import { Empty, CellStack, iconsDeprecated } from "@argent/x-ui"
import { noop } from "lodash-es"
import { FC } from "react"
import { WalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import {
  multisigView,
  isSignerInMultisigView,
} from "../multisig/multisig.state"
import { AccountBannersContainer } from "./AccountBannersContainer"
import { TokenList } from "./TokenList"
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { AddFundsDialogProvider } from "./useAddFundsDialog"

const { MultisigIcon } = iconsDeprecated

export interface AccountBannersAndTokenListContainerProps {
  account: WalletAccount
}

export const AccountBannersAndTokenListContainer: FC<
  AccountBannersAndTokenListContainerProps
> = ({ account }) => {
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
        icon={<MultisigIcon color="neutrals.500" />}
        title="You can no longer use this account"
      />
    )
  }
  return (
    <CellStack pt={0} flex={1}>
      <AccountBannersContainer account={account} />
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
