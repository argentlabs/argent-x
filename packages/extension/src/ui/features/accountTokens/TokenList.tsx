import { FC, Suspense, useMemo } from "react"

import { useAppState } from "../../app.state"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { useCurrentPathnameWithQuery } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { NewTokenButton } from "./NewTokenButton"
import { TokenListItemVariant } from "./TokenListItem"
import { TokenListItemContainer } from "./TokenListItemContainer"
import { useTokensInNetwork } from "./tokens.state"
import { useAddFundsDialogSend } from "./useAddFundsDialog"
import { Token } from "../../../shared/token/__new/types/token.model"
import { sortBy } from "lodash-es"
import { num } from "starknet"

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
  const { switcherNetworkId } = useAppState()
  const tokensInNetwork = useTokensInNetwork(switcherNetworkId)
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

  const tokens = useMemo(
    () =>
      sortBy(tokenList ?? tokensInNetwork, (token) =>
        token.id ? BigInt(token.id) : num.toBigInt(token.address),
      ),
    [tokenList, tokensInNetwork],
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
