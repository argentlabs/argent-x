import type { FC } from "react"
import type { TokenWithBalanceAndPrice } from "../../../shared/token/__new/types/tokenPrice.model"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { clientTokenService } from "../../services/tokens"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useAllTokensWithBalances } from "../../views/tokenPrices"
import { HiddenAndSpamTokensScreen } from "./HiddenAndSpamTokensScreen"

export const HiddenAndSpamTokensScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()

  const selectedAccount = useView(selectedAccountView)
  const allTokens = useAllTokensWithBalances(selectedAccount)

  const onToggleHiddenFlag = async (token: TokenWithBalanceAndPrice) => {
    await clientTokenService.toggleHideToken(token, !token.hidden)
  }

  return (
    <HiddenAndSpamTokensScreen
      onBack={onBack}
      onToggleHiddenFlag={onToggleHiddenFlag}
      tokens={allTokens}
    />
  )
}
