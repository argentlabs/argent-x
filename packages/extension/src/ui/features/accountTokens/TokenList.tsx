import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import { Token } from "../../../shared/token/type"
import { useAppState } from "../../app.state"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { NewTokenButton } from "./NewTokenButton"
import { TokenListItemVariant } from "./TokenListItem"
import { TokenListItemContainer } from "./TokenListItemContainer"
import { useTokensInNetwork } from "./tokens.state"

interface TokenListProps {
  tokenList?: Token[]
  showNewTokenButton?: boolean
  showTokenSymbol?: boolean
  variant?: TokenListItemVariant
  navigateToSend?: boolean
}

export const TokenList: FC<TokenListProps> = ({
  tokenList,
  showNewTokenButton = true,
  showTokenSymbol = false,
  variant,
  navigateToSend = false,
}) => {
  const navigate = useNavigate()
  const account = useSelectedAccount()
  const { switcherNetworkId } = useAppState()
  const tokensInNetwork = useTokensInNetwork(switcherNetworkId)
  const returnTo = useCurrentPathnameWithQuery()

  if (!account) {
    return null
  }
  const tokens = tokenList || tokensInNetwork
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
            onClick={() => {
              navigate(
                navigateToSend
                  ? routes.sendToken(token.address, returnTo)
                  : routes.token(token.address),
              )
            }}
          />
        ))}
        {showNewTokenButton && <NewTokenButton />}
      </Suspense>
    </ErrorBoundary>
  )
}
