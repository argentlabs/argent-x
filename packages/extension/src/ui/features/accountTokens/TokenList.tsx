import { CellStack } from "@argent/ui"
import { Button, icons } from "@argent/ui"
import { ComponentProps, FC, PropsWithChildren } from "react"
import { Link, useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { TokenListItemContainer, TokenListItemVariant } from "./TokenListItem"
import { TokenDetailsWithBalance } from "./tokens.state"

const { AddIcon } = icons

interface TokenListProps extends PropsWithChildren {
  showTitle?: boolean
  showTokenSymbol?: boolean
  variant?: TokenListItemVariant
  tokenList: TokenDetailsWithBalance[]
  isValidating: boolean
  navigateToSend?: boolean
}

export const TokenList: FC<TokenListProps> = ({
  showTokenSymbol = false,
  isValidating,
  variant,
  tokenList,
  navigateToSend = false,
  children,
}) => {
  const navigate = useNavigate()
  if (!tokenList) {
    return null
  }
  return (
    <CellStack>
      {tokenList.map((token) => (
        <TokenListItemContainer
          key={token.address}
          token={token}
          isLoading={isValidating}
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
      {children}
    </CellStack>
  )
}

export const NewTokenButton: FC<ComponentProps<typeof Button>> = (props) => {
  return (
    <Button
      size={"sm"}
      colorScheme={"transparent"}
      mx={"auto"}
      as={Link}
      to={routes.newToken()}
      leftIcon={<AddIcon />}
      color="neutrals.400"
      loadingText={"Fetching tokens"}
      {...props}
    >
      New token
    </Button>
  )
}
