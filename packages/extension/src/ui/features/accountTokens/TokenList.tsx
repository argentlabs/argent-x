import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import { Token } from "../../../shared/token/type"
import { useTokensInNetwork } from "../../../shared/tokens.state"
import { useAppState } from "../../app.state"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { NewTokenButton } from "./NewTokenButton"
import { TokenListItemVariant } from "./TokenListItem"
import { TokenListItemContainer } from "./TokenListItemContainer"

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
                  ? routes.sendToken(token.address)
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
