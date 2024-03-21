import { FC, Suspense, useMemo } from "react"

import { Token } from "../../../shared/token/__new/types/token.model"
import { equalToken } from "../../../shared/token/__new/utils"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { useCurrentPathnameWithQuery } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { sortedTokensWithBalances } from "../../views/tokenPrices"
import { NewTokenButton } from "./NewTokenButton"
import { TokenListItemVariant } from "./TokenListItem"
import { TokenListItemContainer } from "./TokenListItemContainer"
import { useAddFundsDialogSend } from "./useAddFundsDialog"

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
  const addFundsDialogSend = useAddFundsDialogSend()

  const onClick = (token: Token) => {
    if (onItemClick) {
      return onItemClick(token)
    }

    addFundsDialogSend({
      tokenAddress: token.address,
      returnTo,
    })
  }
  const sortedTokensWithBalance = useView(sortedTokensWithBalances(account))

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
    <ErrorBoundary
      fallback={
        <ErrorBoundaryFallbackWithCopyError
          message={"Sorry, an error occurred fetching tokens"}
        />
      }
    >
      <Suspense fallback={<NewTokenButton isLoading />}>
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
      </Suspense>
    </ErrorBoundary>
  )
}
