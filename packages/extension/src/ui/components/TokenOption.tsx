import { FC, ReactNode } from "react"

import { H6, P4 } from "@argent/ui"
import { Flex, Img } from "@chakra-ui/react"

interface TokenOptionProps {
  name: string
  symbol: string
  imageSrc: string
  balance: ReactNode
  ccyBalance: ReactNode

  onClick?: () => void
  disabled?: boolean
}

export const TokenOption: FC<TokenOptionProps> = ({
  balance,
  ccyBalance,
  imageSrc,
  name,
  symbol,
  onClick,
  disabled,
}) => {
  return (
    <Flex
      gap={3}
      alignItems="center"
      p={4}
      borderRadius={8}
      onClick={onClick}
      cursor={disabled ? "auto" : "pointer"}
      pointerEvents={disabled ? "none" : "auto"}
      bg="neutrals.800"
      opacity={disabled ? 0.4 : 1}
      boxShadow="menu"
      _hover={{ bg: "neutrals.700" }}
    >
      <Img
        borderRadius="50%"
        bg="neutrals.700"
        src={imageSrc}
        alt={name}
        height="32px"
        width="32px"
      />
      <Flex grow={1} direction="column" justifySelf="flex-start">
        <H6>{name}</H6>
        <P4 fontWeight="bold" color="neutrals.300">
          {symbol}
        </P4>
      </Flex>
      <Flex direction="column" justifySelf="flex-end" textAlign="right">
        <H6>{balance}</H6>
        <P4 fontWeight="bold" color="neutrals.300">
          {ccyBalance}
        </P4>
      </Flex>
    </Flex>
  )
}
