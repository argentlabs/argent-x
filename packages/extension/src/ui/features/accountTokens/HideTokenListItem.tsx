import { H5, icons, P2, P3, TokenIcon } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import { Flex, Tooltip } from "@chakra-ui/react"
import type { FC } from "react"

import { prettifyCurrencyValue } from "@argent/x-shared"
import type { TokenWithBalanceAndPrice } from "../../../shared/token/__new/types/tokenPrice.model"
import { prettifyTokenBalance } from "../../../shared/token/prettifyTokenBalance"
import { CustomButtonCell } from "../../components/CustomButtonCell"

const { HideSecondaryIcon, ShowSecondaryIcon } = icons

export type TokenListItemVariant = "default" | "no-currency"

export interface HideTokenListItemProps extends ButtonProps {
  token: TokenWithBalanceAndPrice
  onToggleHide: () => void
}

export const HideTokenListItem: FC<HideTokenListItemProps> = ({
  token,
  onToggleHide,
}) => {
  const { name, iconUrl } = token
  const displayBalance = prettifyTokenBalance(token)
  const displayCurrencyValue = prettifyCurrencyValue(
    token.usdValue,
    undefined,
    {
      allowLeadingZerosInDecimalPart: false,
    },
  )

  return (
    <CustomButtonCell
      w="full"
      cursor={"default"}
      bg={"surface-elevated"}
      opacity={token.hidden ? 0.7 : 1}
      _hover={{ bg: "surface-elevated" }}
    >
      <TokenIcon size={9} url={iconUrl} name={name} />
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={4}
        overflow={"hidden"}
      >
        <Tooltip label={name} openDelay={1500} placement="top">
          <Flex direction="column" gap={0.5} overflow="hidden">
            <H5 overflow="hidden" textOverflow={"ellipsis"}>
              {name}
            </H5>
            <P3
              color="text-secondary"
              fontWeight="semibold"
              overflow="hidden"
              textOverflow="ellipsis"
              data-testid={`${token.symbol}-balance`}
            >
              {displayBalance} &bull; {displayCurrencyValue}
            </P3>
          </Flex>
        </Tooltip>
        {!token.showAlways && (
          <Flex
            borderRadius="full"
            color="text-secondary"
            cursor="pointer"
            _hover={{ bg: "surface-default" }}
          >
            <P2 p="2" onClick={onToggleHide}>
              {token.hidden ? (
                <HideSecondaryIcon
                  data-testid={`show-token-button-${token.symbol}`}
                />
              ) : (
                <ShowSecondaryIcon
                  data-testid={`hide-token-button-${token.symbol}`}
                  color={"icon-background-brand"}
                />
              )}
            </P2>
          </Flex>
        )}
      </Flex>
    </CustomButtonCell>
  )
}
