import { FC, ReactNode } from "react"

import { Button, H6, L2, P4 } from "@argent/x-ui"
import { Flex, Img, Spinner } from "@chakra-ui/react"

interface TokenOptionProps {
  name: string
  symbol: string
  imageSrc: string
  balance: ReactNode
  ccyBalance?: string
  onTokenSelect?: () => void
  disabled?: boolean
  errorText?: string
  requiresTxV3Upgrade?: boolean
  onEnableTxV3?: () => void
  ref?: React.Ref<HTMLDivElement>
  upgradeLoading?: boolean
}

export const TokenOption: FC<TokenOptionProps> = ({
  balance,
  ccyBalance,
  imageSrc,
  name,
  symbol,
  onTokenSelect,
  disabled,
  errorText,
  requiresTxV3Upgrade = false,
  onEnableTxV3,
  ref,
  upgradeLoading = false,
}) => {
  return (
    <Flex
      gap={3}
      alignItems="center"
      p={4}
      borderRadius={8}
      onClick={!disabled ? onTokenSelect : undefined}
      cursor={disabled ? "auto" : "pointer"}
      bg="neutrals.800"
      boxShadow="menu"
      _hover={!disabled ? { bg: "neutrals.700" } : undefined}
      ref={ref}
    >
      <Img
        borderRadius="50%"
        bg="neutrals.700"
        src={imageSrc}
        alt={name}
        height="32px"
        width="32px"
      />
      <Flex justifyContent="space-between" w="full" align="center">
        <Flex grow={1} flexWrap="nowrap" direction="column">
          <H6 whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {name === "Ether" ? "Ethereum" : name}
          </H6>
          <P4
            data-testid={`fee-token-${symbol}`}
            fontWeight="bold"
            color="neutrals.300"
          >
            {symbol}
          </P4>
        </Flex>
        <Flex direction="column" textAlign="right">
          {!requiresTxV3Upgrade ? (
            <>
              <H6 data-testid={`fee-token-${symbol}-balance`}>{balance}</H6>
              {disabled ? (
                <L2 color="error.400" whiteSpace="nowrap">
                  {errorText}
                </L2>
              ) : (
                ccyBalance && (
                  <P4 fontWeight="bold" color="neutrals.300">
                    {ccyBalance}
                  </P4>
                )
              )}
            </>
          ) : (
            <Button
              size="2xs"
              bgColor="neutrals.600"
              onClick={(e) => {
                e.stopPropagation()
                if (upgradeLoading) {
                  return
                }
                onEnableTxV3?.()
              }}
            >
              {upgradeLoading ? <Spinner size="xs" /> : "Enable"}
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
