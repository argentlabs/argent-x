import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { NewTokenButton } from "./NewTokenButton"
import { TokenListItemVariant } from "./TokenListItem"
import { TokenListItemMulticall } from "./TokenListItemMulticall"
import { useTokensInNetwork } from "./tokens.state"

interface TokenListMulticallProps {
  showNewTokenButton?: boolean
  showTokenSymbol?: boolean
  variant?: TokenListItemVariant
  navigateToSend?: boolean
}

export const TokenListMulticall: FC<TokenListMulticallProps> = ({
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
  return (
    <Suspense fallback={<NewTokenButton isLoading />}>
      {tokensInNetwork.map((token) => (
        <TokenListItemMulticall
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
  )
}
