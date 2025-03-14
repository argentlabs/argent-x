import type { FC } from "react"
import { useCallback, useMemo } from "react"

import type { Token } from "../../../shared/token/__new/types/token.model"
import { equalToken } from "../../../shared/token/__new/utils"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { NewTokenButton } from "./NewTokenButton"
import type { TokenListItemVariant } from "./TokenListItem"
import { TokenListItemContainer } from "./TokenListItemContainer"
import { useAddFundsDialogSend } from "./useAddFundsDialog"
import { useSortedTokensWithBalances } from "../../views/tokenPrices"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import { ENABLE_TOKEN_DETAILS } from "../../../shared/ui/constants"

interface TokenListProps {
  tokenList?: Token[]
  showNewTokenButton?: boolean
  showTokenSymbol?: boolean
  variant?: TokenListItemVariant
  onItemClick?: (token: Token) => void
}

export const TokenList: FC<TokenListProps> = ({
  tokenList,
  showNewTokenButton = true,
  showTokenSymbol = false,
  variant,
  onItemClick,
}) => {
  const account = useView(selectedAccountView)
  const returnTo = useCurrentPathnameWithQuery()
  const navigate = useNavigate()
  const addFundsDialogSend = useAddFundsDialogSend()
  const onClick = useCallback(
    (token: Token) => {
      if (onItemClick) {
        return onItemClick(token)
      }
      if (ENABLE_TOKEN_DETAILS) {
        navigate(routes.tokenDetails(token.address, token.networkId, returnTo))
      } else {
        addFundsDialogSend({
          tokenAddress: token.address,
          returnTo,
        })
      }
    },
    [addFundsDialogSend, navigate, onItemClick, returnTo],
  )

  const sortedTokensWithBalance = useSortedTokensWithBalances(account)

  const tokens = useMemo(
    () =>
      tokenList
        ? sortedTokensWithBalance.filter((token) =>
            tokenList.some((t) => equalToken(t, token)),
          )
        : sortedTokensWithBalance,
    [tokenList, sortedTokensWithBalance],
  )

  if (!account) {
    return null
  }

  return (
    <>
      {tokens.map((token) => (
        <TokenListItemContainer
          key={token.address}
          account={account}
          token={token}
          variant={variant}
          showTokenSymbol={showTokenSymbol}
          onClick={() => onClick(token)}
        />
      ))}
      {showNewTokenButton && <NewTokenButton />}
    </>
  )
}
